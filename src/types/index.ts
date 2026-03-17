/* ------------------------------------------------------------------ */
/*  Core domain types for AI Bias Detector                            */
/* ------------------------------------------------------------------ */

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type BiasCategory =
  | 'concentration'      // only one option recommended
  | 'conflict_of_interest' // model vendor ↔ recommended brand link
  | 'rhetoric'           // absolutist / persuasive language patterns
  | 'missing_context'    // no price / no cons / no alternatives
  | 'source_opacity';    // no citation or evidence provided

export type UserMode = 'simple' | 'expert';
export type Platform =
  | 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'poe'
  | 'doubao' | 'deepseek' | 'yuanbao' | 'qianwen' | 'kimi';
export type Locale = 'en' | 'zh';

export interface BiasSignal {
  id: string;
  category: BiasCategory;
  severity: Severity;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  evidence: string;          // the exact text span that triggered this
  suggestion: Record<Locale, string>;
}

export interface FollowUpPrompt {
  label: Record<Locale, string>;
  prompt: Record<Locale, string>;
}

export interface AnalysisResult {
  timestamp: number;
  platform: Platform;
  url: string;
  originalText: string;
  entities: RecommendedEntity[];
  signals: BiasSignal[];
  overallScore: number;      // 0-100, higher = more biased
  followUps: FollowUpPrompt[];
}

export interface RecommendedEntity {
  name: string;
  category: string;          // e.g. "software", "service", "product"
  mentionCount: number;
  sentimentScore: number;    // -1 to 1
  descriptionLength: number; // chars devoted to this entity
}

export interface ConflictEntry {
  vendor: string;            // model vendor e.g. "openai"
  brand: string;             // brand being recommended
  relationship: string;      // e.g. "investor", "partner", "subsidiary"
  source: string;            // public reference URL
}

export interface UserSettings {
  mode: UserMode;
  locale: Locale;
  enabledPlatforms: Platform[];
  autoAnalyze: boolean;
  showFloatingBadge: boolean;
  customRules: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  enabled: boolean;
  pattern: string;           // regex pattern
  category: BiasCategory;
  severity: Severity;
  message: Record<Locale, string>;
}

export const DEFAULT_SETTINGS: UserSettings = {
  mode: 'simple',
  locale: 'en',
  enabledPlatforms: ['chatgpt', 'gemini', 'perplexity', 'claude', 'poe', 'doubao', 'deepseek', 'yuanbao', 'qianwen', 'kimi'],
  autoAnalyze: true,
  showFloatingBadge: true,
  customRules: [],
};
