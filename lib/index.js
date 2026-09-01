// dsh-balance-dock — Host 半边 (v1.1.0)
// 静态 Host 插件是普通 Node 模块：直接使用 Node 原生 fetch/fs/process，不再依赖子进程。
// 提供三条同源 HTTP 路由（客户端浏览器 fetch 调用）：
//   GET /dsh-balance/balance   → DeepSeek 账户余额（credentials + Node fetch）
//   GET /dsh-balance/spend     → 当前会话 token 用量与花费估算（llm/stream 拦截 + 持久日志折叠）
//   GET /dsh-balance/config    → 客户端渲染所需的可配置项
// 配置：$DSH_HOME/dsh-balance-dock.json（缺失时自动生成默认配置）
import { readFileSync, writeFileSync } from 'node:fs'

const BALANCE_URL = 'https://api.deepseek.com/user/balance'

// ── 配置（默认值；用户可在 $DSH_HOME/dsh-balance-dock.json 覆盖）──
const DEFAULT_CONFIG = {
  segmentBase: 50,       // 进度条每段金额
  redThreshold: 15,      // 最右段剩余低于该值时变红
  warnLow: 10,           // 余额低于该值黄灯
  warnDanger: 3,         // 余额低于该值红灯
  fxCny: 7.1,            // 人民币近似汇率
  lang: 'zh-CN',         // 界面语言：zh-CN / zh-TW / en / de / ja / ko / ru
  currency: 'CNY',       // 显示货币（兑人民币）：CNY / TWD / USD / EUR / JPY / KRW / RUB
  rates: {               // 内置兜底汇率（1 人民币兑各货币）；自动更新失败时使用
    CNY: 1,
    USD: 0.14,
    EUR: 0.13,
    JPY: 21.5,
    KRW: 190.0,
    RUB: 12.5,
    TWD: 4.5,
  },
  showRows: {            // 卡片各信息行是否显示（设置弹窗勾选控制）
    last: true,          // 本次用量
    lastModel: true,     // 本次使用模型
    total: true,         // 本会话累计
    calls: true,         // 本会话累计调用模型次数
  },
  prices: {              // 官方美元价格（每百万 token）
    'deepseek-chat': { in: 0.28, inHit: 0.028, out: 0.42 },
    'deepseek-reasoner': { in: 0.55, inHit: 0.14, out: 2.19 },
  },
}

const configPath = () => {
  const home = process.env.DSH_HOME
    || (process.env.USERPROFILE ? process.env.USERPROFILE + '\\.dsh' : null)
  return home === null ? null : home + '\\dsh-balance-dock.json'
}

function loadConfig() {
  const path = configPath()
  if (path === null) return DEFAULT_CONFIG
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    const merged = { ...DEFAULT_CONFIG, ...(parsed || {}) }
    merged.prices = { ...DEFAULT_CONFIG.prices, ...((parsed && parsed.prices) || {}) }
    return merged
  } catch {
    // 缺失或损坏：写一份默认配置，便于用户直接编辑
    try { writeFileSync(path, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8') } catch {}
    return DEFAULT_CONFIG
  }
}

const offPeakFactor = (date) => {
  const t = date.getUTCHours() * 60 + date.getUTCMinutes()
  return (t >= 990 || t < 30) ? 0.5 : 1 // 16:30-00:30 UTC 为谷时段，5 折
}
const round = (v, n) => { const p = Math.pow(10, n); return Math.round(v * p) / p }

export default {
  inject: ['timer', 'webServer'],
  apply(ctx) {
    let cfgCache = { at: 0, value: null }
    const config = () => {
      const now = Date.now()
      if (cfgCache.value === null || now - cfgCache.at > 10000) {
        cfgCache = { at: now, value: loadConfig() }
      }
      return cfgCache.value
    }

    // ── 按会话累积"最近一次调用"（实时）──
    const usageBySession = new Map()
    const MAX_SESSIONS = 256
    const estimateCost = (model, u, date) => {
      const cfg = config()
      const p = cfg.prices[model] || cfg.prices['deepseek-chat']
      const f = offPeakFactor(date)
      const usd = ((u.input * p.in) + (u.cacheRead * p.inHit) + (u.cacheWrite * p.in) + (u.output * p.out)) / 1e6 * f
      return { usd, cny: usd * cfg.fxCny }
    }
    const recordUsage = (sid, usage, model, ts) => {
      let rec = usageBySession.get(sid)
      if (rec === undefined) {
        if (usageBySession.size >= MAX_SESSIONS) usageBySession.delete(usageBySession.keys().next().value)
        rec = { last: null }
        usageBySession.set(sid, rec)
      }
      const inTok = usage.inputTokens || 0
      const outTok = usage.outputTokens || 0
      const hitTok = usage.cacheReadTokens || 0
      const writeTok = usage.cacheWriteTokens || 0
      const { usd, cny } = estimateCost(model, { input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok }, new Date(ts))
      rec.last = {
        model,
        input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok,
        estUsd: round(usd, 4), estCny: round(cny, 4), at: ts,
      }
    }
    ctx.on('llm/stream', (options, next) => {
      const base = next()
      const sid = options.sessionId
      const model = options.model
      const ts = Date.now()
      return (async function* () {
        for await (const chunk of base) {
          if (sid !== undefined && chunk.type === 'usage') recordUsage(sid, chunk.usage, model, ts)
          yield chunk
        }
      })()
    })
    ctx.on('session/disposed', (session) => { usageBySession.delete(session.id) })

    // ── 本会话累计：从持久会话日志折叠（跨重启保留，按模型拆分）──
    const foldCache = new Map()
    const FOLD_TTL = 15000
    const FOLD_LIMIT = 512
    async function foldSession(sid) {
      const now = Date.now()
      const hit = foldCache.get(sid)
      if (hit !== undefined && now - hit.at < FOLD_TTL) return hit
      const total = { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estUsd: 0, estCny: 0, models: {} }
      let last = null
      const sq = ctx.get('sessionQuery')
      if (sq !== undefined) {
        try {
          const snapshot = await sq.readSession(sid)
          const events = snapshot && snapshot.events ? snapshot.events : []
          for (const e of events) {
            if (!e || e.type !== 'assistant/message' || !e.data || !e.data.usage) continue
            const u = e.data.usage
            const inTok = typeof u.inputTokens === 'number' ? u.inputTokens : 0
            const outTok = typeof u.outputTokens === 'number' ? u.outputTokens : 0
            const hitTok = typeof u.cacheReadTokens === 'number' ? u.cacheReadTokens : 0
            const writeTok = typeof u.cacheWriteTokens === 'number' ? u.cacheWriteTokens : 0
            const src = e.data.message && e.data.message.source
            const model = src && typeof src.model === 'string' ? src.model : 'deepseek-chat'
            const ts = typeof e.time === 'number' ? e.time : now
            total.calls += 1
            total.input += inTok; total.output += outTok; total.cacheRead += hitTok; total.cacheWrite += writeTok
            const { usd, cny } = estimateCost(model, { input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok }, new Date(ts))
            total.estUsd += usd; total.estCny += cny
            const m = total.models[model] || (total.models[model] = { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estUsd: 0, estCny: 0 })
            m.calls += 1; m.input += inTok; m.output += outTok; m.cacheRead += hitTok; m.cacheWrite += writeTok
            m.estUsd += usd; m.estCny += cny
            last = { model, input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok, estUsd: round(usd, 4), estCny: round(cny, 4), at: ts }
          }
        } catch (e) { /* 读日志失败时返回当前已知数据 */ }
      }
      const result = { total, last }
      foldCache.set(sid, { at: now, total, last })
      if (foldCache.size > FOLD_LIMIT) foldCache.delete(foldCache.keys().next().value)
      return result
    }

    const emptyUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, estUsd: 0, estCny: 0 }

    // ── 余额查询：credentials + Node 原生 fetch（无子进程，无 EINVAL 风险）──
    async function queryBalance() {
      const credentials = ctx.get('credentials')
      if (credentials === undefined) return { ok: false, code: 'NO_CREDENTIALS_SERVICE', error: 'credentials 服务未挂载' }
      const hit = await credentials.resolve('DEEPSEEK_API_KEY')
      if (hit === undefined) return { ok: false, code: 'NO_API_KEY', error: '未配置 DEEPSEEK_API_KEY：请在 设置 → Models 中填写 DeepSeek API Key' }
      try {
        const res = await fetch(BALANCE_URL, {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + hit.value, Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        })
        const text = await res.text()
        let parsed
        try { parsed = JSON.parse(text) } catch (e) { return { ok: false, code: 'BAD_RESPONSE', error: '余额接口返回非 JSON：' + text.slice(0, 200) } }
        if (!res.ok) {
          const detail = parsed && parsed.error ? String(parsed.error.message || parsed.error.type || JSON.stringify(parsed.error)) : 'HTTP ' + res.status
          return { ok: false, code: 'HTTP_' + res.status, error: '余额接口 HTTP ' + res.status + '：' + detail }
        }
        if (parsed && parsed.error) return { ok: false, code: 'API_ERROR', error: String(parsed.error.message || parsed.error.type || JSON.stringify(parsed.error)) }
        const infos = Array.isArray(parsed && parsed.balance_infos) ? parsed.balance_infos : []
        const info = infos.find((i) => i && i.currency === 'CNY') || infos[0]
        if (!info) return { ok: false, code: 'BAD_RESPONSE', error: '余额接口未返回 balance_infos（原始响应：' + text.slice(0, 200) + '）' }
        return {
          ok: true,
          currency: String(info.currency || 'CNY'),
          total: Number(info.total_balance) || 0,
          granted: Number(info.granted_balance) || 0,
          toppedUp: Number(info.topped_up_balance) || 0,
          available: parsed.is_available !== false,
          ts: Date.now(),
        }
      } catch (e) {
        return { ok: false, code: 'FETCH_FAILED', error: String((e && e.message) || e) }
      }
    }

    // ── 汇率：免费公开 API 自动更新（普通 HTTP，不消耗模型 token），6 小时缓存 ──
    let ratesCache = { at: 0, rates: null, source: 'none' }
    const RATE_TTL = 6 * 60 * 60 * 1000
    const RATE_CURRENCIES = ['USD', 'EUR', 'JPY', 'KRW', 'RUB', 'TWD']
    async function currentRates() {
      const now = Date.now()
      if (ratesCache.rates !== null && now - ratesCache.at < RATE_TTL) return ratesCache
      const cfg = config()
      const fallback = { CNY: 1 }
      for (const c of RATE_CURRENCIES) {
        const v = cfg.rates && cfg.rates[c]
        fallback[c] = typeof v === 'number' && v > 0 ? v : 1
      }
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/CNY', { signal: AbortSignal.timeout(12000) })
        if (res.ok) {
          const data = await res.json()
          if (data && data.result === 'success' && data.rates) {
            const rates = { CNY: 1 }
            for (const c of RATE_CURRENCIES) {
              if (typeof data.rates[c] === 'number' && data.rates[c] > 0) rates[c] = data.rates[c]
            }
            ratesCache = { at: now, rates, source: 'live' }
            return ratesCache
          }
        }
      } catch (e) { /* 拉取失败走兜底 */ }
      ratesCache = { at: now, rates: fallback, source: 'fallback' }
      return ratesCache
    }

    // ── 位置守护弹窗多语言 ──
    const GUARD_I18N = {
      'zh-CN': { header: '余额卡片位置提醒', question: '检测到有其他插件注册到了侧边栏底部区域，可能挤占余额卡片的显示位置。是否允许？', detail: '允许 = 新插件可占用该区域；取消 = 保持余额卡片优先。', allow: '允许', keep: '取消' },
      'zh-TW': { header: '餘額卡片位置提醒', question: '偵測到有其他外掛註冊到了側邊欄底部區域，可能擠佔餘額卡片的顯示位置。是否允許？', detail: '允許 = 新外掛可佔用該區域；取消 = 保持餘額卡片優先。', allow: '允許', keep: '取消' },
      'en': { header: 'Balance card position alert', question: 'Another plugin registered into the sidebar footer area and may displace the balance card. Allow it?', detail: 'Allow = the new plugin may use the area; Cancel = keep the balance card first.', allow: 'Allow', keep: 'Cancel' },
      'de': { header: 'Position der Guthabenkarte', question: 'Ein anderes Plugin hat sich im Seitenleisten-Fußbereich registriert und könnte die Guthabenkarte verdrängen. Erlauben?', detail: 'Erlauben = das neue Plugin darf den Bereich nutzen; Abbrechen = Guthabenkarte behält Priorität.', allow: 'Erlauben', keep: 'Abbrechen' },
      'ja': { header: '残高カード位置の警告', question: '別のプラグインがサイドバー下部に登録され、残高カードを押しのける可能性があります。許可しますか？', detail: '許可 = 新しいプラグインが領域を使用可能。キャンセル = 残高カードを優先。', allow: '許可', keep: 'キャンセル' },
      'ko': { header: '잔액 카드 위치 알림', question: '다른 플러그인이 사이드바 하단에 등록되어 잔액 카드를 밀어낼 수 있습니다. 허용하시겠습니까?', detail: '허용 = 새 플러그인이 영역을 사용 가능. 취소 = 잔액 카드를 우선 유지.', allow: '허용', keep: '취소' },
      'ru': { header: 'Предупреждение о позиции карточки', question: 'Другой плагин зарегистрировался в нижней части боковой панели и может вытеснить карточку баланса. Разрешить?', detail: 'Разрешить = новый плагин может использовать область; Отмена = сохранить карточку приоритетной.', allow: 'Разрешить', keep: 'Отмена' },
    }

    // ── webServer 路由 ──
    const ws = ctx.get('webServer')
    if (ws !== undefined) {
      const sendJson = (res, payload, status = 200) => {
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(payload))
      }
      ws.register({ kind: 'exact', path: '/dsh-balance/balance', handler: async (req, res) => {
        try { sendJson(res, await queryBalance()) } catch (e) { sendJson(res, { ok: false, code: 'ROUTE_ERROR', error: String((e && e.message) || e) }, 500) }
      } })
      ws.register({ kind: 'exact', path: '/dsh-balance/spend', handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://dsh.local')
          const sid = url.searchParams.get('session')
          const key = sid && sid.length > 0 ? sid : null
          let last = null
          let total = null
          if (key !== null) {
            const rec = usageBySession.get(key)
            last = (rec && rec.last) || null
            const folded = await foldSession(key)
            total = folded.total
            if (last === null) last = folded.last
          }
          const models = {}
          if (total) {
            for (const mk of Object.keys(total.models)) {
              const m = total.models[mk]
              models[mk] = {
                calls: m.calls,
                inputTokens: m.input, outputTokens: m.output,
                cacheReadTokens: m.cacheRead, cacheWriteTokens: m.cacheWrite,
                estUsd: round(m.estUsd, 4), estCny: round(m.estCny, 2),
              }
            }
          }
          sendJson(res, {
            ok: true,
            sessionId: key,
            last: last ? {
              model: last.model || null,
              inputTokens: last.input, outputTokens: last.output,
              cacheReadTokens: last.cacheRead, cacheWriteTokens: last.cacheWrite,
              estUsd: last.estUsd, estCny: last.estCny, at: last.at,
            } : { model: null, ...emptyUsage, at: 0 },
            total: total ? {
              calls: total.calls,
              inputTokens: total.input, outputTokens: total.output,
              cacheReadTokens: total.cacheRead, cacheWriteTokens: total.cacheWrite,
              estUsd: round(total.estUsd, 4), estCny: round(total.estCny, 2),
              models,
            } : { calls: 0, ...emptyUsage, models: {} },
          })
        } catch (e) { sendJson(res, { ok: false, code: 'ROUTE_ERROR', error: String((e && e.message) || e) }, 500) }
      } })
      ws.register({ kind: 'exact', path: '/dsh-balance/config', handler: async (req, res) => {
        try {
          if (req.method === 'POST') {
            let raw = ''
            for await (const chunk of req) raw += chunk
            let parsed
            try { parsed = JSON.parse(raw || '{}') } catch (e) { sendJson(res, { ok: false, error: '配置 JSON 解析失败' }, 400); return }
            if (typeof parsed !== 'object' || parsed === null) { sendJson(res, { ok: false, error: '配置必须是对象' }, 400); return }
            const merged = { ...DEFAULT_CONFIG, ...parsed }
            merged.prices = { ...DEFAULT_CONFIG.prices, ...((parsed && parsed.prices) || {}) }
            const path = configPath()
            if (path === null) { sendJson(res, { ok: false, error: '无法定位配置路径' }, 500); return }
            writeFileSync(path, JSON.stringify(merged, null, 2), 'utf8')
            cfgCache = { at: 0, value: null } // 立即使缓存失效
            sendJson(res, { ok: true, config: merged })
            return
          }
          const cfg = config()
          sendJson(res, { config: cfg, defaults: DEFAULT_CONFIG })
        } catch (e) { sendJson(res, { code: 'CONFIG_ERROR', error: String((e && e.message) || e) }, 500) }
      } })
      ws.register({ kind: 'exact', path: '/dsh-balance/rates', handler: async (req, res) => {
        try {
          const r = await currentRates()
          sendJson(res, { ok: true, rates: r.rates, source: r.source, updatedAt: r.at })
        } catch (e) { sendJson(res, { ok: false, error: String((e && e.message) || e) }, 500) }
      } })
      ws.register({ kind: 'exact', path: '/dsh-balance/guard-ask', handler: async (req, res) => {
        const uq = ctx.get('userQuestions')
        if (uq === undefined) { sendJson(res, { choice: 'unavailable', error: '提问服务不可用' }); return }
        try {
          const url = new URL(req.url ?? '/', 'http://dsh.local')
          const lang = url.searchParams.get('lang') || 'zh-CN'
          const g = GUARD_I18N[lang] || GUARD_I18N['zh-CN']
          const answer = await Promise.race([
            uq.ask({
              questions: [{
                id: 'balance-guard',
                header: g.header,
                question: g.question,
                detail: g.detail,
                options: [{ label: g.allow }, { label: g.keep }],
              }],
            }),
            ctx.timeout(120000).then(() => ({ answers: [{ id: 'balance-guard', selected: [] }] })),
          ])
          const item = answer && answer.answers && answer.answers[0]
          const selected = item && item.selected && item.selected.length > 0 ? item.selected[0] : ''
          sendJson(res, { choice: selected === g.allow ? 'allow' : selected === g.keep ? 'keep' : 'none' })
        } catch (e) {
          sendJson(res, { choice: 'none', error: String((e && e.message) || e) })
        }
      } })
    }
  },
}
