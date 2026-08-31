# dsh-balance-dock

A permanent DeepSeek Harness (DSH) plugin that shows your DeepSeek account balance, per-conversation spend and token usage, a segmented 50-yuan progress bar, and a recharge shortcut — all in a card docked **above the Settings button** in the left sidebar.

Works with both the wide sidebar (full card) and the collapsed 56px rail (status dot).

## Features

- **Account balance** — total, granted (赠送) and topped-up (充值) amounts, refreshed automatically. Uses the free DeepSeek `GET /user/balance` endpoint — **no tokens consumed**.
- **Per-conversation spend** — two figures:
  - `本次用量` (latest single model call): tokens + estimated cost of the most recent call.
  - `本会话累计` (conversation total): folded from the **durable session log**, so it survives DSH restarts. Cost is estimated per call using the actual model and DeepSeek's official pricing with peak/off-peak discounts.
  - `本会话累计调用模型次数`: how many times the model was called in this conversation.
- **50-yuan segmented progress bar** — the track represents your topped-up amount (50 yuan per segment); the green fill shows the remaining balance proportionally. Consumption depletes from the right; the rightmost segment turns **red below ¥15**; when a 50-yuan block is fully used it disappears with a *balloon-pop* effect and the fill smoothly stretches to the new width. Resizes with the sidebar.
- **Recharge button** — a separate button below the bar that opens the DeepSeek open platform top-up page in a new tab.
- **Low-balance alerts** — amber warning below ¥10, red alert below ¥3, and a "conversation spend exceeds balance" notice.
- **Position guard** — the card registers at the top of the sidebar footer; if another plugin registers into the sidebar footer or replaces the whole sidebar, a popup asks whether to allow the displacement or keep the balance card first.
- **Theme-aware** — uses DSH theme tokens, adapts to light/dark themes.

## Installation

### Prerequisites

- DeepSeek Harness installed and running (web profile).
- A DeepSeek API key stored in DSH credentials (`DEEPSEEK_API_KEY`) — normally set from **Settings → Models**. The plugin reuses the same credential the chat model uses.

### Option 1 — install from this repo (git)

```bash
# in your dsh profile directory (~/.dsh/profiles/web)
dsh plugin --profile web add git+https://github.com/doublemolu/dsh-balance-dock.git
```

### Option 2 — clone and link locally

```bash
git clone https://github.com/doublemolu/dsh-balance-dock.git
cd ~/.dsh/profiles/web
pnpm add file:/absolute/path/to/dsh-balance-dock
```

### Register the plugin row

Add the row to your profile composition `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: balance-dock
      name: dsh-balance-dock
```

### Restart DSH

Plugin-set changes take effect on restart. After restart the card appears above the Settings button automatically — it is a **permanent** plugin and survives restarts (no manual re-run needed).

## Usage

| Sidebar state | What you see |
|---|---|
| Wide sidebar | Full card: balance, granted/topped-up split, latest call usage, conversation total, model-call count, segmented progress bar, recharge button |
| Collapsed rail (56px) | Small status dot (green / amber / red) with a tooltip summary |

- Balance refreshes every 15s; conversation totals every 8s (cached fold of the session log). Use the ⟳ button on the card to refresh immediately.
- Click **充值 ↗** to open <https://platform.deepseek.com/top_up>.
- Hover the progress bar to see `剩余 ¥xx / 充值 ¥xx`; hover **本会话累计** to see per-model breakdown.
- A `▼/▲ ¥xx` indicator next to the balance shows recent changes; the card footer shows the last refresh time.

## Configuration (v1.1.0+)

All tunables live in `$DSH_HOME/dsh-balance-dock.json` (auto-generated with defaults on first run). Edit and save — the plugin picks changes up within ~10s.

```json
{
  "segmentBase": 50,
  "redThreshold": 15,
  "warnLow": 10,
  "warnDanger": 3,
  "fxCny": 7.1,
  "prices": {
    "deepseek-chat": { "in": 0.28, "inHit": 0.028, "out": 0.42 },
    "deepseek-reasoner": { "in": 0.55, "inHit": 0.14, "out": 2.19 }
  }
}
```

| Key | Meaning | Default |
|---|---|---|
| `segmentBase` | Progress-bar segment amount (yuan) | 50 |
| `redThreshold` | Rightmost segment turns red below this (yuan) | 15 |
| `warnLow` / `warnDanger` | Low-balance alert thresholds (yuan) | 10 / 3 |
| `fxCny` | Approximate CNY FX rate for cost estimates | 7.1 |
| `prices` | Per-model USD pricing per million tokens | official |

## How it works

- **Host half** (`lib/index.js`) registers same-origin HTTP routes on the DSH web server:
  - `GET /dsh-balance/balance` — resolves the `DEEPSEEK_API_KEY` credential and calls the official balance endpoint with Node's native `fetch` (no child process).
  - `GET /dsh-balance/spend` — live usage from an `llm/stream` interceptor + a durable fold of `assistant/message` events from the session log (per-call model, official pricing, peak/off-peak discount).
  - `GET /dsh-balance/config` — client-facing tunables.
  - `GET /dsh-balance/guard-ask` — position-guard popup via the user-questions service.
- **Client half** (`client.js`) is a classic-script bundle registered through `window.__ModuleLoader__.load`, rendering the card in the `sidebar.footer.action` slot and polling the routes with the browser's native `fetch`.

### Cost estimation notes

- Prices are estimates based on DeepSeek's official USD per-million-token pricing (`deepseek-chat`, `deepseek-reasoner`; unknown models fall back to chat pricing).
- Off-peak (16:30–00:30 UTC) applies the 50% discount automatically.
- CNY figures use a fixed approximate FX rate (7.1). Adjust `PRICES` / `FX_CNY` in `lib/index.js` if needed.

## Security & credentials

Your DeepSeek API key is **never stored, committed, or transmitted by this plugin**:

- The repository contains **no key material** — code only references the credential *name* `DEEPSEEK_API_KEY`. No `.credentials.yaml`, `.env`, or any secret file is committed.
- At runtime the key is resolved **locally** through the DSH credentials service (`credentials.resolve('DEEPSEEK_API_KEY')`) — the same credential store the chat model uses (normally `~/.dsh/.credentials.yaml` on your machine).
- The key travels only on your machine: credential store → plugin → child-process **environment variable** (never command-line arguments) → a TLS request to the official `api.deepseek.com` endpoint.
- The key is **never sent to the browser**, never logged, and never sent to GitHub or any third party.
- Error messages never include the key (child-process errors are truncated and contain no authorization header).

> Tip: the plugin is only as safe as your key itself. If you ever shared the key elsewhere, rotate it in the DeepSeek platform and update it in **Settings → Models**.

## Common issues

| Symptom | Cause / fix |
|---|---|
| Card shows `未配置 DEEPSEEK_API_KEY` | Store the key in **Settings → Models** (or export `DEEPSEEK_API_KEY` in the launching environment) |
| Card shows `HTTP 401 …` | The stored API key is invalid or expired |
| No card after install | The plugin row is missing from `cordis.patch.yml`, or DSH was not restarted |
| Balance never updates | `node` or `curl` not on PATH (both are normally present) |

## License

MIT
