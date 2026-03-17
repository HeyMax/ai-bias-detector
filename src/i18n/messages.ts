/**
 * Centralised UI strings.  Every user-visible string goes here so
 * the entire extension can be switched between locales in one click.
 */

import type { Locale } from '../types/index.js';

type Messages = Record<string, Record<Locale, string>>;

export const UI: Messages = {
  // ── Badge & panel header ────────────────────────────────
  badge_signals:       { en: '{n} bias signal(s) detected', zh: '检测到 {n} 个偏见信号' },
  badge_clean:         { en: 'No bias detected', zh: '未检测到偏见' },
  panel_title:         { en: 'AI Bias Detector', zh: 'AI 偏见检测器' },
  panel_subtitle:      { en: "Don't trust AI blindly", zh: '别盲信 AI 推荐' },

  // ── Score ───────────────────────────────────────────────
  score_label:         { en: 'Bias Score', zh: '偏见指数' },
  score_low:           { en: 'Low risk', zh: '低风险' },
  score_medium:        { en: 'Moderate risk', zh: '中等风险' },
  score_high:          { en: 'High risk', zh: '高风险' },

  // ── Tabs ────────────────────────────────────────────────
  tab_signals:         { en: 'Signals', zh: '信号' },
  tab_entities:        { en: 'Entities', zh: '推荐实体' },
  tab_followup:        { en: 'Follow Up', zh: '一键追问' },

  // ── Follow-up ───────────────────────────────────────────
  followup_title:      { en: 'Suggested follow-up questions', zh: '建议追问' },
  followup_send:       { en: 'Send', zh: '发送' },
  followup_copy:       { en: 'Copy', zh: '复制' },
  followup_copied:     { en: 'Copied!', zh: '已复制！' },

  // ── Entities ────────────────────────────────────────────
  entity_mentions:     { en: '{n} mentions', zh: '提及 {n} 次' },
  entity_sentiment:    { en: 'Sentiment', zh: '情感倾向' },
  entity_coverage:     { en: 'Coverage', zh: '描述篇幅' },

  // ── Settings ────────────────────────────────────────────
  settings_title:      { en: 'Settings', zh: '设置' },
  settings_mode:       { en: 'Mode', zh: '模式' },
  settings_simple:     { en: 'Simple (beginners)', zh: '简洁模式（小白友好）' },
  settings_expert:     { en: 'Expert (full details)', zh: '专家模式（完整详情）' },
  settings_language:   { en: 'Language', zh: '语言' },
  settings_auto:       { en: 'Auto-analyze new responses', zh: '自动分析新回复' },
  settings_platforms:  { en: 'Enabled platforms', zh: '启用的平台' },

  // ── Misc ────────────────────────────────────────────────
  powered_by:          { en: 'Powered by AI Bias Detector — open source', zh: '由 AI Bias Detector 提供 — 开源项目' },
  analyze_btn:         { en: 'Analyze', zh: '分析' },
  analyzing:           { en: 'Analyzing…', zh: '分析中…' },
  no_response:         { en: 'No AI response detected on this page.', zh: '当前页面未检测到 AI 回复。' },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const entry = UI[key];
  if (!entry) return key;
  let text = entry[currentLocale] ?? entry.en ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
