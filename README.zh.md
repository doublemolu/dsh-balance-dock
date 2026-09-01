# 花知多少 · dsh-costometer

> **[English](README.md) | [中文](README.zh.md)**

一个永久性的 DeepSeek Harness（DSH）**花费与余额计量器**：在左侧边栏**设置按钮上方**常驻一张卡片，显示 DeepSeek 账户余额、充值记录、本会话花费与 token 用量、50 元分段进度条和充值入口。

同时适配宽侧栏（完整卡片）与折叠后的 56px 窄轨道（状态小圆点）。

## 名字的含义

**dsh-costometer** = **dsh**（DeepSeek Harness）+ **cost**（花费）+ **-ometer**（计量仪表）——一个"花钱计量器"。中文名 **花知多少**，取自"钱到底花去哪儿了？"的玩味说法：余额还剩多少、每个会话花了多少、充了多少钱、余额够不够用，一眼看清。

## 功能

- **账户余额** — 总额 / 赠金 / 充值金额，自动刷新。调用 DeepSeek 官方免费接口 `GET /user/balance`，**不消耗任何 token**。
- **本会话花费** — 两个维度：
  - `本次用量`（最近一次模型调用）：单次调用的 token 数与估算费用。
  - `本会话累计`（会话总量）：从**持久会话日志**折叠得出，**重启 DSH 也不丢失**；按每次调用的真实模型 + 官方**人民币峰谷价目表**估算。
  - `本会话累计调用模型次数`：本会话一共调用了多少次模型。
- **充值记录** — `最近充值`（最近一次充值的时间 + 金额）+ `累计充值`（充值总和），通过观测余额增长本地追踪（官方 API 不提供充值历史）。
- **50 元分段进度条** — 轨道 = 充值金额（每段 50 元），绿色填充 = 剩余余额的比例。从右端开始消耗；最右一段剩余 **低于 ¥15 变红**；某段耗尽时以"气球爆裂"特效消失，剩余填充丝滑过渡到新宽度。随侧边栏宽度自适应。
- **充值按钮** — 进度条下方独立按钮，点击在新标签页打开 DeepSeek 开放平台充值页。
- **低余额提醒** — 低于 ¥10 黄色警示、低于 ¥3 红色警示，以及"本会话花费已超过余额"提示。
- **8 种语言与货币** — 简体中文 / 繁體中文 / English (US/UK) / Deutsch / 日本語 / 한국어 / Русский；每种语言默认对应货币（CNY/TWD/USD/GBP/EUR/JPY/KRW/RUB），汇率**自动更新**（以人民币为基准，免费 API，**零 token 消耗**）。
- **位置守护** — 卡片以最高优先级注册在侧边栏底部；若其他插件注册到同一区域或替换整个侧边栏，会弹窗询问"允许挤占"还是"保持余额卡片优先"。
- **主题适配** — 全部使用 DSH 主题 token，深/浅色主题自动适配。

## 安装

### 前置条件

- 已安装并运行 DeepSeek Harness（web profile）。
- DSH 凭据中已配置 `DEEPSEEK_API_KEY`（通常在 **设置 → Models** 填写，插件与聊天模型复用同一个 Key）。

### 方式一：从本仓库安装（git）

```bash
# 在 DSH profile 目录下（~/.dsh/profiles/web）
dsh plugin --profile web add git+https://github.com/doublemolu/dsh-costometer.git
```

### 方式二：clone 后本地链接

```bash
git clone https://github.com/doublemolu/dsh-costometer.git
cd ~/.dsh/profiles/web
pnpm add file:/绝对路径/dsh-costometer
```

### 注册插件行

在 profile 组成文件 `~/.dsh/profiles/web/cordis.patch.yml` 中加入：

```yaml
- insert:
    - id: balance-dock
      name: dsh-costometer
```

### 重启 DSH

插件集的变更需重启生效。重启后卡片自动出现在设置按钮上方——它是**永久插件**，重启不会消失，也无需手动运行。

## 使用说明

| 侧边栏状态 | 显示内容 |
|---|---|
| 宽侧栏 | 完整卡片：余额、赠金/充值、本次用量、本会话累计、模型调用次数、分段进度条、充值按钮 |
| 折叠窄轨道 | 状态小圆点（绿/黄/红）+ 悬停摘要 |

- 余额每 15 秒刷新；会话统计每 8 秒刷新（日志折叠有 15s 缓存）。卡片上的 ⟳ 按钮可手动立即刷新。
- 点击 **充值 ↗** 打开 <https://platform.deepseek.com/top_up>。
- 悬停进度条可查看 `剩余 ¥xx / 充值 ¥xx`；悬停"本会话累计"可查看按模型拆分的明细。
- 余额旁的 `▼/▲ ¥xx` 提示最近变化；卡片底部显示最后刷新时间。

## 配置（v1.1.0+）

所有可调项都放在 `$DSH_HOME/dsh-costometer.json`（首次运行自动生成默认配置）。改完保存即可，约 10 秒内生效。

```json
{
  "segmentBase": 50,
  "redThreshold": 15,
  "warnLow": 10,
  "warnDanger": 3,
  "fxCny": 7.1,
  "lang": "zh-CN",
  "currency": "CNY",
  "prices": {
    "deepseek-v4-flash": { "peak": { "in": 3.0, "inHit": 0.10, "out": 9.0 }, "off": { "in": 1.5, "inHit": 0.05, "out": 4.5 } },
    "deepseek-v4": { "peak": { "in": 3.0, "inHit": 0.10, "out": 9.0 }, "off": { "in": 1.5, "inHit": 0.05, "out": 4.5 } },
    "deepseek-chat": { "peak": { "in": 2.0, "inHit": 0.20, "out": 3.0 }, "off": { "in": 1.0, "inHit": 0.10, "out": 1.5 } },
    "deepseek-reasoner": { "peak": { "in": 4.0, "inHit": 1.0, "out": 16.0 }, "off": { "in": 2.0, "inHit": 0.5, "out": 8.0 } }
  }
}
```

| 字段 | 含义 | 默认 |
|---|---|---|
| `segmentBase` | 进度条每段金额（元） | 50 |
| `redThreshold` | 最右段剩余低于该值变红（元） | 15 |
| `warnLow` / `warnDanger` | 低余额提醒阈值（元） | 10 / 3 |
| `fxCny` | 仅用于费用估算的次要美元换算（estUsd）；费用本身直接按人民币计价 | 7.1 |
| `lang` | 界面语言：`zh-CN` / `zh-TW` / `en-US` / `en-GB` / `de` / `ja` / `ko` / `ru` | zh-CN |
| `currency` | 显示货币：`CNY` / `TWD` / `USD` / `GBP` / `EUR` / `JPY` / `KRW` / `RUB`（对人民币自动汇率） | CNY |
| `rates` | 内置兜底汇率（1 人民币兑各货币）；实时汇率从免费 API 自动拉取（多端点兜底）、6 小时缓存、**零 token 消耗** | 内置 |
| `prices` | 各模型官方**人民币峰谷价**（`peak` / `off` 两套，每百万 token） | 官方 |
| `prices` | 各模型美元价目（每百万 token） | 官方 |

## 工作原理

- **Host 半边**（`lib/index.js`）在 DSH web server 上注册同源 HTTP 路由：
  - `GET /dsh-balance/balance` — 解析 `DEEPSEEK_API_KEY` 凭据，用 **Node 原生 fetch** 直接调用官方余额接口（无子进程）。
  - `GET /dsh-balance/spend` — 实时用量来自 `llm/stream` 拦截器；会话累计从持久日志的 `assistant/message` 事件折叠（按调用真实模型 + 官方价目表 + 峰谷折扣）。
  - `GET /dsh-balance/config` — 客户端所需可配置项。
  - `GET /dsh-balance/guard-ask` — 位置守护弹窗（user-questions 服务）。
- **Client 半边**（`client.js`）为经典脚本 bundle（`window.__ModuleLoader__.load`），把卡片渲染进 `sidebar.footer.action` 槽位，用浏览器原生 `fetch` 轮询上述路由。

### 费用估算说明

- 费用**直接按人民币计价**：使用 DeepSeek 官方**人民币峰谷价目表**（`deepseek-v4-flash` / `deepseek-v4` / `deepseek-chat` / `deepseek-reasoner`，每百万 token；未知模型按 chat 价）。
- 每次调用按**时间戳**自动选择峰/谷价（谷时段 16:30–00:30 UTC）。
- `fxCny` 不是计价汇率——它只用于换算次要的美元估算值（estUsd）。要调整估算，修改配置文件中的 `prices` 段。

## 安全性与凭证

你的 DeepSeek API Key **绝不会被本插件存储、提交或对外传输**：

- 仓库中**不含任何密钥内容**——代码只引用凭据*名称* `DEEPSEEK_API_KEY`，不会提交 `.credentials.yaml`、`.env` 或任何密钥文件。
- 运行时通过 DSH 凭据服务**本地解析**（`credentials.resolve('DEEPSEEK_API_KEY')`）——与聊天模型共用同一个凭据库（通常是你机器上的 `~/.dsh/.credentials.yaml`）。
- Key 只在你本机流转：凭据库 → 插件 → 子进程**环境变量**（绝不出现在命令行参数中）→ 经 TLS 直连官方 `api.deepseek.com` 接口。
- Key **不会下发到浏览器**、不会写入日志、更不会发送给 GitHub 或任何第三方。
- 错误信息绝不含 Key（子进程错误已截断且不包含认证头）。

> 提示：插件本身是安全的，但 Key 的安全性取决于它本身是否泄露过。如果你曾在别处分享过该 Key，请在 DeepSeek 平台重新生成，并在 **设置 → Models** 中更新。

## 常见问题

| 现象 | 原因 / 解决 |
|---|---|
| 卡片显示 `未配置 DEEPSEEK_API_KEY` | 在 **设置 → Models** 填写 Key（或在启动环境导出 `DEEPSEEK_API_KEY`） |
| 卡片显示 `HTTP 401 …` | 存储的 API Key 无效或过期 |
| 安装后没有卡片 | `cordis.patch.yml` 缺少插件行，或未重启 DSH |
| 余额不更新 | PATH 中没有 `node` 或 `curl`（两者通常都存在） |

## License

MIT
