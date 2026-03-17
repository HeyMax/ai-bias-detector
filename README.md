# 🔍 AI Bias Detector

> Don't trust AI blindly — get a second opinion.
>
> 别盲信 AI 推荐。

**AI Bias Detector** is a lightweight, zero-config Chrome extension that detects potential biases in AI chatbot recommendations — in real time, right where you chat.

**AI Bias Detector** 是一个轻量级、零配置的 Chrome 浏览器插件，能够实时检测 AI 聊天机器人推荐中的潜在偏见。

It works entirely locally. No API keys. No backend. No data leaves your browser.

完全本地运行。不需要 API Key。没有后端。你的数据不会离开浏览器。

[English](#-why) · [中文](#-为什么需要它)

---

## 🤔 Why?

When you ask ChatGPT *"recommend a project management tool"*, it might suggest Notion — but did you know Notion is an OpenAI partner?  When you ask Gemini, it might lean toward Google Workspace — its own product.

AI assistants are incredibly helpful, but their recommendations can be influenced by:

- **Commercial relationships** between the AI vendor and recommended brands
- **Training data bias** — popular products get more coverage in training data
- **Rhetorical framing** — absolutist language like "the best" without alternatives
- **Missing context** — no pricing, no downsides, no competitors mentioned

AI Bias Detector makes these invisible patterns visible.

## 🤔 为什么需要它？

当你问 ChatGPT *"推荐一个项目管理工具"*，它可能会推荐 Notion——但你知道 Notion 是 OpenAI 的合作伙伴吗？当你问 Gemini，它可能偏向推荐 Google Workspace——这是它自家的产品。

AI 助手非常有用，但它们的推荐可能受到以下因素影响：

- **商业关系** — AI 厂商与被推荐品牌之间的合作/投资关系
- **训练数据偏见** — 热门产品在训练数据中有更多曝光
- **修辞偏向** — 使用"最好的"、"唯一的"等绝对化表述，不提替代方案
- **信息缺失** — 不提价格、不说缺点、不列竞品

AI Bias Detector 让这些隐形的模式变得可见。

---

## ✨ Features / 功能特性

### 🎯 Zero-Config Bias Detection / 零配置偏见检测
Install and forget. The extension automatically analyzes AI responses on supported platforms.

安装即用。插件会自动分析支持平台上的 AI 回复。

### 🏢 Conflict of Interest Database / 利益冲突数据库
A curated, open-source database of commercial relationships between AI vendors and brands (OpenAI ↔ Microsoft, Google ↔ Workspace, Anthropic ↔ Amazon, etc.). When a conflict is detected, you get an instant alert.

一个策划维护的、开源的 AI 厂商与品牌商业关系数据库（OpenAI ↔ 微软, Google ↔ Workspace, Anthropic ↔ 亚马逊等）。检测到冲突时会即时提醒。

### 📊 Bias Score (0-100) / 偏见指数 (0-100)
Every AI response gets a composite score based on:
- **Concentration** — Does it recommend just one option, or give balanced alternatives?
- **Rhetoric** — Does it use absolutist language ("the best", "the only")?
- **Missing context** — Are downsides, pricing, or alternatives omitted?
- **Source opacity** — Does it cite vague "research" without specific references?

每条 AI 回复都会得到一个综合评分，基于：
- **集中度** — 是只推荐了一个选项，还是给了平衡的多个选择？
- **修辞** — 是否使用了绝对化语言（"最好的"、"唯一的"）？
- **信息缺失** — 是否遗漏了缺点、价格或替代方案？
- **来源不透明** — 是否引用了模糊的"研究"而没有具体来源？

### 💬 One-Click Follow-Up / 一键追问
Smart follow-up prompts auto-generated based on detected biases. Click to send directly into the chat — no copy-paste needed.

基于检测到的偏见，自动生成智能追问提示。点击即可直接发送到聊天中，无需复制粘贴。

### 🌍 Bilingual (English / 中文) / 双语支持
Full support for both English and Chinese interfaces and detection patterns.

完整支持中英文界面和检测规则。

### 👤 Two Modes / 两种模式

| Mode 模式 | For whom 适合谁 | What you see 看到什么 |
|------|----------|--------------|
| **Simple 简洁** | Everyone 所有人 | Clean signals + suggestions 清晰的信号 + 建议 |
| **Expert 专家** | Developers & researchers 开发者和研究者 | Full evidence + raw patterns + custom rules 完整证据 + 原始规则 + 自定义规则 |

---

## 🌐 Supported Platforms / 支持的平台

| Platform 平台 | Status 状态 |
|----------|--------|
| ChatGPT (chatgpt.com) | ✅ Supported 已支持 |
| Google Gemini | ✅ Supported 已支持 |
| Perplexity AI | ✅ Supported 已支持 |
| Claude (claude.ai) | ✅ Supported 已支持 |
| 豆包 Doubao (doubao.com) | ✅ Supported 已支持 |
| DeepSeek (chat.deepseek.com) | ✅ Supported 已支持 |
| 腾讯元宝 Yuanbao (yuanbao.tencent.com) | ✅ Supported 已支持 |
| 通义千问 Qianwen (qianwen.com) | ✅ Supported 已支持 |
| Kimi (kimi.com) | ✅ Supported 已支持 |
| Poe | 🔜 Coming soon 即将支持 |

---

## 📦 Install / 安装

### From Chrome Web Store / 从 Chrome 应用商店安装 (coming soon / 即将上线)

> We're preparing the first release for Chrome Web Store. Star this repo to get notified!
>
> 我们正在准备首次发布。给这个仓库点个 Star 以获取通知！

### From Source / 从源码安装 (Developer Mode / 开发者模式)

```bash
# Clone the repo / 克隆仓库
git clone https://github.com/HeyMax/ai-bias-detector.git
cd ai-bias-detector

# Install dependencies / 安装依赖
npm install

# Build the extension / 构建扩展
npm run build

# The built extension is in the dist/ folder
# 构建产物在 dist/ 目录下
```

Then load it in Chrome / 然后在 Chrome 中加载:

1. Open `chrome://extensions/` / 打开 `chrome://extensions/`
2. Enable **Developer mode** (top right) / 开启右上角的**开发者模式**
3. Click **Load unpacked** / 点击**加载已解压的扩展程序**
4. Select the `dist/` folder / 选择 `dist/` 目录

---

## 🏗️ How It Works / 工作原理

```
┌────────────────────────────────────────────────────────────────────┐
│  AI Chat Page (ChatGPT / Gemini / Claude / 豆包 / DeepSeek / ...)  │
└───────────────────────┬────────────────────────────────────────────┘
                        │  DOM MutationObserver
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Content Script                                         │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐ │
│  │ Platform     │  │ Entity         │  │ Rhetoric    │ │
│  │ Adapter      │→ │ Extractor      │→ │ Pattern     │ │
│  │ (DOM parse)  │  │ (brand detect) │  │ Matcher     │ │
│  └──────────────┘  └────────────────┘  └─────────────┘ │
│         │                                     │         │
│         ▼                                     ▼         │
│  ┌──────────────┐                   ┌─────────────────┐ │
│  │ Conflict DB  │                   │ Analyzer        │ │
│  │ (local JSON) │──────────────────→│ (score + signals│ │
│  └──────────────┘                   │  + follow-ups)  │ │
│                                     └────────┬────────┘ │
│                                              ▼          │
│                                     ┌─────────────────┐ │
│                                     │ Panel UI        │ │
│                                     │ (Shadow DOM)    │ │
│                                     └─────────────────┘ │
└─────────────────────────────────────────────────────────┘

Everything runs locally. No network requests. No API keys.
所有分析在本地运行。无网络请求。无需 API Key。
```

---

## 📁 Project Structure / 项目结构

```
ai-bias-detector/
├── manifest.json              # Chrome Extension Manifest V3
├── src/
│   ├── types/index.ts         # Core type definitions / 核心类型定义
│   ├── engine/
│   │   ├── analyzer.ts        # Main analysis orchestrator / 分析引擎主入口
│   │   ├── entity-extractor.ts # Brand / product recognition / 品牌产品识别
│   │   ├── conflict-db.ts     # Vendor ↔ brand relationship DB / 利益冲突数据库
│   │   └── rhetoric-patterns.ts # Linguistic bias patterns / 修辞偏见模式
│   ├── platforms/
│   │   └── base.ts            # Platform adapters / 平台适配器
│   ├── content/
│   │   ├── content.ts         # Content script entry / 内容脚本入口
│   │   ├── content.css        # Host-level styles
│   │   └── ui/panel.ts        # Floating panel (Shadow DOM) / 浮动面板
│   ├── background/
│   │   └── service-worker.ts  # Background service worker
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI / 弹出窗口
│   │   └── popup.ts           # Popup logic
│   └── i18n/
│       └── messages.ts        # All UI strings (en/zh) / 全部界面文案
├── vite.config.ts             # Build configuration / 构建配置
├── tsconfig.json
└── package.json
```

---

## 🤝 Contributing / 参与贡献

We'd love your help! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

我们非常欢迎你的参与！查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### Quick ways to contribute / 快速参与方式:

| Area 领域 | What's needed 需要什么 |
|------|---------------|
| 🏢 **Conflict Database** 利益冲突数据库 | Add more vendor ↔ brand relationships with public sources 添加更多厂商-品牌关系 |
| 🔍 **Detection Patterns** 检测规则 | Add rhetoric / bias patterns for more languages 为更多语言添加检测模式 |
| 🌐 **Platform Adapters** 平台适配器 | Add support for more AI chat platforms 添加更多平台支持 |
| 🌍 **Translations** 翻译 | Add more languages beyond English and Chinese 添加更多语言 |
| 🧪 **Testing** 测试 | Write unit tests for the analysis engine 为分析引擎编写单元测试 |
| 📝 **Documentation** 文档 | Improve docs, add tutorials, record demos 改进文档、编写教程 |

---

## 🗺️ Roadmap / 路线图

- [ ] v0.1 — Core detection engine + 9 platforms (ChatGPT, Gemini, Perplexity, Claude, 豆包, DeepSeek, 元宝, 千问, Kimi) / 核心检测引擎 + 9 大平台支持
- [ ] v0.2 — Chrome Web Store release / Chrome 应用商店上架
- [ ] v0.3 — Community-contributed conflict database expansion / 社区共建利益冲突数据库
- [ ] v0.4 — Firefox extension support / Firefox 浏览器支持
- [ ] v0.5 — Optional cross-model verification (bring your own API key) / 可选跨模型验证（自带 API Key）
- [ ] v1.0 — Custom rule builder UI for expert users / 专家用户自定义规则编辑器

---

## 💡 Philosophy / 设计理念

1. **Privacy first / 隐私第一** — All analysis runs locally. We will never collect, transmit, or store your conversations. 所有分析在本地运行。我们永远不会收集、传输或存储你的对话。
2. **Open data / 数据开放** — The conflict-of-interest database is fully transparent and community-maintained. 利益冲突数据库完全透明，由社区维护。
3. **No judgment / 不做判断** — We don't tell you what to think. We surface signals and let you decide. 我们不告诉你应该怎么想。我们呈现信号，由你自己决定。
4. **Inclusive by design / 包容设计** — Simple mode for everyone, Expert mode for power users. 简洁模式给所有人，专家模式给进阶用户。

---

## 📄 License / 许可证

[MIT](LICENSE) — Use it, fork it, build on it. 随意使用、Fork、二次开发。

---

## ⭐ Star History

If this project helps you think more critically about AI recommendations, consider giving it a ⭐

如果这个项目帮助你更理性地看待 AI 推荐，请给个 ⭐

---

<div align="center">

**Built with skepticism and care. / 以怀疑精神，用心打造。**

*In the age of AI, the most powerful tool is a second opinion.*

*在 AI 时代，最强大的工具是第二种意见。*

</div>
