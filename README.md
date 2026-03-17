# 🔍 AI Bias Detector

> Don't trust AI blindly — get a second opinion.
>
> 别盲信 AI 推荐。

**AI Bias Detector** is a lightweight, zero-config Chrome extension that detects potential biases in AI chatbot recommendations — in real time, right where you chat.

It works entirely locally. No API keys. No backend. No data leaves your browser.

[English](#features) · [中文](#功能特性)

---

## Why?

When you ask ChatGPT *"recommend a project management tool"*, it might suggest Notion — but did you know Notion is an OpenAI partner?  When you ask Gemini, it might lean toward Google Workspace — its own product.

AI assistants are incredibly helpful, but their recommendations can be influenced by:

- **Commercial relationships** between the AI vendor and recommended brands
- **Training data bias** — popular products get more coverage in training data
- **Rhetorical framing** — absolutist language like "the best" without alternatives
- **Missing context** — no pricing, no downsides, no competitors mentioned

AI Bias Detector makes these invisible patterns visible.

---

## Features

### 🎯 Zero-Config Bias Detection
Install and forget. The extension automatically analyzes AI responses on supported platforms.

### 🏢 Conflict of Interest Database
A curated, open-source database of commercial relationships between AI vendors and brands (OpenAI ↔ Microsoft, Google ↔ Workspace, Anthropic ↔ Amazon, etc.). When a conflict is detected, you get an instant alert.

### 📊 Bias Score (0-100)
Every AI response gets a composite score based on:
- **Concentration** — Does it recommend just one option, or give balanced alternatives?
- **Rhetoric** — Does it use absolutist language ("the best", "the only")?
- **Missing context** — Are downsides, pricing, or alternatives omitted?
- **Source opacity** — Does it cite vague "research" without specific references?

### 💬 One-Click Follow-Up
Smart follow-up prompts auto-generated based on detected biases. Click to send directly into the chat — no copy-paste needed.

### 🌍 Bilingual (English / 中文)
Full support for both English and Chinese interfaces and detection patterns.

### 👤 Two Modes
| Mode | For whom | What you see |
|------|----------|--------------|
| **Simple** | Everyone | Clean signals + suggestions |
| **Expert** | Developers & researchers | Full evidence + raw patterns + custom rules |

---

## Supported Platforms

| Platform | Status |
|----------|--------|
| ChatGPT (chatgpt.com) | ✅ Supported |
| Google Gemini | ✅ Supported |
| Perplexity AI | ✅ Supported |
| Claude (claude.ai) | ✅ Supported |
| Poe | 🔜 Coming soon |

---

## Install

### From Chrome Web Store (coming soon)

> We're preparing the first release for Chrome Web Store. Star this repo to get notified!

### From Source (Developer Mode)

```bash
# Clone the repo
git clone https://github.com/chenzhaohao/ai-bias-detector.git
cd ai-bias-detector

# Install dependencies
npm install

# Build the extension
npm run build

# The built extension is in the dist/ folder
```

Then load it in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  AI Chat Page (ChatGPT / Gemini / Perplexity / Claude)  │
└───────────────────────┬─────────────────────────────────┘
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
```

---

## Project Structure

```
ai-bias-detector/
├── manifest.json              # Chrome Extension Manifest V3
├── src/
│   ├── types/index.ts         # Core type definitions
│   ├── engine/
│   │   ├── analyzer.ts        # Main analysis orchestrator
│   │   ├── entity-extractor.ts # Brand / product recognition
│   │   ├── conflict-db.ts     # Vendor ↔ brand relationship database
│   │   └── rhetoric-patterns.ts # Linguistic bias pattern rules
│   ├── platforms/
│   │   └── base.ts            # Platform adapters (ChatGPT, Gemini, etc.)
│   ├── content/
│   │   ├── content.ts         # Content script entry point
│   │   ├── content.css        # Host-level styles
│   │   └── ui/panel.ts        # Floating panel (Shadow DOM)
│   ├── background/
│   │   └── service-worker.ts  # Background service worker
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI
│   │   └── popup.ts           # Popup logic
│   └── i18n/
│       └── messages.ts        # All UI strings (en/zh)
├── vite.config.ts             # Build configuration
├── tsconfig.json
└── package.json
```

---

## Contributing

We'd love your help! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick ways to contribute:

| Area | What's needed |
|------|---------------|
| 🏢 **Conflict Database** | Add more vendor ↔ brand relationships with public sources |
| 🔍 **Detection Patterns** | Add rhetoric / bias patterns for more languages |
| 🌐 **Platform Adapters** | Add support for more AI chat platforms |
| 🌍 **Translations** | Add more languages beyond English and Chinese |
| 🧪 **Testing** | Write unit tests for the analysis engine |
| 📝 **Documentation** | Improve docs, add tutorials, record demos |

---

## Roadmap

- [ ] v0.1 — Core detection engine + ChatGPT/Gemini/Perplexity/Claude support
- [ ] v0.2 — Chrome Web Store release
- [ ] v0.3 — Community-contributed conflict database expansion
- [ ] v0.4 — Firefox extension support
- [ ] v0.5 — Optional cross-model verification (bring your own API key)
- [ ] v1.0 — Custom rule builder UI for expert users

---

## Philosophy

1. **Privacy first** — All analysis runs locally. We will never collect, transmit, or store your conversations.
2. **Open data** — The conflict-of-interest database is fully transparent and community-maintained.
3. **No judgment** — We don't tell you what to think. We surface signals and let you decide.
4. **Inclusive by design** — Simple mode for everyone, Expert mode for power users.

---

## License

[MIT](LICENSE) — Use it, fork it, build on it.

---

## Star History

If this project helps you think more critically about AI recommendations, consider giving it a ⭐

---

<div align="center">

**Built with skepticism and care.**

*In the age of AI, the most powerful tool is a second opinion.*

</div>
