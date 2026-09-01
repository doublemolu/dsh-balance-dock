// dsh-balance-dock — Client 半边 (v1.1.0)
// 经典脚本 bundle：window.__ModuleLoader__.load；浏览器全局（fetch/setInterval/document）。
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
      '.dsbd-total{font-size:17px;font-weight:700;line-height:1.3}',
      '.dsbd-curr{font-size:12px;font-weight:600;margin-right:2px;color:var(--dsw-alias-label-secondary)}',
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
      '.dsbd-check{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.dsbd-price-group{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px}',
      '.dsbd-price-head{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary)}',
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

    const sym = (c) => (c === 'CNY' ? '¥' : c === 'USD' ? '$' : (c || '') + ' ')
    const fmt2 = (v) => (v >= 0.005 ? v.toFixed(2) : '≈0.00')
    const fmtInt = (v) => Math.round(v).toLocaleString('en-US')
    const pad2 = (n) => (n < 10 ? '0' : '') + n
    const clock = (t) => { const d = new Date(t); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) }

    function Dock(props) {
      const wide = props.wide === true
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : null
      const current = useSessions ? useSessions((s) => s.current) : undefined
      const [balance, setBalance] = React.useState(null)
      const [spend, setSpend] = React.useState(null)
      const [cfg, setCfg] = React.useState(null)
      const [updatedAt, setUpdatedAt] = React.useState(null)
      const [delta, setDelta] = React.useState(null)
      const [refresh, setRefresh] = React.useState(0)
      const [settingsOpen, setSettingsOpen] = React.useState(false)
      const [form, setForm] = React.useState(null)
      const [defaults, setDefaults] = React.useState(null)
      const [spinning, setSpinning] = React.useState(false)
      const prevBal = React.useRef(null)

      // 配置
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

      // ── 设置弹窗：打开时拉取最新配置 ──
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

      // 余额轮询（15s）+ 手动刷新
      React.useEffect(() => {
        let alive = true
        const tick = () => {
          fetch('/dsh-balance/balance')
            .then((r) => r.json())
            .then((r) => {
              if (!alive) return
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
            .catch(() => {})
        }
        tick()
        const timer = setInterval(tick, 15000)
        return () => { alive = false; clearInterval(timer) }
      }, [refresh])

      // 余额变化提示 10s 后消失
      React.useEffect(() => {
        if (delta === null) return
        const timer = setTimeout(() => setDelta(null), 10000)
        return () => clearTimeout(timer)
      }, [delta])

      // 会话花费轮询（8s）+ 手动刷新
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
      const curr = ok ? sym(balance.currency) : sym('CNY')
      const last = spend && spend.ok === true ? spend.last : null
      const total = spend && spend.ok === true ? spend.total : null
      const lastCny = last ? last.estCny : null
      const lastTok = last ? last.inputTokens + last.outputTokens : null
      const lastModel = last && last.model ? last.model : null
      const totalCny = total ? total.estCny : null
      const totalTok = total ? total.inputTokens + total.outputTokens : null
      const totalCalls = total ? total.calls : 0
      const warnText = ok && balance.total < warnLow ? (balance.total < warnDanger ? '余额严重不足，建议尽快充值' : '余额偏低，建议充值') : ''
      const overrun = ok && totalCny !== null && balance.total > 0 && totalCny > balance.total
      const showRows = (cfg && cfg.showRows) || { last: true, lastModel: true, total: true, calls: true }

      // 按模型明细（hover 提示）
      const modelDetail = (total && total.models) ? Object.keys(total.models).map((mk) => {
        const m = total.models[mk]
        return mk + ': ' + fmtInt(m.inputTokens + m.outputTokens) + ' tokens · ≈' + sym('CNY') + fmt2(m.estCny) + ' · ' + m.calls + ' 次'
      }).join('\n') : ''

      const railTitle = ok
        ? 'DeepSeek 余额 ' + curr + balance.total.toFixed(2) + (totalCny !== null ? ' · 本会话累计 ' + sym('CNY') + fmt2(totalCny) : '')
        : (balance && balance.error) ? '余额查询失败：' + balance.error : 'DeepSeek 余额查询中…'

      // ── 进度条（配置化段大小）──
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
        React.createElement('span', { className: 'dsbd-curr' }, curr),
        ok ? balance.total.toFixed(2) : '—',
        delta !== null
          ? React.createElement('span', { className: 'dsbd-delta ' + (delta.amount >= 0 ? 'up' : 'down') },
            (delta.amount >= 0 ? '▲' : '▼') + ' ' + Math.abs(delta.amount).toFixed(2))
          : null))
      rows.push(React.createElement('div', { key: 'sub', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '赠金 / 充值'),
        React.createElement('span', { className: 'dsbd-v' }, ok
          ? curr + balance.granted.toFixed(2) + ' / ' + curr + balance.toppedUp.toFixed(2)
          : (balance && balance.error) ? '查询失败' : '…')))
      rows.push(React.createElement('div', { key: 'div', className: 'dsbd-div' }))
      if (showRows.last) rows.push(React.createElement('div', { key: 'last', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本次用量'),
        React.createElement('span', { className: 'dsbd-v' },
          (lastTok !== null ? fmtInt(lastTok) + ' tokens' : '…')
          + (lastCny !== null ? ' · ≈' + sym('CNY') + fmt2(lastCny) : ''))))
      if (showRows.lastModel) rows.push(React.createElement('div', { key: 'lastmodel', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本次使用模型'),
        React.createElement('span', { className: 'dsbd-v' }, lastModel ? lastModel : '…')))
      if (showRows.total) rows.push(React.createElement('div', { key: 'totals', className: 'dsbd-line', title: modelDetail || undefined },
        React.createElement('span', { className: 'dsbd-k' }, '本会话累计'),
        React.createElement('span', { className: 'dsbd-v' }, (totalTok !== null ? fmtInt(totalTok) + ' tokens' : '…') + (totalCny !== null ? ' · ≈' + sym('CNY') + fmt2(totalCny) : ''))))
      if (showRows.calls) rows.push(React.createElement('div', { key: 'calls', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本会话累计调用模型次数'),
        React.createElement('span', { className: 'dsbd-v' }, totalCalls > 0 ? fmtInt(totalCalls) + ' 次' : '…')))
      if (warnText) rows.push(React.createElement('div', { key: 'warn', className: 'dsbd-note warn' }, warnText))
      if (overrun) rows.push(React.createElement('div', { key: 'over', className: 'dsbd-note err' }, '本会话累计花费已超过账户余额'))
      if (balance && !ok) rows.push(React.createElement('div', { key: 'err', className: 'dsbd-note err' }, balance.error || '余额查询失败'))
      if (updatedAt !== null && ok) rows.push(React.createElement('div', { key: 'meta', className: 'dsbd-meta' }, '更新于 ' + clock(updatedAt)))

      // 进度条 + 充值按钮
      const fillSegs = []
      for (let i = 0; i < litSegs; i++) {
        const isRight = i === litSegs - 1
        const color = isRight && activeRed ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)'
        const innerW = isRight ? (partialFill * 100).toFixed(2) + '%' : '100%'
        fillSegs.push(React.createElement('div', { key: 'fs' + i, className: 'dsbd-fill-seg' },
          React.createElement('div', { className: 'dsbd-fill-inner', style: { width: innerW, background: color } })))
      }
      rows.push(React.createElement('div', { key: 'bar', className: 'dsbd-track', title: ok ? ('剩余 ' + curr + balanceTotal.toFixed(2) + ' / 充值 ' + curr + refAmount.toFixed(2) + ' · 每段 ' + segBase + ' 元') : '余额查询失败' },
        React.createElement('div', { className: 'dsbd-fill', style: { width: (fillRatio * 100).toFixed(2) + '%' } },
          fillSegs,
          burstId > 0
            ? React.createElement('div', { key: 'burst' + burstId, className: 'dsbd-burst', onAnimationEnd: () => setBurstId(0) })
            : null)))
      rows.push(React.createElement('div', { key: 'actions', className: 'dsbd-actions' },
        React.createElement('button', {
          type: 'button',
          className: 'dsbd-recharge-btn',
          title: '前往 DeepSeek 开放平台充值',
          onClick: () => { window.open('https://platform.deepseek.com/top_up', '_blank', 'noopener') },
        }, '充值 ↗'),
        React.createElement('button', {
          type: 'button',
          className: 'dsbd-settings-btn',
          title: '插件设置',
          onClick: openSettings,
        }, '设置', ' ⚙')))

      // ── 设置弹窗 ──
      const numField = (label, value, onChange) => React.createElement('div', { key: label, className: 'dsbd-field' },
        React.createElement('span', { className: 'dsbd-field-k' }, label),
        React.createElement('input', { type: 'number', step: 'any', className: 'dsbd-input', value: value, onChange: onChange }))
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
          React.createElement('div', { className: 'dsbd-modal-title' }, '余额插件设置'),
          numField('每段金额 segmentBase', form.segmentBase, (e) => setField('segmentBase', parseFloat(e.target.value) || 0)),
          numField('红色阈值 redThreshold', form.redThreshold, (e) => setField('redThreshold', parseFloat(e.target.value) || 0)),
          numField('黄色警告 warnLow', form.warnLow, (e) => setField('warnLow', parseFloat(e.target.value) || 0)),
          numField('红色警告 warnDanger', form.warnDanger, (e) => setField('warnDanger', parseFloat(e.target.value) || 0)),
          numField('汇率 fxCny', form.fxCny, (e) => setField('fxCny', parseFloat(e.target.value) || 0)),
          React.createElement('div', { className: 'dsbd-modal-title', style: { marginTop: '4px' } }, '显示内容'),
          rowToggle('last', '本次用量'),
          rowToggle('lastModel', '本次使用模型'),
          rowToggle('total', '本会话累计'),
          rowToggle('calls', '本会话累计调用模型次数'),
          React.createElement('div', { className: 'dsbd-modal-foot' },
            React.createElement('button', { type: 'button', className: 'dsbd-btn reset', onClick: resetSettings }, '恢复默认'),
            React.createElement('button', { type: 'button', className: 'dsbd-btn', onClick: () => setSettingsOpen(false) }, '取消'),
            React.createElement('button', { type: 'button', className: 'dsbd-btn primary', onClick: saveSettings }, '确认'))))
        : null

      return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'dsbd-dock' },
          React.createElement('div', { className: 'dsbd-head' },
            React.createElement('div', { className: 'dsbd-head-left' },
              React.createElement('span', { className: 'dsbd-title' }, 'DeepSeek 余额'),
              React.createElement('button', {
                type: 'button',
                className: 'dsbd-refresh' + (spinning ? ' spin' : ''),
                title: '手动刷新',
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

        // ── 位置守护：检测其他插件注册到侧边栏底部时弹窗确认 ──
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
          fetch('/dsh-balance/guard-ask')
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
