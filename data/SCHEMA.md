# Conflict Database Schema & Governance

## How We Ensure Data Integrity

This database is critical to the credibility of AI Bias Detector. We take accuracy seriously.

### Three-Layer Verification

| Layer | What it does | Automated? |
|-------|-------------|-----------|
| **CI Validation** | Checks JSON format, required fields, duplicate detection, URL format | Yes — blocks PR merge on failure |
| **Source URL Requirement** | Every entry MUST link to a public, verifiable source (press release, official blog, reputable news) | Yes — CI validates URL format |
| **Maintainer Review** | A human maintainer reviews every PR that modifies conflict-db.json | Manual — required for merge |

### Allowed Sources (by trust tier)

| Tier | Source type | Examples | Trustworthiness |
|------|-----------|---------|-----------------|
| **Tier 1** | Official company press releases / blog posts | openai.com/blog, about.meta.com | Highest |
| **Tier 2** | SEC filings, regulatory documents | sec.gov, ec.europa.eu | Highest |
| **Tier 3** | Major reputable tech media | techcrunch.com, reuters.com, bloomberg.com | High |
| **Tier 4** | Wikipedia (with inline citations) | en.wikipedia.org | Medium |
| **Rejected** | Social media, forums, personal blogs, anonymous sources | twitter.com, reddit.com, medium.com (personal) | Not accepted |

### Required Fields

```json
{
  "vendor": "openai",           // AI model vendor — must be lowercase
  "brand": "notion",            // Brand being recommended — must be lowercase
  "relationship": "partner",    // Must be from allowed list (see below)
  "source": "https://..."       // Public, verifiable HTTPS URL
}
```

### Allowed Relationship Types

| Type | Definition | Example |
|------|-----------|---------|
| `investor` | Vendor has direct financial investment in the brand | Amazon → Anthropic |
| `investor_product` | Brand is a product of the vendor's investor | Microsoft 365 ← OpenAI |
| `investor_cloud` | Investment tied to cloud infrastructure deal | AWS ← Anthropic |
| `exclusive_cloud` | Exclusive cloud hosting partnership | Azure ← OpenAI |
| `partner` | Official business/integration partnership | Notion ← OpenAI |
| `integration` | Deep product integration | Bing ← OpenAI |
| `subsidiary` | Brand is owned by / is a division of the vendor's parent | Google Docs ← Google |
| `technology_provider` | Vendor provides core technology to the brand | GitHub Copilot ← OpenAI |
| `parent_fund` | Vendor is a subsidiary of a fund/holding company | High-Flyer ← DeepSeek |
| `data_partner` | Data licensing/training data partnership | Reddit ← OpenAI |
| `acquirer` | Vendor has acquired the brand | (for future use) |

### What Gets Rejected

A PR will be rejected if:

1. ❌ No source URL provided
2. ❌ Source is from an unreliable origin (personal blog, tweet, rumor)
3. ❌ Relationship is speculative ("they might be partners because...")
4. ❌ Relationship has ended and is no longer active
5. ❌ Duplicate of an existing entry
6. ❌ Vendor or brand is not lowercase
7. ❌ Relationship type is not from the allowed list

### How to Challenge an Entry

If you believe an entry is incorrect:

1. Open an issue with the tag `data-dispute`
2. Provide evidence that the relationship does not exist or has ended
3. A maintainer will review and either update or remove the entry within 7 days

### Versioning

The `conflict-db.json` file is versioned via git history. Every change is traceable — who added it, when, and with what source.
