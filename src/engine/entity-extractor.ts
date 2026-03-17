/**
 * Lightweight named-entity extraction for product / service / brand
 * mentions in AI responses.  No ML models — runs entirely on
 * heuristics + a curated brand dictionary.
 */

import type { RecommendedEntity } from '../types/index.js';

const KNOWN_BRANDS: Record<string, string> = {
  // Software & SaaS
  'notion': 'software', 'linear': 'software', 'jira': 'software',
  'asana': 'software', 'trello': 'software', 'monday.com': 'software',
  'clickup': 'software', 'basecamp': 'software', 'todoist': 'software',
  'slack': 'software', 'discord': 'software', 'teams': 'software',
  'zoom': 'software', 'google meet': 'software',
  'figma': 'software', 'sketch': 'software', 'canva': 'software',
  'photoshop': 'software', 'illustrator': 'software',
  'vscode': 'software', 'vs code': 'software', 'visual studio code': 'software',
  'intellij': 'software', 'webstorm': 'software', 'cursor': 'software',
  'sublime text': 'software', 'neovim': 'software',
  'github': 'platform', 'gitlab': 'platform', 'bitbucket': 'platform',
  'vercel': 'platform', 'netlify': 'platform', 'heroku': 'platform',
  'supabase': 'platform', 'firebase': 'platform',
  'docker': 'software', 'kubernetes': 'software',
  'chatgpt': 'ai', 'claude': 'ai', 'gemini': 'ai', 'copilot': 'ai',
  'perplexity': 'ai', 'midjourney': 'ai',
  'notion ai': 'ai', 'grammarly': 'ai',

  // Cloud providers
  'aws': 'cloud', 'amazon web services': 'cloud',
  'google cloud': 'cloud', 'gcp': 'cloud',
  'azure': 'cloud', 'microsoft azure': 'cloud',
  'alibaba cloud': 'cloud', 'tencent cloud': 'cloud',

  // Hardware
  'iphone': 'hardware', 'samsung galaxy': 'hardware', 'pixel': 'hardware',
  'macbook': 'hardware', 'thinkpad': 'hardware', 'surface': 'hardware',
  'ipad': 'hardware', 'airpods': 'hardware',

  // Services
  'uber': 'service', 'lyft': 'service',
  'doordash': 'service', 'grubhub': 'service',
  'spotify': 'service', 'apple music': 'service', 'youtube music': 'service',
  'netflix': 'service', 'disney+': 'service', 'hbo max': 'service',
  'amazon prime': 'service',

  // Payment
  'stripe': 'fintech', 'paypal': 'fintech', 'square': 'fintech',

  // Chinese ecosystem
  '飞书': 'software', '钉钉': 'software', '企业微信': 'software',
  '语雀': 'software', '腾讯文档': 'software', '石墨文档': 'software',
  '阿里云': 'cloud', '腾讯云': 'cloud', '华为云': 'cloud',
  '百度网盘': 'service', '夸克': 'software',
  '淘宝': 'platform', '京东': 'platform', '拼多多': 'platform',
  '美团': 'service', '饿了么': 'service',
  '微信支付': 'fintech', '支付宝': 'fintech',
  '抖音': 'platform', '小红书': 'platform', 'bilibili': 'platform',
};

const POSITIVE_WORDS = new Set([
  'excellent', 'amazing', 'great', 'best', 'fantastic', 'superior',
  'outstanding', 'perfect', 'recommended', 'powerful', 'intuitive',
  'robust', 'comprehensive', 'leading', 'top', 'premier',
  '优秀', '出色', '强大', '最好', '领先', '推荐', '顶级', '首选',
]);

const NEGATIVE_WORDS = new Set([
  'poor', 'bad', 'terrible', 'awful', 'limited', 'lacking', 'weak',
  'outdated', 'expensive', 'overpriced', 'complex', 'difficult',
  '差', '不好', '昂贵', '复杂', '落后', '有限', '不足',
]);

export function extractEntities(text: string): RecommendedEntity[] {
  const entities: Map<string, RecommendedEntity> = new Map();
  const lowerText = text.toLowerCase();

  for (const [brand, category] of Object.entries(KNOWN_BRANDS)) {
    const lowerBrand = brand.toLowerCase();
    let index = lowerText.indexOf(lowerBrand);
    if (index === -1) continue;

    let mentionCount = 0;
    let searchFrom = 0;
    while ((index = lowerText.indexOf(lowerBrand, searchFrom)) !== -1) {
      mentionCount++;
      searchFrom = index + lowerBrand.length;
    }

    const contextRadius = 150;
    const firstIndex = lowerText.indexOf(lowerBrand);
    const contextStart = Math.max(0, firstIndex - contextRadius);
    const contextEnd = Math.min(text.length, firstIndex + lowerBrand.length + contextRadius);
    const context = lowerText.slice(contextStart, contextEnd);

    let sentimentScore = 0;
    for (const word of POSITIVE_WORDS) {
      if (context.includes(word)) sentimentScore += 0.15;
    }
    for (const word of NEGATIVE_WORDS) {
      if (context.includes(word)) sentimentScore -= 0.15;
    }
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

    const descLen = estimateDescriptionLength(text, brand);

    entities.set(brand, {
      name: brand,
      category,
      mentionCount,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      descriptionLength: descLen,
    });
  }

  return Array.from(entities.values())
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

function estimateDescriptionLength(text: string, brand: string): number {
  const lowerText = text.toLowerCase();
  const lowerBrand = brand.toLowerCase();
  const index = lowerText.indexOf(lowerBrand);
  if (index === -1) return 0;

  const paragraphs = text.split(/\n\n|\r\n\r\n/);
  let totalLen = 0;
  for (const p of paragraphs) {
    if (p.toLowerCase().includes(lowerBrand)) {
      totalLen += p.length;
    }
  }
  return totalLen;
}
