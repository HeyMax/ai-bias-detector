# Contributing to AI Bias Detector

Thank you for your interest in contributing! This project exists to make AI recommendations more transparent, and we need the community's help to do it well.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Contributing to the Conflict Database](#contributing-to-the-conflict-database)
- [Adding Detection Patterns](#adding-detection-patterns)
- [Adding Platform Support](#adding-platform-support)
- [Adding Translations](#adding-translations)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

- Be respectful and constructive
- Focus on facts and verifiable sources
- No brand bashing — we detect bias, we don't create it
- Assume good intent from all contributors

---

## How Can I Contribute?

### 🏢 Expand the Conflict Database (Easiest!)

This is the single most impactful contribution you can make. Our conflict database tracks publicly-documented commercial relationships between AI vendors and brands.

**No coding required** — just edit a JSON-like TypeScript file.

### 🔍 Add Detection Patterns

Help us detect more types of bias across more languages.

### 🌐 Add Platform Support

We need adapters for more AI chat platforms (Poe, DeepSeek, Kimi, etc.).

### 🌍 Add Translations

Currently we support English and Chinese. Help us add more languages.

### 🧪 Write Tests

Our analysis engine needs comprehensive unit tests.

### 🐛 Report Bugs

Found a false positive? Detection not working on a platform? [Open an issue](https://github.com/chenzhaohao/ai-bias-detector/issues).

---

## Development Setup

```bash
# Clone
git clone https://github.com/chenzhaohao/ai-bias-detector.git
cd ai-bias-detector

# Install deps
npm install

# Build (one-time)
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev
```

Load the `dist/` folder as an unpacked extension in Chrome (see README).

---

## Contributing to the Conflict Database

Edit `src/engine/conflict-db.ts`. Each entry requires:

```typescript
{
  vendor: 'openai',           // AI model vendor (lowercase)
  brand: 'notion',            // Brand being recommended (lowercase)
  relationship: 'partner',    // Relationship type (see below)
  source: 'https://...',      // PUBLIC, verifiable source URL
}
```

### Relationship Types

| Type | Meaning |
|------|---------|
| `investor` | Vendor has invested in the brand |
| `investor_product` | Brand is a product of the vendor's investor |
| `subsidiary` | Brand is a subsidiary / owned by the vendor |
| `partner` | Official business partnership |
| `integration` | Deep product integration |
| `exclusive_cloud` | Exclusive cloud hosting deal |
| `technology_provider` | Vendor provides core tech to the brand |

### Rules for Conflict Entries

1. **Must be publicly documented** — link to an official blog post, press release, or reputable news article
2. **Must be a direct commercial relationship** — not just "they both use AWS"
3. **Must be current** — if a partnership ended, don't include it (or mark it)
4. **Brand names should be lowercase** for consistent matching

---

## Adding Detection Patterns

Edit `src/engine/rhetoric-patterns.ts`. Each pattern needs:

```typescript
{
  id: 'rhet_your_pattern_id',      // Unique ID
  regex: /your regex here/gi,       // Pattern to match
  category: 'rhetoric',             // BiasCategory type
  severity: 'medium',               // low | medium | high | critical
  title: {
    en: 'English title',
    zh: '中文标题',
  },
  description: {
    en: 'What this pattern means...',
    zh: '这个模式意味着...',
  },
  suggestion: {
    en: 'What the user should ask...',
    zh: '建议用户追问...',
  },
}
```

### Guidelines for Patterns

- **Conservative** — prefer false negatives over false positives
- **Bilingual** — add both English and Chinese variants when possible
- **Contextual** — the regex should be specific enough to avoid matching normal text
- **Actionable** — the suggestion should be a concrete follow-up question

---

## Adding Platform Support

Create or modify adapters in `src/platforms/base.ts`. Each adapter implements:

```typescript
interface PlatformAdapter {
  name: Platform;
  responseSelector: string;        // CSS selector for AI response containers
  matchesUrl(url: string): boolean;
  extractText(el: Element): string;
  getInputElement(): HTMLElement | null;
  sendMessage(text: string): void;
}
```

### Tips

- AI chat platforms change their DOM frequently — use stable selectors (data attributes > class names)
- Test with the platform's latest version
- The `sendMessage` implementation needs to simulate user input events properly

---

## Adding Translations

1. Add your locale to `src/types/index.ts`:
   ```typescript
   export type Locale = 'en' | 'zh' | 'ja'; // add new locale
   ```

2. Add translations to `src/i18n/messages.ts` for every key.

3. Add translations to every `title`, `description`, and `suggestion` in:
   - `src/engine/rhetoric-patterns.ts`
   - `src/engine/analyzer.ts`

---

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Run `npm run build` to verify the build succeeds
4. Write a clear PR description explaining what and why
5. If adding conflict entries, include the source URLs
6. If adding patterns, explain the false-positive risk

### PR Title Convention

```
feat: add Poe platform adapter
fix: false positive in absolutist detection for Chinese
data: add ByteDance/Doubao conflict entries
i18n: add Japanese translations
docs: improve contributing guide
```

---

## Questions?

Open an issue or start a discussion. We're friendly!
