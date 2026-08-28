# dsh-balance-dock

一个永久性的 DeepSeek Harness（DSH）插件：在左侧边栏**设置按钮上方**常驻一张余额卡片，显示 DeepSeek 账户余额、本会话花费与 token 用量、50 元分段进度条和充值入口。

同时适配宽侧栏（完整卡片）与折叠后的 56px 窄轨道（状态小圆点）。

## 功能

- **账户余额** — 总额 / 赠金 / 充值金额，自动刷新。调用 DeepSeek 官方免费接口 `GET /user/balance`，**不消耗任何 token**。
- **本会话花费** — 两个维度：
  - `本次用量`（最近一次模型调用）：单次调用的 token 数与估算费用。
  - `本会话累计`（会话总量）：从**持久会话日志**折叠得出，**重启 DSH 也不丢失**；按每次调用的真实模型 + 官方价目表 + 峰谷折扣估算。
  - `本会话累计调用模型次数`：本会话一共调用了多少次模型。
- **50 元分段进度条** — 轨道 = 充值金额（每段 50 元），绿色填充 = 剩余余额的比例。从右端开始消耗；最右一段剩余 **低于 ¥15 变红**；某段耗尽时以"气球爆裂"特效消失，剩余填充丝滑过渡到新宽度。随侧边栏宽度自适应。
- **充值按钮** — 进度条下方独立按钮，点击在新标签页打开 DeepSeek 开放平台充值页。
- **低余额提醒** — 低于 ¥10 黄色警示、低于 ¥3 红色警示，以及"本会话花费已超过余额"提示。
- **位置守护** — 卡片以最高优先级注册在侧边栏底部；若其他插件注册到同一区域或替换整个侧边栏，会弹窗询问"允许挤占"还是"保持余额卡片优先"。
- **主题适配** — 全部使用 DSH 主题 token，深/浅色主题自动适配。

## 安装

### 前置条件

- 已安装并运行 DeepSeek Harness（web profile）。
- DSH 凭据中已配置 `DEEPSEEK_API_KEY`（通常在 **设置 → Models** 填写，插件与聊天模型复用同一个 Key）。

### 方式一：从本仓库安装（git）

```bash
# 在 DSH profile 目录下（~/.dsh/profiles/web）
dsh plugin --profile web add git+https://github.com/<你的账号>/dsh-balance-dock.git
```

### 方式二：clone 后本地链接

```bash
git clone https://github.com/<你的账号>/dsh-balance-dock.git
cd ~/.dsh/profiles/web
pnpm add file:/绝对路径/dsh-balance-dock
```

### 注册插件行

在 profile 组成文件 `~/.dsh/profiles/web/cordis.patch.yml` 中加入：

```yaml
- insert:
    - id: balance-dock
      name: dsh-balance-dock
```

### 重启 DSH

插件集的变更需重启生效。重启后卡片自动出现在设置按钮上方——它是**永久插件**，重启不会消失，也无需手动运行。

## 使用说明

| 侧边栏状态 | 显示内容 |
|---|---|
| 宽侧栏 | 完整卡片：余额、赠金/充值、本次用量、本会话累计、模型调用次数、分段进度条、充值按钮 |
| 折叠窄轨道 | 状态小圆点（绿/黄/红）+ 悬停摘要 |

- 余额每 15 秒刷新；会话统计每 8 秒刷新（日志折叠有 15s 缓存）。
- 点击 **充值 ↗** 打开 <https://platform.deepseek.com/top_up>。
- 悬停进度条可查看 `剩余 ¥xx / 充值 ¥xx`。

## 工作原理

- **Host 半边**（`lib/index.js`）在 DSH web server 上注册三条同源 HTTP 路由：
  - `GET /dsh-balance/balance` — 解析 `DEEPSEEK_API_KEY` 凭据，通过子进程调用官方余额接口（插件环境无 fetch，使用 `node`/`curl`）。
  - `GET /dsh-balance/spend` — 实时用量来自 `llm/stream` 拦截器；会话累计从持久日志的 `assistant/message` 事件折叠（按调用真实模型 + 官方价目表 + 峰谷折扣）。
  - `GET /dsh-balance/guard-ask` — 位置守护弹窗（user-questions 服务）。
- **Client 半边**（`client.js`）为经典脚本 bundle（`window.__ModuleLoader__.load`），把卡片渲染进 `sidebar.footer.action` 槽位，用浏览器原生 `fetch` 轮询上述路由。

### 费用估算说明

- 价格基于 DeepSeek 官方美元/百万 token 价目表（`deepseek-chat`、`deepseek-reasoner`；未知模型按 chat 价）。
- 谷时段（16:30–00:30 UTC）自动按 5 折计。
- 人民币按固定近似汇率 7.1 换算。如需调整，修改 `lib/index.js` 中的 `PRICES` / `FX_CNY`。

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
