// dsh-balance-dock — Client 半边 (v1.2.0)
// 经典脚本 bundle：window.__ModuleLoader__.load；浏览器全局（fetch/setInterval/document/Intl）。
// 与 Host 半通信走同源 HTTP 路由 /dsh-balance/*。
window.__ModuleLoader__.load({
  id: 'dsh-balance-dock',
  factory: (require) => {
    const React = require('react')

    const CSS = [
      '.dsbd-dock{flex:0 0 100%;box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:4px;padding:10px 12px;margin:6px 0;border:1.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,.12)}',
      '.dsbd-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.dsbd-head-left{display:flex;align-items:center;gap:6px;min-width:0}',
      '.dsbd-title{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;letter-spacing:.03em}',
      '.dsbd-refresh{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:none;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;line-height:1}',
      '.dsbd-refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dsbd-dot{width:9px;height:9px;border-radius:50%;flex:none}',
      '.dsbd-dot.ok{background:var(--dsw-alias-state-success-primary)}',
      '.dsbd-dot.warn{background:var(--dsw-alias-state-warn-primary)}',
      '.dsbd-dot.err{background:var(--dsw-alias-state-error-primary)}',
      '.dsbd-total{font-size:17px;font-weight:700;line-height:1.3;color:#f5c518}',
      '.dsbd-total .dsbd-curr{color:#f5c518}',
      '.dsbd-curr{font-size:12px;font-weight:600;margin-right:2px}',
      '.dsbd-delta{font-size:11px;font-weight:600;margin-left:6px}',
      '.dsbd-delta.up{color:var(--dsw-alias-state-success-primary)}',
      '.dsbd-delta.down{color:var(--dsw-alias-state-error-primary)}',
      '.dsbd-line{display:flex;align-items:baseline;justify-content:space-between;gap:8px}',
      '.dsbd-k{color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dsbd-v{font-size:12px;font-weight:500}',
      '.dsbd-div{height:1px;background:var(--dsw-alias-border-l1);margin:5px 0}',
      '.dsbd-note{font-size:11px}',
      '.dsbd-note.warn{color:var(--dsw-alias-state-warn-primary)}',
      '.dsbd-note.err{color:var(--dsw-alias-state-error-primary)}',
      '.dsbd-meta{color:var(--dsw-alias-label-secondary);font-size:10px;text-align:right}',
      '.dsbd-rail{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:22px;height:22px;margin:4px 2px;border:1.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1)}',
      '.dsbd-rail .dsbd-dot{width:10px;height:10px}',
      '.dsbd-actions{display:flex;gap:8px;margin-top:8px}',
      '.dsbd-recharge-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;padding:7px 10px;border:1.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);text-align:center}',
      '.dsbd-recharge-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dsbd-settings-btn{display:flex;align-items:center;justify-content:center;gap:4px;flex:none;padding:7px 10px;border:1.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-family:inherit;font-size:12px;font-weight:600}',
      '.dsbd-settings-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '@keyframes dsbd-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      '.dsbd-refresh.spin{animation:dsbd-spin .6s ease-out}',
      '.dsbd-overlay{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px}',
      '.dsbd-modal{width:min(400px,92vw);max-height:82vh;overflow:auto;background:var(--dsw-alias-bg-overlay);border:1.5px solid var(--dsw-alias-border-l2);border-radius:14px;padding:16px;box-shadow:0 8px 30px rgba(0,0,0,.3);display:flex;flex-direction:column;gap:10px}',
      '.dsbd-modal-title{font-size:14px;font-weight:700}',
      '.dsbd-field{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px}',
      '.dsbd-field-k{color:var(--dsw-alias-label-secondary)}',
      '.dsbd-input{width:90px;padding:4px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;font-family:inherit}',
      '.dsbd-select{width:150px;padding:4px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;font-family:inherit}',
      '.dsbd-check{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.dsbd-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}',
      '.dsbd-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px;font-family:inherit}',
      '.dsbd-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dsbd-btn.primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}',
      '.dsbd-btn.reset{color:var(--dsw-alias-state-warn-primary)}',
      '.dsbd-track{position:relative;width:100%;height:10px;border-radius:5px;background:var(--dsw-alias-border-l1);overflow:hidden}',
      '.dsbd-fill{position:relative;display:flex;gap:3px;height:100%;transition:width .6s cubic-bezier(.4,0,.2,1)}',
      '.dsbd-fill-seg{flex:1 1 0;min-width:2px;height:100%;border-radius:2px;background:var(--dsw-alias-border-l1);overflow:hidden}',
      '.dsbd-fill-inner{height:100%;border-radius:2px;transition:width .4s cubic-bezier(.4,0,.2,1),background .3s}',
      '@keyframes dsbd-pop{0%{transform:translate(-50%,-50%) scale(.4);opacity:1}35%{transform:translate(-50%,-50%) scale(1.9);opacity:.9}100%{transform:translate(-50%,-50%) scale(0);opacity:0}}',
      '.dsbd-burst{position:absolute;right:-4px;top:50%;width:16px;height:16px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(255,120,60,.7) 55%,rgba(255,120,60,0) 78%);animation:dsbd-pop .5s ease-out forwards;z-index:2}',
      'div[data-slot="sidebar"] div:has(> div[data-slot="sidebar.footer.action"]){flex-wrap:wrap}',
    ].join('')

    // ── i18n ──
    const I18N = {
      'zh-CN': { title: 'DeepSeek 余额', refresh: '手动刷新', fail: '余额查询失败', grantTop: '赠金 / 充值', lastUsage: '本次用量', lastModel: '本次使用模型', total: '本会话累计', calls: '本会话累计调用模型次数', times: '次', warnLow: '余额偏低，建议充值', warnDanger: '余额严重不足，建议尽快充值', overrun: '本会话累计花费已超过账户余额', updated: '更新于', recharge: '充值', settings: '设置', loading: '余额查询中…', segPer: '每段', modalTitle: '余额插件设置', fSegment: '每段金额', fRed: '红色阈值', fWarnLow: '黄色警告', fWarnDanger: '红色警告', fLang: '语言', fCurrency: '货币', showSection: '显示内容', reset: '恢复默认', cancel: '取消', confirm: '确认', remaining: '剩余', topped: '充值', fx: '汇率' },
      'zh-TW': { title: 'DeepSeek 餘額', refresh: '手動重新整理', fail: '餘額查詢失敗', grantTop: '贈金 / 充值', lastUsage: '本次用量', lastModel: '本次使用模型', total: '本會話累計', calls: '本會話累計呼叫模型次數', times: '次', warnLow: '餘額偏低，建議充值', warnDanger: '餘額嚴重不足，請盡快充值', overrun: '本會話累計花費已超過帳戶餘額', updated: '更新於', recharge: '充值', settings: '設定', loading: '餘額查詢中…', segPer: '每段', modalTitle: '餘額外掛設定', fSegment: '每段金額', fRed: '紅色閾值', fWarnLow: '黃色警告', fWarnDanger: '紅色警告', fLang: '語言', fCurrency: '貨幣', showSection: '顯示內容', reset: '恢復預設', cancel: '取消', confirm: '確認', remaining: '剩餘', topped: '充值', fx: '匯率' },
      'en': { title: 'DeepSeek Balance', refresh: 'Refresh', fail: 'Balance query failed', grantTop: 'Grant / Top-up', lastUsage: 'Latest usage', lastModel: 'Latest model', total: 'Session total', calls: 'Session model calls', times: 'calls', warnLow: 'Balance low, consider top-up', warnDanger: 'Balance critically low, top up soon', overrun: 'Session spend exceeds balance', updated: 'Updated', recharge: 'Top up', settings: 'Settings', loading: 'Loading balance…', segPer: 'per segment', modalTitle: 'Balance Plugin Settings', fSegment: 'Segment amount', fRed: 'Red threshold', fWarnLow: 'Amber warning', fWarnDanger: 'Red warning', fLang: 'Language', fCurrency: 'Currency', showSection: 'Show rows', reset: 'Restore defaults', cancel: 'Cancel', confirm: 'Confirm', remaining: 'Remaining', topped: 'Top-up', fx: 'FX rate' },
      'de': { title: 'DeepSeek Guthaben', refresh: 'Aktualisieren', fail: 'Guthabenabfrage fehlgeschlagen', grantTop: 'Bonus / Aufladung', lastUsage: 'Letzte Nutzung', lastModel: 'Letztes Modell', total: 'Sitzung gesamt', calls: 'Modellaufrufe (Sitzung)', times: 'Aufrufe', warnLow: 'Guthaben niedrig, aufladen empfohlen', warnDanger: 'Guthaben kritisch, bald aufladen', overrun: 'Sitzungskosten übersteigen Guthaben', updated: 'Aktualisiert', recharge: 'Aufladen', settings: 'Einstellungen', loading: 'Guthaben wird geladen…', segPer: 'pro Segment', modalTitle: 'Guthaben-Plugin Einstellungen', fSegment: 'Segmentbetrag', fRed: 'Rote Schwelle', fWarnLow: 'Gelbe Warnung', fWarnDanger: 'Rote Warnung', fLang: 'Sprache', fCurrency: 'Währung', showSection: 'Zeilen anzeigen', reset: 'Standard wiederherstellen', cancel: 'Abbrechen', confirm: 'Bestätigen', remaining: 'Verbleibend', topped: 'Aufladung', fx: 'Wechselkurs' },
      'ja': { title: 'DeepSeek 残高', refresh: '更新', fail: '残高の取得に失敗', grantTop: '特典 / チャージ', lastUsage: '最新の使用量', lastModel: '最新のモデル', total: 'セッション累計', calls: 'モデル呼び出し回数', times: '回', warnLow: '残高が少ないです。チャージを推奨', warnDanger: '残高が非常に少ないです。早めにチャージを', overrun: 'セッション費用が残高を超過', updated: '更新時刻', recharge: 'チャージ', settings: '設定', loading: '残高を読み込み中…', segPer: 'セグメントあたり', modalTitle: '残高プラグイン設定', fSegment: 'セグメント金額', fRed: '赤色閾値', fWarnLow: '黄色警告', fWarnDanger: '赤色警告', fLang: '言語', fCurrency: '通貨', showSection: '表示行', reset: '初期値に戻す', cancel: 'キャンセル', confirm: '確認', remaining: '残り', topped: 'チャージ', fx: '為替レート' },
      'ko': { title: 'DeepSeek 잔액', refresh: '새로고침', fail: '잔액 조회 실패', grantTop: '보너스 / 충전', lastUsage: '최근 사용량', lastModel: '최근 모델', total: '세션 누적', calls: '모델 호출 횟수', times: '회', warnLow: '잔액이 낮습니다. 충전을 권장', warnDanger: '잔액이 매우 낮습니다. 곧 충전하세요', overrun: '세션 비용이 잔액을 초과', updated: '업데이트', recharge: '충전', settings: '설정', loading: '잔액 로딩 중…', segPer: '세그먼트당', modalTitle: '잔액 플러그인 설정', fSegment: '세그먼트 금액', fRed: '빨간색 임계값', fWarnLow: '노란색 경고', fWarnDanger: '빨간색 경고', fLang: '언어', fCurrency: '통화', showSection: '표시 행', reset: '기본값 복원', cancel: '취소', confirm: '확인', remaining: '남은', topped: '충전', fx: '환율' },
      'ru': { title: 'Баланс DeepSeek', refresh: 'Обновить', fail: 'Ошибка запроса баланса', grantTop: 'Бонус / Пополнение', lastUsage: 'Последнее использование', lastModel: 'Последняя модель', total: 'Итого за сессию', calls: 'Вызовы моделей', times: 'вызовов', warnLow: 'Баланс низкий, пополните', warnDanger: 'Баланс критически низкий, пополните скорее', overrun: 'Расходы сессии превышают баланс', updated: 'Обновлено', recharge: 'Пополнить', settings: 'Настройки', loading: 'Загрузка баланса…', segPer: 'за сегмент', modalTitle: 'Настройки плагина', fSegment: 'Сумма сегмента', fRed: 'Красный порог', fWarnLow: 'Жёлтое предупреждение', fWarnDanger: 'Красное предупреждение', fLang: 'Язык', fCurrency: 'Валюта', showSection: 'Показывать строки', reset: 'Сбросить', cancel: 'Отмена', confirm: 'Подтвердить', remaining: 'Остаток', topped: 'Пополнение', fx: 'Курс' },
    }
    // 充值相关文案（v1.2.2 新增）
    const I18N_EXTRA = {
      'zh-CN': { grantTop: '赠金', lastRecharge: '最近充值', totalRecharge: '累计充值', noRecord: '暂无充值记录', fxAuto: '汇率（自动更新）', fxLive: '实时', fxFallback: '内置兜底' },
      'zh-TW': { grantTop: '贈金', lastRecharge: '最近充值', totalRecharge: '累計充值', noRecord: '暫無充值記錄', fxAuto: '匯率（自動更新）', fxLive: '即時', fxFallback: '內建備援' },
      'en': { grantTop: 'Grant', lastRecharge: 'Last top-up', totalRecharge: 'Total top-ups', noRecord: 'No top-ups recorded', fxAuto: 'FX rate (auto)', fxLive: 'live', fxFallback: 'built-in fallback' },
      'de': { grantTop: 'Bonus', lastRecharge: 'Letzte Aufladung', totalRecharge: 'Gesamt Aufladung', noRecord: 'Keine Aufladung erfasst', fxAuto: 'Wechselkurs (auto)', fxLive: 'live', fxFallback: 'eingebauter Fallback' },
      'ja': { grantTop: '特典', lastRecharge: '最近のチャージ', totalRecharge: '累計チャージ', noRecord: 'チャージ記録なし', fxAuto: '為替レート（自動）', fxLive: 'リアルタイム', fxFallback: '内蔵フォールバック' },
      'ko': { grantTop: '보너스', lastRecharge: '최근 충전', totalRecharge: '누적 충전', noRecord: '충전 기록 없음', fxAuto: '환율 (자동)', fxLive: '실시간', fxFallback: '내장 폴백' },
      'ru': { grantTop: 'Бонус', lastRecharge: 'Последнее пополнение', totalRecharge: 'Всего пополнений', noRecord: 'Нет записей', fxAuto: 'Курс (авто)', fxLive: 'в реальном времени', fxFallback: 'встроенный запасной' },
    }
    for (const k of Object.keys(I18N)) Object.assign(I18N[k], I18N_EXTRA[k] || {})
    // 英式/英式英语别名（共享同一份英文文案）
    I18N['en-US'] = I18N['en']
    I18N['en-GB'] = I18N['en']

    const LANG_CURRENCY = { 'zh-CN': 'CNY', 'zh-TW': 'TWD', en: 'USD', 'en-US': 'USD', 'en-GB': 'GBP', de: 'EUR', ja: 'JPY', ko: 'KRW', ru: 'RUB' }
    const LOCALES = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', en: 'en-US', 'en-US': 'en-US', 'en-GB': 'en-GB', de: 'de-DE', ja: 'ja-JP', ko: 'ko-KR', ru: 'ru-RU' }
    const CURRENCY_OPTIONS = [['CNY', 'CNY ¥'], ['TWD', 'TWD NT$'], ['USD', 'USD $'], ['GBP', 'GBP £'], ['EUR', 'EUR €'], ['JPY', 'JPY ¥'], ['KRW', 'KRW ₩'], ['RUB', 'RUB ₽']]
    const LANGUAGE_OPTIONS = [['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['de', 'Deutsch'], ['ja', '日本語'], ['ko', '한국어'], ['ru', 'Русский']]

    const symOf = { CNY: '¥', TWD: 'NT$', USD: '$', GBP: '£', EUR: '€', JPY: '¥', KRW: '₩', RUB: '₽' }
    const fmtInt = (v) => Math.round(v).toLocaleString('en-US')
    const pad2 = (n) => (n < 10 ? '0' : '') + n
    const clock = (t) => { const d = new Date(t); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) }
    const fmtDate = (t) => { const d = new Date(t); return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) }
    let currentLang = 'zh-CN' // 供位置守护弹窗使用（由 Dock 同步）

    function Dock(props) {
      const wide = props.wide === true
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : null
      const current = useSessions ? useSessions((s) => s.current) : undefined
      const [balance, setBalance] = React.useState(null)
      const [spend, setSpend] = React.useState(null)
      const [cfg, setCfg] = React.useState(null)
      const [rates, setRates] = React.useState(null)
      const [updatedAt, setUpdatedAt] = React.useState(null)
      const [delta, setDelta] = React.useState(null)
      const [refresh, setRefresh] = React.useState(0)
      const [settingsOpen, setSettingsOpen] = React.useState(false)
      const [form, setForm] = React.useState(null)
      const [defaults, setDefaults] = React.useState(null)
      const [spinning, setSpinning] = React.useState(false)
      const [fetchErr, setFetchErr] = React.useState(null)
      const [recharge, setRecharge] = React.useState(null)
      const prevBal = React.useRef(null)

      const lang = cfg && cfg.lang ? cfg.lang : 'zh-CN'
      const t = I18N[lang] || I18N['zh-CN']
      currentLang = lang // 同步给位置守护弹窗
      const displayCurrency = cfg && cfg.currency ? cfg.currency : 'CNY'
      const rate = (rates && rates.rates && rates.rates[displayCurrency]) ? rates.rates[displayCurrency] : 1
      const moneyFull = (cnyAmount) => {
        const val = cnyAmount * rate
        try {
          return new Intl.NumberFormat(LOCALES[lang] || 'zh-CN', {
            style: 'currency', currency: displayCurrency,
            minimumFractionDigits: (displayCurrency === 'JPY' || displayCurrency === 'KRW') ? 0 : 2,
            maximumFractionDigits: (displayCurrency === 'JPY' || displayCurrency === 'KRW') ? 0 : 2,
          }).format(val)
        } catch (e) { return (symOf[displayCurrency] || displayCurrency) + ' ' + val.toFixed(2) }
      }
      const moneySmall = (cnyAmount) => {
        const val = cnyAmount * rate
        if (val < 0.005) return '≈' + (symOf[displayCurrency] || displayCurrency) + '0.00'
        return moneyFull(cnyAmount)
      }

      React.useEffect(() => {
        let alive = true
        fetch('/dsh-balance/config')
          .then((r) => r.json())
          .then((r) => {
            if (!alive) return
            if (r && r.config) setCfg(r.config)
            if (r && r.defaults) setDefaults(r.defaults)
          })
          .catch(() => {})
        return () => { alive = false }
      }, [])
      React.useEffect(() => {
        let alive = true
        fetch('/dsh-balance/rates')
          .then((r) => r.json())
          .then((r) => { if (alive && r && r.ok === true) setRates(r) })
          .catch(() => {})
        return () => { alive = false }
      }, [refresh])
      React.useEffect(() => {
        let alive = true
        fetch('/dsh-balance/recharge')
          .then((r) => r.json())
          .then((r) => { if (alive && r && r.ok === true) setRecharge(r) })
          .catch(() => {})
        return () => { alive = false }
      }, [refresh])

      const openSettings = () => {
        fetch('/dsh-balance/config')
          .then((r) => r.json())
          .then((r) => { if (r && r.config) setForm(r.config) })
          .catch(() => {})
        setSettingsOpen(true)
      }
      const setField = (key, value) => { setForm((f) => ({ ...f, [key]: value })) }
      const setShowRow = (key, value) => {
        setForm((f) => ({ ...f, showRows: { ...((f && f.showRows) || {}), [key]: value } }))
      }
      const saveSettings = () => {
        if (form === null) return
        fetch('/dsh-balance/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
          .then((r) => r.json())
          .then((r) => {
            if (r && r.ok === true) {
              setSettingsOpen(false)
              setCfg(r.config)
              setRefresh((x) => x + 1)
            }
          })
          .catch(() => {})
      }
      const resetSettings = () => { if (defaults) setForm(JSON.parse(JSON.stringify(defaults))) }
      const onRefreshClick = () => {
        setSpinning(true)
        setRefresh((r) => r + 1)
      }

      React.useEffect(() => {
        let alive = true
        const tick = () => {
          fetch('/dsh-balance/balance')
            .then((r) => r.json())
            .then((r) => {
              if (!alive) return
              setFetchErr(null)
              if (r && r.ok === true) {
                const p = prevBal.current
                if (p && p.ok === true && Math.abs(p.total - r.total) > 0.001) {
                  setDelta({ amount: r.total - p.total, at: Date.now() })
                }
                prevBal.current = r
                setUpdatedAt(Date.now())
              }
              setBalance(r)
            })
            .catch((e) => { if (alive) setFetchErr(String((e && e.message) || e)) })
        }
        tick()
        const timer = setInterval(tick, 15000)
        return () => { alive = false; clearInterval(timer) }
      }, [refresh])

      React.useEffect(() => {
        if (delta === null) return
        const timer = setTimeout(() => setDelta(null), 10000)
        return () => clearTimeout(timer)
      }, [delta])

      React.useEffect(() => {
        let alive = true
        const tick = () => {
          const q = current === undefined ? '' : '?session=' + encodeURIComponent(current)
          fetch('/dsh-balance/spend' + q)
            .then((r) => r.json())
            .then((r) => { if (alive) setSpend(r) })
            .catch(() => {})
        }
        tick()
        const timer = setInterval(tick, 8000)
        return () => { alive = false; clearInterval(timer) }
      }, [current, refresh])

      const ok = balance && balance.ok === true
      const segBase = cfg && typeof cfg.segmentBase === 'number' ? cfg.segmentBase : 50
      const redAt = cfg && typeof cfg.redThreshold === 'number' ? cfg.redThreshold : 15
      const warnLow = cfg && typeof cfg.warnLow === 'number' ? cfg.warnLow : 10
      const warnDanger = cfg && typeof cfg.warnDanger === 'number' ? cfg.warnDanger : 3
      const status = !ok ? 'err' : balance.total < warnDanger ? 'err' : balance.total < warnLow ? 'warn' : 'ok'
      const last = spend && spend.ok === true ? spend.last : null
      const total = spend && spend.ok === true ? spend.total : null
      const lastCny = last ? last.estCny : null
      const lastTok = last ? last.inputTokens + last.outputTokens : null
      const lastModel = last && last.model ? last.model : null
      const totalCny = total ? total.estCny : null
      const totalTok = total ? total.inputTokens + total.outputTokens : null
      const totalCalls = total ? total.calls : 0
      const warnText = ok && balance.total < warnLow ? (balance.total < warnDanger ? t.warnDanger : t.warnLow) : ''
      const overrun = ok && totalCny !== null && balance.total > 0 && totalCny > balance.total
      const showRows = (cfg && cfg.showRows) || { last: true, lastModel: true, total: true, calls: true }

      const modelDetail = (total && total.models) ? Object.keys(total.models).map((mk) => {
        const m = total.models[mk]
        return mk + ': ' + fmtInt(m.inputTokens + m.outputTokens) + ' tokens · ' + moneySmall(m.estCny) + ' · ' + m.calls + ' ' + t.times
      }).join('\n') : ''

      const railTitle = ok
        ? t.title + ' ' + moneyFull(balance.total) + (totalCny !== null ? ' · ' + t.total + ' ' + moneySmall(totalCny) : '')
        : (balance && balance.error) ? t.fail + '：' + balance.error : t.loading

      const balanceTotal = ok ? balance.total : 0
      const refAmount = ok && balance.toppedUp > 0 ? balance.toppedUp : (ok ? balance.total : 0)
      const litYuan = refAmount > 0 ? Math.min(balanceTotal, refAmount) : 0
      const litSegs = litYuan > 0 ? Math.max(1, Math.ceil(litYuan / segBase)) : 0
      const partialYuan = litSegs > 0 ? litYuan - (litSegs - 1) * segBase : 0
      const partialFill = segBase > 0 ? partialYuan / segBase : 0
      const activeRed = partialYuan > 0 && partialYuan < redAt
      const fillRatio = refAmount > 0 ? Math.min(1, balanceTotal / refAmount) : 0
      const prevLit = React.useRef(litSegs)
      const [burstId, setBurstId] = React.useState(0)
      React.useEffect(() => {
        if (litSegs < prevLit.current) setBurstId((b) => b + 1)
        prevLit.current = litSegs
      }, [litSegs])

      if (!wide) {
        return React.createElement('div', { className: 'dsbd-rail', title: railTitle },
          React.createElement('span', { className: 'dsbd-dot ' + status }))
      }

      const rows = []
      rows.push(React.createElement('div', { key: 'total', className: 'dsbd-total' },
        ok ? moneyFull(balance.total) : '—',
        delta !== null
          ? React.createElement('span', { className: 'dsbd-delta ' + (delta.amount >= 0 ? 'up' : 'down') },
            (delta.amount >= 0 ? '▲' : '▼') + ' ' + moneyFull(Math.abs(delta.amount)))
          : null))
      rows.push(React.createElement('div', { key: 'grant', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.grantTop),
        React.createElement('span', { className: 'dsbd-v' }, ok ? moneySmall(balance.granted) : (balance && balance.error ? t.fail : '…'))))
      rows.push(React.createElement('div', { key: 'lastrc', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.lastRecharge),
        React.createElement('span', { className: 'dsbd-v' }, recharge && recharge.last ? (fmtDate(recharge.last.at) + ' · ' + moneyFull(recharge.last.amount)) : t.noRecord)))
      rows.push(React.createElement('div', { key: 'totalrc', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.totalRecharge),
        React.createElement('span', { className: 'dsbd-v' }, recharge ? moneyFull(recharge.total) : '…')))
      rows.push(React.createElement('div', { key: 'div', className: 'dsbd-div' }))
      if (showRows.last) rows.push(React.createElement('div', { key: 'last', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.lastUsage),
        React.createElement('span', { className: 'dsbd-v' },
          (lastTok !== null ? fmtInt(lastTok) + ' tokens' : '…')
          + (lastCny !== null ? ' · ' + moneySmall(lastCny) : ''))))
      if (showRows.lastModel) rows.push(React.createElement('div', { key: 'lastmodel', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.lastModel),
        React.createElement('span', { className: 'dsbd-v' }, lastModel ? lastModel : '…')))
      if (showRows.total) rows.push(React.createElement('div', { key: 'totals', className: 'dsbd-line', title: modelDetail || undefined },
        React.createElement('span', { className: 'dsbd-k' }, t.total),
        React.createElement('span', { className: 'dsbd-v' }, (totalTok !== null ? fmtInt(totalTok) + ' tokens' : '…') + (totalCny !== null ? ' · ' + moneySmall(totalCny) : ''))))
      if (showRows.calls) rows.push(React.createElement('div', { key: 'calls', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, t.calls),
        React.createElement('span', { className: 'dsbd-v' }, totalCalls > 0 ? fmtInt(totalCalls) + ' ' + t.times : '…')))
      if (warnText) rows.push(React.createElement('div', { key: 'warn', className: 'dsbd-note warn' }, warnText))
      if (overrun) rows.push(React.createElement('div', { key: 'over', className: 'dsbd-note err' }, t.overrun))
      if (balance && !ok) rows.push(React.createElement('div', { key: 'err', className: 'dsbd-note err' }, (balance.error ? t.fail + '：' + balance.error : t.fail)))
      if (fetchErr !== null && !ok) rows.push(React.createElement('div', { key: 'fetherr', className: 'dsbd-note err' }, t.fail + '：' + fetchErr))
      if (updatedAt !== null && ok) rows.push(React.createElement('div', { key: 'meta', className: 'dsbd-meta' }, t.updated + ' ' + clock(updatedAt)))

      const fillSegs = []
      for (let i = 0; i < litSegs; i++) {
        const isRight = i === litSegs - 1
        const color = isRight && activeRed ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)'
        const innerW = isRight ? (partialFill * 100).toFixed(2) + '%' : '100%'
        fillSegs.push(React.createElement('div', { key: 'fs' + i, className: 'dsbd-fill-seg' },
          React.createElement('div', { className: 'dsbd-fill-inner', style: { width: innerW, background: color } })))
      }
      rows.push(React.createElement('div', { key: 'bar', className: 'dsbd-track', title: ok ? (t.remaining + ' ' + moneyFull(balanceTotal) + ' / ' + t.topped + ' ' + moneyFull(refAmount) + ' · ' + t.segPer + ' ' + moneyFull(segBase)) : t.fail },
        React.createElement('div', { className: 'dsbd-fill', style: { width: (fillRatio * 100).toFixed(2) + '%' } },
          fillSegs,
          burstId > 0
            ? React.createElement('div', { key: 'burst' + burstId, className: 'dsbd-burst', onAnimationEnd: () => setBurstId(0) })
            : null)))
      rows.push(React.createElement('div', { key: 'actions', className: 'dsbd-actions' },
        React.createElement('button', {
          type: 'button',
          className: 'dsbd-recharge-btn',
          title: 'https://platform.deepseek.com/top_up',
          onClick: () => { window.open('https://platform.deepseek.com/top_up', '_blank', 'noopener') },
        }, t.recharge + ' ↗'),
        React.createElement('button', {
          type: 'button',
          className: 'dsbd-settings-btn',
          title: t.settings,
          onClick: openSettings,
        }, t.settings, ' ⚙')))

      const numField = (label, value, onChange) => React.createElement('div', { key: label, className: 'dsbd-field' },
        React.createElement('span', { className: 'dsbd-field-k' }, label),
        React.createElement('input', { type: 'number', step: 'any', className: 'dsbd-input', value: value, onChange: onChange }))
      const selectField = (label, value, options, onChange) => React.createElement('div', { key: label, className: 'dsbd-field' },
        React.createElement('span', { className: 'dsbd-field-k' }, label),
        React.createElement('select', { className: 'dsbd-select', value: value, onChange: (e) => onChange(e.target.value) },
          options.map((o) => React.createElement('option', { key: o[0], value: o[0] }, o[1]))))
      const rowToggle = (key, label) => React.createElement('div', { key: key, className: 'dsbd-field' },
        React.createElement('span', { className: 'dsbd-field-k' }, label),
        React.createElement('input', {
          type: 'checkbox',
          className: 'dsbd-check',
          checked: !!(form.showRows && form.showRows[key]),
          onChange: (e) => setShowRow(key, e.target.checked),
        }))
      const modal = settingsOpen && form
        ? React.createElement('div', {
          className: 'dsbd-overlay',
          onClick: (e) => { if (e.target === e.currentTarget) setSettingsOpen(false) },
        },
        React.createElement('div', { className: 'dsbd-modal', onClick: (e) => e.stopPropagation() },
          React.createElement('div', { className: 'dsbd-modal-title' }, t.modalTitle),
          selectField(t.fLang, form.lang || 'zh-CN', LANGUAGE_OPTIONS, (v) => setForm((f) => ({ ...f, lang: v, currency: LANG_CURRENCY[v] || f.currency }))),
          selectField(t.fCurrency, form.currency || 'CNY', CURRENCY_OPTIONS, (v) => setField('currency', v)),
          numField(t.fSegment + ' segmentBase', form.segmentBase, (e) => setField('segmentBase', parseFloat(e.target.value) || 0)),
          numField(t.fRed + ' redThreshold', form.redThreshold, (e) => setField('redThreshold', parseFloat(e.target.value) || 0)),
          numField(t.fWarnLow + ' warnLow', form.warnLow, (e) => setField('warnLow', parseFloat(e.target.value) || 0)),
          numField(t.fWarnDanger + ' warnDanger', form.warnDanger, (e) => setField('warnDanger', parseFloat(e.target.value) || 0)),
          React.createElement('div', { key: 'fxauto', className: 'dsbd-field' },
            React.createElement('span', { className: 'dsbd-field-k' }, t.fxAuto),
            React.createElement('span', { className: 'dsbd-v', style: { fontSize: '11px' } },
              rates && rates.rates && rates.rates[displayCurrency]
                ? ('1 CNY ≈ ' + rates.rates[displayCurrency].toFixed(4) + ' ' + displayCurrency + ' · ' + (rates.source === 'live' ? t.fxLive : t.fxFallback))
                : '…')),
          React.createElement('div', { className: 'dsbd-modal-title', style: { marginTop: '4px' } }, t.showSection),
          rowToggle('last', t.lastUsage),
          rowToggle('lastModel', t.lastModel),
          rowToggle('total', t.total),
          rowToggle('calls', t.calls),
          React.createElement('div', { className: 'dsbd-modal-foot' },
            React.createElement('button', { type: 'button', className: 'dsbd-btn reset', onClick: resetSettings }, t.reset),
            React.createElement('button', { type: 'button', className: 'dsbd-btn', onClick: () => setSettingsOpen(false) }, t.cancel),
            React.createElement('button', { type: 'button', className: 'dsbd-btn primary', onClick: saveSettings }, t.confirm))))
        : null

      return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'dsbd-dock' },
          React.createElement('div', { className: 'dsbd-head' },
            React.createElement('div', { className: 'dsbd-head-left' },
              React.createElement('span', { className: 'dsbd-title' }, t.title),
              React.createElement('button', {
                type: 'button',
                className: 'dsbd-refresh' + (spinning ? ' spin' : ''),
                title: t.refresh,
                onClick: onRefreshClick,
                onAnimationEnd: () => setSpinning(false),
              }, '⟳')),
            React.createElement('span', { className: 'dsbd-dot ' + status })),
          rows),
        modal)
    }

    const plugin = {
      inject: ['slots'],
      apply(ctx) {
        const styleEl = document.createElement('style')
        styleEl.textContent = CSS
        document.head.appendChild(styleEl)

        const slots = ctx.get('slots')
        if (slots === undefined) { styleEl.remove(); return }

        let lastGuardAsk = Date.now()
        let selfChange = false
        let disposeSlot = null
        const registerDock = () => {
          disposeSlot = slots.inject('sidebar.footer.action', () => slots.register(
            { name: 'sidebar.footer.action', id: 'dsh-balance-dock', order: -1000, label: 'DeepSeek 余额' },
            (props) => React.createElement(Dock, props),
          ))
        }
        registerDock()

        const guardDispose = ctx.on('slots/changed', (key) => {
          if (key !== 'sidebar.footer.action' && key !== 'sidebar') return
          if (selfChange) { selfChange = false; return }
          const now = Date.now()
          if (now - lastGuardAsk < 30000) return
          lastGuardAsk = now
          fetch('/dsh-balance/guard-ask?lang=' + encodeURIComponent(currentLang))
            .then((r) => r.json())
            .then((r) => {
              if (r && r.choice === 'keep' && key === 'sidebar.footer.action') {
                selfChange = true
                if (disposeSlot) disposeSlot()
                registerDock()
              }
            })
            .catch(() => {})
        })

        ctx.effect(() => () => {
          styleEl.remove()
          guardDispose()
          if (disposeSlot) disposeSlot()
        })
      },
    }

    return { default: plugin }
  },
})
