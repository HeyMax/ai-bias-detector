/**
 * Main analysis orchestrator.  Takes raw AI response text and returns
 * a complete AnalysisResult including all detected bias signals.
 */

import type {
  AnalysisResult, BiasSignal, FollowUpPrompt,
  Platform, Locale, RecommendedEntity,
} from '../types/index.js';
import { extractEntities } from './entity-extractor.js';
import { RHETORIC_PATTERNS } from './rhetoric-patterns.js';
import { findConflicts } from './conflict-db.js';

let signalCounter = 0;
function nextId(): string {
  return `sig_${Date.now()}_${++signalCounter}`;
}

export function analyze(
  text: string,
  platform: Platform,
  url: string,
): AnalysisResult {
  const entities = extractEntities(text);
  const signals: BiasSignal[] = [];

  detectConcentration(entities, signals);
  detectConflictsOfInterest(platform, entities, signals);
  detectRhetoricPatterns(text, signals);

  const overallScore = computeOverallScore(signals);
  const followUps = generateFollowUps(signals, entities);

  return {
    timestamp: Date.now(),
    platform,
    url,
    originalText: text,
    entities,
    signals,
    overallScore,
    followUps,
  };
}

/* ------------------------------------------------------------------ */
/*  Concentration analysis                                             */
/* ------------------------------------------------------------------ */

function detectConcentration(
  entities: RecommendedEntity[],
  signals: BiasSignal[],
): void {
  if (entities.length === 0) return;

  if (entities.length === 1) {
    signals.push({
      id: nextId(),
      category: 'concentration',
      severity: 'high',
      title: {
        en: 'Single option recommended',
        zh: '仅推荐了一个选项',
      },
      description: {
        en: `Only "${entities[0].name}" was mentioned. No alternatives or comparisons were provided.`,
        zh: `仅提及了"${entities[0].name}"，没有给出替代方案或对比。`,
      },
      evidence: entities[0].name,
      suggestion: {
        en: `Ask: "What are 3 alternatives to ${entities[0].name} and how do they compare?"`,
        zh: `追问："${entities[0].name}有哪些替代方案？能否对比它们的优缺点？"`,
      },
    });
    return;
  }

  const totalDesc = entities.reduce((s, e) => s + e.descriptionLength, 0);
  if (totalDesc === 0) return;
  const topRatio = entities[0].descriptionLength / totalDesc;

  if (topRatio > 0.65 && entities.length >= 2) {
    signals.push({
      id: nextId(),
      category: 'concentration',
      severity: 'medium',
      title: {
        en: 'Uneven coverage',
        zh: '篇幅分配不均',
      },
      description: {
        en: `"${entities[0].name}" received ${Math.round(topRatio * 100)}% of the description space, while other options got much less detail.`,
        zh: `"${entities[0].name}"占据了 ${Math.round(topRatio * 100)}% 的描述篇幅，其他选项的介绍明显不足。`,
      },
      evidence: `${entities[0].name}: ${entities[0].descriptionLength} chars vs others`,
      suggestion: {
        en: 'Ask: "Can you give equal detail for each option?"',
        zh: '追问："能否对每个选项给出同样详细的介绍？"',
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Conflict of interest detection                                     */
/* ------------------------------------------------------------------ */

function detectConflictsOfInterest(
  platform: Platform,
  entities: RecommendedEntity[],
  signals: BiasSignal[],
): void {
  const entityNames = entities.map(e => e.name);
  const conflicts = findConflicts(platform, entityNames);

  for (const conflict of conflicts) {
    const relationLabel: Record<string, Record<Locale, string>> = {
      investor: { en: 'investor in', zh: '投资方' },
      investor_product: { en: 'investor\'s product', zh: '投资方旗下产品' },
      investor_cloud: { en: 'investor\'s cloud', zh: '投资方旗下云服务' },
      exclusive_cloud: { en: 'exclusive cloud partner of', zh: '独家云服务合作方' },
      partner: { en: 'business partner of', zh: '商业合作伙伴' },
      integration: { en: 'integrated with', zh: '集成合作方' },
      subsidiary: { en: 'subsidiary of', zh: '旗下子产品' },
      technology_provider: { en: 'technology provider for', zh: '技术提供方' },
    };

    const rel = relationLabel[conflict.relationship] ?? {
      en: conflict.relationship,
      zh: conflict.relationship,
    };

    signals.push({
      id: nextId(),
      category: 'conflict_of_interest',
      severity: conflict.relationship === 'subsidiary' ? 'high' : 'medium',
      title: {
        en: 'Potential conflict of interest',
        zh: '潜在利益冲突',
      },
      description: {
        en: `"${conflict.brand}" is ${rel.en} the AI vendor (${conflict.vendor}). This relationship may influence the recommendation.`,
        zh: `"${conflict.brand}"是 AI 厂商（${conflict.vendor}）的${rel.zh}，这种关系可能影响推荐的客观性。`,
      },
      evidence: `${conflict.vendor} → ${conflict.brand} (${conflict.relationship})`,
      suggestion: {
        en: 'Consider comparing with recommendations from a different AI provider.',
        zh: '建议对比其他 AI 平台的推荐结果，交叉验证。',
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Rhetoric / linguistic pattern detection                            */
/* ------------------------------------------------------------------ */

function detectRhetoricPatterns(
  text: string,
  signals: BiasSignal[],
): void {
  for (const pattern of RHETORIC_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (!matches || matches.length === 0) continue;

    signals.push({
      id: nextId(),
      category: pattern.category,
      severity: pattern.severity,
      title: pattern.title,
      description: pattern.description,
      evidence: matches.slice(0, 3).join(', '),
      suggestion: pattern.suggestion,
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

const SEVERITY_WEIGHT: Record<string, number> = {
  low: 8,
  medium: 18,
  high: 30,
  critical: 50,
};

function computeOverallScore(signals: BiasSignal[]): number {
  if (signals.length === 0) return 0;
  const raw = signals.reduce(
    (sum, s) => sum + (SEVERITY_WEIGHT[s.severity] ?? 10),
    0,
  );
  return Math.min(100, raw);
}

/* ------------------------------------------------------------------ */
/*  Follow-up prompt generation                                        */
/* ------------------------------------------------------------------ */

function generateFollowUps(
  signals: BiasSignal[],
  entities: RecommendedEntity[],
): FollowUpPrompt[] {
  const prompts: FollowUpPrompt[] = [];
  const topEntity = entities[0]?.name ?? 'this';

  const hasConcentration = signals.some(s => s.category === 'concentration');
  const hasConflict = signals.some(s => s.category === 'conflict_of_interest');
  const hasMissingContext = signals.some(s => s.category === 'missing_context');
  const hasRhetoric = signals.some(s => s.category === 'rhetoric');

  if (hasConcentration) {
    prompts.push({
      label: {
        en: 'Ask for alternatives',
        zh: '要求给出替代方案',
      },
      prompt: {
        en: `You recommended ${topEntity}. Can you list 3 comparable alternatives and objectively compare their pros, cons, and pricing? Please don't favor any particular option.`,
        zh: `你推荐了${topEntity}。能否列出 3 个同类替代方案，客观对比它们的优缺点和价格？请不要偏向任何一方。`,
      },
    });
  }

  if (hasConflict) {
    prompts.push({
      label: {
        en: 'Request independent perspective',
        zh: '要求独立视角',
      },
      prompt: {
        en: `I noticed some of your recommendations may be from companies related to your vendor. Can you recommend options only from companies with no business relationship to your provider? Please disclose any potential conflicts of interest.`,
        zh: `我注意到你推荐的一些产品可能与你的提供商有关联。能否只推荐与你的提供商没有商业关系的产品？请披露任何潜在的利益冲突。`,
      },
    });
  }

  if (hasMissingContext) {
    prompts.push({
      label: {
        en: 'Ask for complete picture',
        zh: '要求完整信息',
      },
      prompt: {
        en: `For ${topEntity}, can you also cover: 1) Known limitations and common complaints 2) Pricing and hidden costs 3) What specific use cases it's NOT good for?`,
        zh: `关于${topEntity}，能否补充：1) 已知的局限性和常见吐槽 2) 定价和隐性成本 3) 它不适合哪些场景？`,
      },
    });
  }

  if (hasRhetoric) {
    prompts.push({
      label: {
        en: 'Ask for objective analysis',
        zh: '要求客观分析',
      },
      prompt: {
        en: `Can you redo this recommendation in a more neutral tone? Please use a structured comparison table with the same criteria for each option, and avoid superlatives like "the best" or "the only".`,
        zh: `能否用更中立的语气重新分析？请用统一标准的对比表格，避免使用"最好的"、"唯一的"等绝对化表述。`,
      },
    });
  }

  if (prompts.length === 0) {
    prompts.push({
      label: {
        en: 'General verification',
        zh: '通用验证',
      },
      prompt: {
        en: `Can you double-check your recommendation? Please list any assumptions you made and potential biases in your analysis.`,
        zh: `能否重新检查你的推荐？请列出你做了哪些假设，以及分析中可能存在的偏见。`,
      },
    });
  }

  return prompts;
}
