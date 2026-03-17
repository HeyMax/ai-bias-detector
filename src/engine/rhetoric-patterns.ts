/**
 * Rhetoric / linguistic patterns that indicate biased AI output.
 *
 * Each pattern carries a severity and a bilingual explanation.
 * Patterns are intentionally conservative — we'd rather miss a
 * borderline case than annoy users with false positives.
 */

import type { BiasCategory, Severity, Locale } from '../types/index.js';

export interface RhetoricPattern {
  id: string;
  regex: RegExp;
  category: BiasCategory;
  severity: Severity;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  suggestion: Record<Locale, string>;
}

export const RHETORIC_PATTERNS: RhetoricPattern[] = [
  // ── Absolutist language ─────────────────────────────────
  {
    id: 'rhet_absolute_best',
    regex: /\b(the best|the only|hands[- ]down the best|undoubtedly the best|without a doubt)\b/gi,
    category: 'rhetoric',
    severity: 'medium',
    title: {
      en: 'Absolutist recommendation',
      zh: '绝对化推荐',
    },
    description: {
      en: 'The AI used superlative language ("the best", "the only") without qualifying conditions or context.',
      zh: 'AI 使用了绝对化表述（"最好的"、"唯一的"），没有限定条件或场景。',
    },
    suggestion: {
      en: 'Ask: "What are the top 3 alternatives and their trade-offs?"',
      zh: '追问："有哪些替代方案？各自的优缺点是什么？"',
    },
  },
  {
    id: 'rhet_absolute_zh',
    regex: /(最好的选择|唯一的选择|毫无疑问|无可替代|首选方案|不二之选)/g,
    category: 'rhetoric',
    severity: 'medium',
    title: {
      en: 'Absolutist recommendation (Chinese)',
      zh: '绝对化推荐',
    },
    description: {
      en: 'The AI used absolutist Chinese expressions without qualifying conditions.',
      zh: 'AI 使用了绝对化中文表述，没有给出限定条件。',
    },
    suggestion: {
      en: 'Ask for alternatives with trade-off analysis.',
      zh: '追问："还有哪些替代方案？能否客观对比优缺点？"',
    },
  },

  // ── Strong recommendation without reasoning ─────────────
  {
    id: 'rhet_strong_rec',
    regex: /\b(I (?:strongly |highly )?recommend|you (?:should|must) (?:definitely )?(?:use|try|go with|choose|pick))\b/gi,
    category: 'rhetoric',
    severity: 'low',
    title: {
      en: 'Strong recommendation',
      zh: '强推荐语气',
    },
    description: {
      en: 'The AI made a strong personal recommendation. AI models don\'t have personal experience — this phrasing may give false authority.',
      zh: 'AI 使用了强推荐语气。AI 没有个人经验，这种措辞可能制造虚假权威感。',
    },
    suggestion: {
      en: 'Ask: "What data or reviews support this recommendation?"',
      zh: '追问："这个推荐基于什么数据或评测？"',
    },
  },
  {
    id: 'rhet_strong_rec_zh',
    regex: /(强烈推荐|非常建议|墙裂推荐|极力推荐|一定要用)/g,
    category: 'rhetoric',
    severity: 'low',
    title: {
      en: 'Strong recommendation (Chinese)',
      zh: '强推荐语气',
    },
    description: {
      en: 'The AI used strong Chinese recommendation phrases.',
      zh: 'AI 使用了强推荐语气，可能制造虚假权威感。',
    },
    suggestion: {
      en: 'Ask for supporting evidence.',
      zh: '追问："推荐依据是什么？有没有第三方评测？"',
    },
  },

  // ── Missing downsides ───────────────────────────────────
  {
    id: 'rhet_no_cons',
    regex: /^(?!.*\b(downside|disadvantage|drawback|con(?:s)?|weakness|limitation|however|but|although|on the other hand)\b).{200,}$/gis,
    category: 'missing_context',
    severity: 'medium',
    title: {
      en: 'No downsides mentioned',
      zh: '未提及缺点',
    },
    description: {
      en: 'A lengthy recommendation with no mention of any drawbacks or limitations.',
      zh: '较长篇幅的推荐中完全没有提到缺点或局限性。',
    },
    suggestion: {
      en: 'Ask: "What are the main disadvantages or limitations I should know about?"',
      zh: '追问："有什么缺点或局限性是我应该知道的？"',
    },
  },
  {
    id: 'rhet_no_cons_zh',
    regex: /^(?!.*(缺点|不足|劣势|局限|短板|但是|不过|然而|需要注意)).{100,}$/gs,
    category: 'missing_context',
    severity: 'medium',
    title: {
      en: 'No downsides mentioned (Chinese)',
      zh: '未提及缺点',
    },
    description: {
      en: 'A lengthy Chinese recommendation with no mention of drawbacks.',
      zh: '较长篇幅的推荐中完全没有提到缺点或局限性。',
    },
    suggestion: {
      en: 'Ask about drawbacks.',
      zh: '追问："这个方案有什么缺点或需要注意的地方？"',
    },
  },

  // ── No price / cost context ─────────────────────────────
  {
    id: 'rhet_no_price',
    regex: /\b(recommend|suggest|go with|choose|pick)\b(?![\s\S]{0,300}\b(price|cost|\$|€|¥|free|pricing|plan|tier|budget)\b)/gi,
    category: 'missing_context',
    severity: 'low',
    title: {
      en: 'No pricing context',
      zh: '未提及价格',
    },
    description: {
      en: 'A product/service was recommended without mentioning pricing or cost considerations.',
      zh: '推荐了产品/服务但没有提及价格或费用信息。',
    },
    suggestion: {
      en: 'Ask: "How much does it cost? Are there free alternatives?"',
      zh: '追问："这个多少钱？有没有免费替代方案？"',
    },
  },

  // ── No source / evidence ────────────────────────────────
  {
    id: 'rhet_no_source',
    regex: /\b(according to|research shows|studies show|data shows|experts say)\b/gi,
    category: 'source_opacity',
    severity: 'low',
    title: {
      en: 'Vague source citation',
      zh: '模糊引用来源',
    },
    description: {
      en: 'The AI referenced unnamed "research" or "experts" without specific citations.',
      zh: 'AI 引用了未具名的"研究"或"专家"，没有给出具体来源。',
    },
    suggestion: {
      en: 'Ask: "Can you provide specific sources or links for that claim?"',
      zh: '追问："能给出具体的来源链接吗？"',
    },
  },

  // ── Unbalanced comparison ───────────────────────────────
  {
    id: 'rhet_unbalanced',
    regex: /\bwhile\b.{0,50}\b(is (?:good|decent|okay|fine))\b.{0,100}\b(is (?:excellent|superior|outstanding|far better|much better))\b/gi,
    category: 'rhetoric',
    severity: 'medium',
    title: {
      en: 'Unbalanced comparison',
      zh: '不平衡对比',
    },
    description: {
      en: 'The AI compared options using lukewarm language for one and enthusiastic language for another.',
      zh: 'AI 在对比时对一方用了平淡措辞，对另一方用了热情措辞，暗示偏向。',
    },
    suggestion: {
      en: 'Ask: "Can you give an objective comparison using the same criteria for each option?"',
      zh: '追问："能否用相同的标准客观对比这几个选项？"',
    },
  },
];
