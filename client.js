// dsh-balance-dock — Client 半边（经典脚本 bundle）
// 通过 window.__ModuleLoader__.load 注册；factory 内可用浏览器全局（fetch/setInterval/document）。
// 与 Host 半通信走同源 HTTP 路由 /dsh-balance/*（避免 typert 远程贡献的复杂度）。
window.__ModuleLoader__.load({
  id: 'dsh-balance-dock',
  factory: (require) => {
    const React = require('react')

    const CSS = [
      '.dsbd-dock{flex:0 0 100%;box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:4px;padding:10px 12px;margin:6px 0;border:1.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,.12)}',
      '.dsbd-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.dsbd-title{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;letter-spacing:.03em}',
      '.dsbd-dot{width:9px;height:9px;border-radius:50%;flex:none}',
      '.dsbd-dot.ok{background:var(--dsw-alias-state-success-primary)}',
      '.dsbd-dot.warn{background:var(--dsw-alias-state-warn-primary)}',
      '.dsbd-dot.err{background:var(--dsw-alias-state-error-primary)}',
      '.dsbd-total{font-size:17px;font-weight:700;line-height:1.3}',
      '.dsbd-curr{font-size:12px;font-weight:600;margin-right:2px;color:var(--dsw-alias-label-secondary)}',
      '.dsbd-line{display:flex;align-items:baseline;justify-content:space-between;gap:8px}',
      '.dsbd-k{color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dsbd-v{font-size:12px;font-weight:500}',
      '.dsbd-div{height:1px;background:var(--dsw-alias-border-l1);margin:5px 0}',
      '.dsbd-note{font-size:11px}',
      '.dsbd-note.warn{color:var(--dsw-alias-state-warn-primary)}',
      '.dsbd-note.err{color:var(--dsw-alias-state-error-primary)}',
      '.dsbd-rail{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:22px;height:22px;margin:4px 2px;border:1.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-1)}',
      '.dsbd-rail .dsbd-dot{width:10px;height:10px}',
      '.dsbd-recharge-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;box-sizing:border-box;margin-top:8px;padding:7px 10px;border:1.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary);text-align:center}',
      '.dsbd-recharge-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
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

    function Dock(props) {
      const wide = props.wide === true
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : null
      const current = useSessions ? useSessions((s) => s.current) : undefined
      const [balance, setBalance] = React.useState(null)
      const [spend, setSpend] = React.useState(null)

      React.useEffect(() => {
        let alive = true
        const tick = () => {
          fetch('/dsh-balance/balance')
            .then((r) => r.json())
            .then((r) => { if (alive) setBalance(r) })
            .catch(() => {})
        }
        tick()
        const timer = setInterval(tick, 15000)
        return () => { alive = false; clearInterval(timer) }
      }, [])

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
      }, [current])

      const ok = balance && balance.ok === true
      const status = !ok ? 'err' : balance.total < 3 ? 'err' : balance.total < 10 ? 'warn' : 'ok'
      const curr = ok ? sym(balance.currency) : sym('CNY')
      const last = spend && spend.ok === true ? spend.last : null
      const total = spend && spend.ok === true ? spend.total : null
      const lastCny = last ? last.estCny : null
      const lastTok = last ? last.inputTokens + last.outputTokens : null
      const totalCny = total ? total.estCny : null
      const totalTok = total ? total.inputTokens + total.outputTokens : null
      const totalCalls = total ? total.calls : 0
      const warnText = ok && balance.total < 10 ? (balance.total < 3 ? '余额严重不足，建议尽快充值' : '余额偏低，建议充值') : ''
      const overrun = ok && totalCny !== null && balance.total > 0 && totalCny > balance.total

      const railTitle = ok
        ? 'DeepSeek 余额 ' + curr + balance.total.toFixed(2) + (totalCny !== null ? ' · 本会话累计 ' + sym('CNY') + fmt2(totalCny) : '')
        : (balance && balance.error) ? '余额查询失败：' + balance.error : 'DeepSeek 余额查询中…'

      // ── 进度条：轨道=充值金额（50元/段），绿色填充=剩余余额，从右端消耗 ──
      const SEG_BASE = 50
      const balanceTotal = ok ? balance.total : 0
      const refAmount = ok && balance.toppedUp > 0 ? balance.toppedUp : (ok ? balance.total : 0)
      const litYuan = refAmount > 0 ? Math.min(balanceTotal, refAmount) : 0
      const litSegs = litYuan > 0 ? Math.max(1, Math.ceil(litYuan / SEG_BASE)) : 0
      const partialYuan = litSegs > 0 ? litYuan - (litSegs - 1) * SEG_BASE : 0
      const partialFill = SEG_BASE > 0 ? partialYuan / SEG_BASE : 0
      const activeRed = partialYuan > 0 && partialYuan < 15
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
        ok ? balance.total.toFixed(2) : '—'))
      rows.push(React.createElement('div', { key: 'sub', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '赠金 / 充值'),
        React.createElement('span', { className: 'dsbd-v' }, ok
          ? curr + balance.granted.toFixed(2) + ' / ' + curr + balance.toppedUp.toFixed(2)
          : (balance && balance.error) ? '查询失败' : '…')))
      rows.push(React.createElement('div', { key: 'div', className: 'dsbd-div' }))
      rows.push(React.createElement('div', { key: 'last', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本次用量'),
        React.createElement('span', { className: 'dsbd-v' }, (lastTok !== null ? fmtInt(lastTok) + ' tokens' : '…') + (lastCny !== null ? ' · ≈' + sym('CNY') + fmt2(lastCny) : ''))))
      rows.push(React.createElement('div', { key: 'totals', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本会话累计'),
        React.createElement('span', { className: 'dsbd-v' }, (totalTok !== null ? fmtInt(totalTok) + ' tokens' : '…') + (totalCny !== null ? ' · ≈' + sym('CNY') + fmt2(totalCny) : ''))))
      rows.push(React.createElement('div', { key: 'calls', className: 'dsbd-line' },
        React.createElement('span', { className: 'dsbd-k' }, '本会话累计调用模型次数'),
        React.createElement('span', { className: 'dsbd-v' }, totalCalls > 0 ? fmtInt(totalCalls) + ' 次' : '…')))
      if (warnText) rows.push(React.createElement('div', { key: 'warn', className: 'dsbd-note warn' }, warnText))
      if (overrun) rows.push(React.createElement('div', { key: 'over', className: 'dsbd-note err' }, '本会话累计花费已超过账户余额'))
      if (balance && !ok) rows.push(React.createElement('div', { key: 'err', className: 'dsbd-note err' }, balance.error || '余额查询失败'))

      // 进度条：轨道=充值金额，绿色填充=剩余余额（按 50 元分段，从右端消耗）
      const fillSegs = []
      for (let i = 0; i < litSegs; i++) {
        const isRight = i === litSegs - 1
        const color = isRight && activeRed ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-success-primary)'
        const innerW = isRight ? (partialFill * 100).toFixed(2) + '%' : '100%'
        fillSegs.push(React.createElement('div', { key: 'fs' + i, className: 'dsbd-fill-seg' },
          React.createElement('div', { className: 'dsbd-fill-inner', style: { width: innerW, background: color } })))
      }
      rows.push(React.createElement('div', { key: 'bar', className: 'dsbd-track', title: ok ? ('剩余 ' + curr + balanceTotal.toFixed(2) + ' / 充值 ' + curr + refAmount.toFixed(2)) : '余额查询失败' },
        React.createElement('div', { className: 'dsbd-fill', style: { width: (fillRatio * 100).toFixed(2) + '%' } },
          fillSegs,
          burstId > 0
            ? React.createElement('div', { key: 'burst' + burstId, className: 'dsbd-burst', onAnimationEnd: () => setBurstId(0) })
            : null)))
      // 充值按钮（独立，进度条下方）
      rows.push(React.createElement('button', {
        key: 'recharge',
        type: 'button',
        className: 'dsbd-recharge-btn',
        title: '前往 DeepSeek 开放平台充值',
        onClick: () => { window.open('https://platform.deepseek.com/top_up', '_blank', 'noopener') },
      }, '充值 ↗'))

      return React.createElement('div', { className: 'dsbd-dock' },
        React.createElement('div', { className: 'dsbd-head' },
          React.createElement('span', { className: 'dsbd-title' }, 'DeepSeek 余额'),
          React.createElement('span', { className: 'dsbd-dot ' + status })),
        rows)
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
        let lastGuardAsk = Date.now() // 初始 30s 内不弹窗，避免启动期误报
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
