/**
 * Publicly-documented commercial relationships between AI model vendors
 * and brands they might recommend.  Every entry must cite a verifiable
 * public source.  Contributions welcome — see CONTRIBUTING.md.
 */

import type { ConflictEntry } from '../types/index.js';

export const CONFLICT_DATABASE: ConflictEntry[] = [
  // ── OpenAI ──────────────────────────────────────────────
  {
    vendor: 'openai',
    brand: 'microsoft',
    relationship: 'investor',
    source: 'https://openai.com/blog/openai-and-microsoft-extend-partnership',
  },
  {
    vendor: 'openai',
    brand: 'microsoft 365',
    relationship: 'investor_product',
    source: 'https://openai.com/blog/openai-and-microsoft-extend-partnership',
  },
  {
    vendor: 'openai',
    brand: 'azure',
    relationship: 'exclusive_cloud',
    source: 'https://openai.com/blog/openai-and-microsoft-extend-partnership',
  },
  {
    vendor: 'openai',
    brand: 'bing',
    relationship: 'integration',
    source: 'https://blogs.microsoft.com/blog/2023/02/07/reinventing-search-with-a-new-ai-powered-microsoft-bing-and-edge/',
  },
  {
    vendor: 'openai',
    brand: 'github copilot',
    relationship: 'technology_provider',
    source: 'https://github.blog/2023-03-22-github-copilot-x-the-ai-powered-developer-experience/',
  },
  {
    vendor: 'openai',
    brand: 'notion',
    relationship: 'partner',
    source: 'https://www.notion.so/product/ai',
  },
  {
    vendor: 'openai',
    brand: 'shopify',
    relationship: 'partner',
    source: 'https://www.shopify.com/magic',
  },
  {
    vendor: 'openai',
    brand: 'stripe',
    relationship: 'partner',
    source: 'https://stripe.com/newsroom/news/stripe-and-openai',
  },

  // ── Google / Gemini ─────────────────────────────────────
  {
    vendor: 'google',
    brand: 'google workspace',
    relationship: 'subsidiary',
    source: 'https://workspace.google.com/',
  },
  {
    vendor: 'google',
    brand: 'google docs',
    relationship: 'subsidiary',
    source: 'https://workspace.google.com/',
  },
  {
    vendor: 'google',
    brand: 'google sheets',
    relationship: 'subsidiary',
    source: 'https://workspace.google.com/',
  },
  {
    vendor: 'google',
    brand: 'google cloud',
    relationship: 'subsidiary',
    source: 'https://cloud.google.com/',
  },
  {
    vendor: 'google',
    brand: 'android',
    relationship: 'subsidiary',
    source: 'https://www.android.com/',
  },
  {
    vendor: 'google',
    brand: 'youtube',
    relationship: 'subsidiary',
    source: 'https://www.youtube.com/',
  },
  {
    vendor: 'google',
    brand: 'chrome',
    relationship: 'subsidiary',
    source: 'https://www.google.com/chrome/',
  },
  {
    vendor: 'google',
    brand: 'pixel',
    relationship: 'subsidiary',
    source: 'https://store.google.com/category/phones',
  },

  // ── Anthropic / Claude ──────────────────────────────────
  {
    vendor: 'anthropic',
    brand: 'amazon',
    relationship: 'investor',
    source: 'https://www.aboutamazon.com/news/company-news/amazon-anthropic-ai',
  },
  {
    vendor: 'anthropic',
    brand: 'aws',
    relationship: 'investor_cloud',
    source: 'https://www.aboutamazon.com/news/company-news/amazon-anthropic-ai',
  },
  {
    vendor: 'anthropic',
    brand: 'google cloud',
    relationship: 'investor',
    source: 'https://cloud.google.com/blog/products/ai-machine-learning/google-cloud-invests-in-anthropic',
  },
  {
    vendor: 'anthropic',
    brand: 'notion',
    relationship: 'partner',
    source: 'https://www.notion.so/product/ai',
  },

  // ── Meta / Llama ────────────────────────────────────────
  {
    vendor: 'meta',
    brand: 'instagram',
    relationship: 'subsidiary',
    source: 'https://about.meta.com/',
  },
  {
    vendor: 'meta',
    brand: 'whatsapp',
    relationship: 'subsidiary',
    source: 'https://about.meta.com/',
  },
  {
    vendor: 'meta',
    brand: 'facebook',
    relationship: 'subsidiary',
    source: 'https://about.meta.com/',
  },
  {
    vendor: 'meta',
    brand: 'meta quest',
    relationship: 'subsidiary',
    source: 'https://about.meta.com/',
  },

  // ── Baidu / ERNIE ───────────────────────────────────────
  {
    vendor: 'baidu',
    brand: 'baidu cloud',
    relationship: 'subsidiary',
    source: 'https://cloud.baidu.com/',
  },
  {
    vendor: 'baidu',
    brand: 'baidu maps',
    relationship: 'subsidiary',
    source: 'https://map.baidu.com/',
  },

  // ── ByteDance / Doubao ──────────────────────────────────
  {
    vendor: 'bytedance',
    brand: 'douyin',
    relationship: 'subsidiary',
    source: 'https://www.douyin.com/',
  },
  {
    vendor: 'bytedance',
    brand: 'tiktok',
    relationship: 'subsidiary',
    source: 'https://www.tiktok.com/',
  },
  {
    vendor: 'bytedance',
    brand: 'volcano engine',
    relationship: 'subsidiary',
    source: 'https://www.volcengine.com/',
  },
];

const vendorPlatformMap: Record<string, string[]> = {
  openai:    ['chatgpt'],
  google:    ['gemini'],
  anthropic: ['claude'],
  meta:      ['poe'],
  baidu:     ['ernie', 'wenxin'],
  bytedance: ['doubao'],
};

export function findConflicts(
  platform: string,
  entityNames: string[],
): ConflictEntry[] {
  return findConflictsFromList(CONFLICT_DATABASE, platform, entityNames);
}

/**
 * Same logic but accepts an arbitrary conflict list — used by the
 * analyzer when remote data is available.
 */
export function findConflictsFromList(
  db: ConflictEntry[],
  platform: string,
  entityNames: string[],
): ConflictEntry[] {
  const lowerPlatform = platform.toLowerCase();
  const vendors = Object.entries(vendorPlatformMap)
    .filter(([, platforms]) => platforms.some(p => lowerPlatform.includes(p)))
    .map(([vendor]) => vendor);

  if (vendors.length === 0) return [];

  const lowerEntities = entityNames.map(n => n.toLowerCase());

  return db.filter(
    entry =>
      vendors.includes(entry.vendor) &&
      lowerEntities.some(e => e.includes(entry.brand) || entry.brand.includes(e)),
  );
}
