// dsh-balance-dock — Host 半边
// 提供三条 HTTP 路由（同源浏览器 fetch 调用）：
//   GET  /dsh-balance/balance     → DeepSeek 账户余额（credentials + subprocess）
//   GET  /dsh-balance/spend       → 当前会话 token 用量与花费估算（llm/stream 拦截累积）
//   GET  /dsh-balance/guard-ask   → 位置守护弹窗（userQuestions.ask）
export default {
  inject: ['timer', 'webServer'],
  apply(ctx) {
    const BALANCE_URL = 'https://api.deepseek.com/user/balance'
    // 官方美元价格（每百万 token）；未收录的模型回退到 deepseek-chat 定价。费用为估算值。
    const PRICES = {
      'deepseek-chat': { in: 0.28, inHit: 0.028, out: 0.42 },
      'deepseek-reasoner': { in: 0.55, inHit: 0.14, out: 2.19 },
    }
    const FX_CNY = 7.1
    const offPeakFactor = (date) => {
      const t = date.getUTCHours() * 60 + date.getUTCMinutes()
      return (t >= 990 || t < 30) ? 0.5 : 1 // 16:30-00:30 UTC 为谷时段，5 折
    }
    const round = (v, n) => { const p = Math.pow(10, n); return Math.round(v * p) / p }

    // ── 按会话累积 llm 真实用量 ──
    const usageBySession = new Map()
    const MAX_SESSIONS = 256
    const estimateCost = (model, u, date) => {
      const p = PRICES[model] || PRICES['deepseek-chat']
      const f = offPeakFactor(date)
      return ((u.input * p.in) + (u.cacheRead * p.inHit) + (u.cacheWrite * p.in) + (u.output * p.out)) / 1e6 * f
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
      const cost = estimateCost(model, { input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok }, new Date(ts))
      // 最近一次（单次）模型调用：每次都覆盖为最新的一次
      rec.last = {
        input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok,
        estUsd: round(cost, 4), estCny: round(cost * FX_CNY, 4), at: ts,
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

    // ── 通过子进程请求余额（无 fetch 全局；web.fetch 不带自定义头）──
    async function fetchBalanceText(apiKey) {
      const sub = ctx.get('subprocess')
      if (sub === undefined) throw new Error('subprocess 服务未挂载')
      const policy = ctx.get('sandboxPolicy')
      const cwd = (policy && policy.workspaceRoot) || '.'
      const script = "fetch('" + BALANCE_URL + "',{headers:{Authorization:'Bearer '+process.env.DSK_KEY}}).then(async r=>process.stdout.write(JSON.stringify({status:r.status,body:await r.text()}))).catch(e=>{process.stderr.write(String((e&&e.stack)||e));process.exit(2)})"
      const attempts = []
      try { attempts.push({ argv: [await sub.resolveExecutable('node'), '-e', script] }) } catch (e) {}
      try { attempts.push({ argv: [await sub.resolveExecutable('curl'), '-sS', '-H', 'Authorization: Bearer ' + apiKey, BALANCE_URL] }) } catch (e) {}
      if (attempts.length === 0) throw new Error('PATH 中找不到 node 或 curl')
      let last
      for (const attempt of attempts) {
        const handle = sub.spawn({
          argv: attempt.argv,
          cwd,
          stdio: { stdin: 'ignore', stdout: { maxBytes: 65536 }, stderr: { maxBytes: 65536 } },
          graceMs: 5000,
          env: { DSK_KEY: apiKey },
        })
        let outcome
        try {
          outcome = await Promise.race([
            handle.done,
            ctx.timeout(12000).then(() => { handle.terminate(); return { exitCode: -1, signal: 'timeout' } }),
          ])
        } catch (e) { handle.terminate(); last = e; continue }
        const out = handle.collected.stdout && handle.collected.stdout.readFrom(0)
        const errRead = handle.collected.stderr && handle.collected.stderr.readFrom(0)
        const text = out ? out.text : ''
        const err = errRead ? errRead.text : ''
        if (outcome.exitCode === 0 && text.length > 0) return { text, err }
        last = new Error('exit ' + outcome.exitCode + (err ? ': ' + err.slice(0, 300) : ''))
      }
      throw last || new Error('余额请求失败')
    }

    async function queryBalance() {
      const credentials = ctx.get('credentials')
      if (credentials === undefined) return { ok: false, code: 'NO_CREDENTIALS_SERVICE', error: 'credentials 服务未挂载' }
      const hit = await credentials.resolve('DEEPSEEK_API_KEY')
      if (hit === undefined) return { ok: false, code: 'NO_API_KEY', error: '未配置 DEEPSEEK_API_KEY：请在 设置 → Models 中填写 DeepSeek API Key' }
      try {
        const { text, err } = await fetchBalanceText(hit.value)
        const raw = text
        let parsed
        try { parsed = JSON.parse(raw) } catch (e) { return { ok: false, code: 'BAD_RESPONSE', error: '余额接口返回非 JSON：' + (raw.slice(0, 200) || err.slice(0, 200)) } }
        // node 路径输出 {status, body} 包装以携带状态码；curl 路径输出原始响应体。
        if (parsed && typeof parsed.status === 'number' && typeof parsed.body === 'string') {
          if (parsed.status < 200 || parsed.status >= 300) {
            return { ok: false, code: 'HTTP_' + parsed.status, error: '余额接口 HTTP ' + parsed.status + '：' + parsed.body.slice(0, 300) }
          }
          try { parsed = JSON.parse(parsed.body) } catch (e) { return { ok: false, code: 'BAD_RESPONSE', error: '余额接口响应体非 JSON：' + parsed.body.slice(0, 200) } }
        }
        if (parsed && parsed.error) return { ok: false, code: 'API_ERROR', error: String(parsed.error.message || parsed.error.type || JSON.stringify(parsed.error)) }
        const infos = Array.isArray(parsed && parsed.balance_infos) ? parsed.balance_infos : []
        const info = infos.find((i) => i && i.currency === 'CNY') || infos[0]
        if (!info) return { ok: false, code: 'BAD_RESPONSE', error: '余额接口未返回 balance_infos（原始响应：' + raw.slice(0, 200) + '）' }
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

    // ── 本会话累计：从持久会话日志折叠（跨重启保留）──
    const foldCache = new Map() // sid -> { at, total, last }，TTL 15s
    const FOLD_TTL = 15000
    const FOLD_LIMIT = 512
    async function foldSession(sid) {
      const now = Date.now()
      const hit = foldCache.get(sid)
      if (hit !== undefined && now - hit.at < FOLD_TTL) return hit
      const total = { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, estUsd: 0, estCny: 0 }
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
            total.calls += 1
            total.input += inTok; total.output += outTok; total.cacheRead += hitTok; total.cacheWrite += writeTok
            const src = e.data.message && e.data.message.source
            const model = src && typeof src.model === 'string' ? src.model : 'deepseek-chat'
            const cost = estimateCost(model, { input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok }, new Date(typeof e.time === 'number' ? e.time : now))
            total.estUsd += cost; total.estCny += cost * FX_CNY
            last = {
              input: inTok, output: outTok, cacheRead: hitTok, cacheWrite: writeTok,
              estUsd: round(cost, 4), estCny: round(cost * FX_CNY, 4), at: typeof e.time === 'number' ? e.time : now,
            }
          }
        } catch (e) { /* 读日志失败时返回当前已知数据 */ }
      }
      const result = { total, last }
      foldCache.set(sid, { at: now, total, last })
      if (foldCache.size > FOLD_LIMIT) foldCache.delete(foldCache.keys().next().value)
      return result
    }

    const emptyUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, estUsd: 0, estCny: 0 }

    // ── webServer 路由（客户端浏览器同源 fetch 调用）──
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
          sendJson(res, {
            ok: true,
            sessionId: key,
            last: last ? {
              inputTokens: last.input, outputTokens: last.output,
              cacheReadTokens: last.cacheRead, cacheWriteTokens: last.cacheWrite,
              estUsd: last.estUsd, estCny: last.estCny, at: last.at,
            } : { ...emptyUsage, at: 0 },
            total: total ? {
              calls: total.calls,
              inputTokens: total.input, outputTokens: total.output,
              cacheReadTokens: total.cacheRead, cacheWriteTokens: total.cacheWrite,
              estUsd: round(total.estUsd, 4), estCny: round(total.estCny, 2),
            } : { calls: 0, ...emptyUsage },
          })
        } catch (e) { sendJson(res, { ok: false, code: 'ROUTE_ERROR', error: String((e && e.message) || e) }, 500) }
      } })
      ws.register({ kind: 'exact', path: '/dsh-balance/guard-ask', handler: async (req, res) => {
        const uq = ctx.get('userQuestions')
        if (uq === undefined) { sendJson(res, { choice: 'unavailable', error: '提问服务不可用' }); return }
        try {
          const answer = await Promise.race([
            uq.ask({
              questions: [{
                id: 'balance-guard',
                header: '余额卡片位置提醒',
                question: '检测到有其他插件注册到了侧边栏底部区域，可能挤占余额卡片的显示位置。是否允许？',
                detail: '允许 = 新插件可占用该区域；取消 = 保持余额卡片优先（插件会重新抢占顶部位置）。注意：若其他插件替换了整个侧边栏，需要卸载该插件才能恢复余额卡片。',
                options: [{ label: '允许' }, { label: '取消' }],
              }],
            }),
            ctx.timeout(120000).then(() => ({ answers: [{ id: 'balance-guard', selected: [] }] })),
          ])
          const item = answer && answer.answers && answer.answers[0]
          const selected = item && item.selected && item.selected.length > 0 ? item.selected[0] : ''
          sendJson(res, { choice: selected === '允许' ? 'allow' : selected === '取消' ? 'keep' : 'none' })
        } catch (e) {
          sendJson(res, { choice: 'none', error: String((e && e.message) || e) })
        }
      } })
    }
  },
}
