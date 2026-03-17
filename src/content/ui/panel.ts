/**
 * Floating side-panel UI.  Pure DOM — no framework dependency.
 * Renders a badge (floating bubble) + expandable panel with
 * analysis results, follow-up prompts, and settings.
 */

import { t, getLocale } from '../../i18n/messages.js';
import type { AnalysisResult, BiasSignal, FollowUpPrompt, UserMode, Severity, RecommendedEntity } from '../../types/index.js';
import type { PlatformAdapter } from '../../platforms/base.js';

const PANEL_ID = 'abd-panel';
const BADGE_ID = 'abd-badge';
const PANEL_WIDTH = 360;

let panelEl: HTMLElement | null = null;
let badgeEl: HTMLElement | null = null;
let currentAdapter: PlatformAdapter | null = null;

export function renderPanel(adapter: PlatformAdapter | null): void {
  currentAdapter = adapter;
  if (document.getElementById(PANEL_ID)) return;

  const shadow = createShadowHost();

  badgeEl = createElement('div', {
    id: BADGE_ID,
    className: 'abd-badge abd-badge--hidden',
    onclick: () => togglePanel(),
  });
  shadow.appendChild(badgeEl);

  panelEl = createElement('div', {
    id: PANEL_ID,
    className: 'abd-panel abd-panel--hidden',
  });
  panelEl.innerHTML = `
    <div class="abd-panel__header">
      <div class="abd-panel__title">${t('panel_title')}</div>
      <div class="abd-panel__subtitle">${t('panel_subtitle')}</div>
      <button class="abd-panel__close" aria-label="Close">&times;</button>
    </div>
    <div class="abd-panel__body">
      <div class="abd-panel__empty">${t('no_response')}</div>
    </div>
  `;
  panelEl.querySelector('.abd-panel__close')!
    .addEventListener('click', () => togglePanel(false));
  shadow.appendChild(panelEl);
}

function createShadowHost(): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'ai-bias-detector-host';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = getStyles();
  shadow.appendChild(style);

  return shadow;
}

export function showBadge(count: number, score: number): void {
  if (!badgeEl) return;
  const level = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';
  badgeEl.className = `abd-badge abd-badge--${level}`;
  badgeEl.textContent = String(count);
  badgeEl.title = t('badge_signals', { n: count });
}

export function hideBadge(): void {
  if (!badgeEl) return;
  badgeEl.className = 'abd-badge abd-badge--clean';
  badgeEl.textContent = '✓';
  badgeEl.title = t('badge_clean');
}

export function updatePanel(
  result: AnalysisResult,
  mode: UserMode,
  adapter: PlatformAdapter | null,
): void {
  currentAdapter = adapter;
  if (!panelEl) return;

  const body = panelEl.querySelector('.abd-panel__body')!;
  const locale = getLocale();

  body.innerHTML = '';

  // Score bar
  const scoreSection = createElement('div', { className: 'abd-score' });
  const level = result.overallScore >= 50 ? 'high' : result.overallScore >= 25 ? 'medium' : 'low';
  const levelLabel = t(`score_${level}`);
  scoreSection.innerHTML = `
    <div class="abd-score__label">${t('score_label')}</div>
    <div class="abd-score__bar">
      <div class="abd-score__fill abd-score__fill--${level}" style="width:${result.overallScore}%"></div>
    </div>
    <div class="abd-score__value abd-score__value--${level}">${result.overallScore} — ${levelLabel}</div>
  `;
  body.appendChild(scoreSection);

  // Tabs
  const tabs = createElement('div', { className: 'abd-tabs' });
  const tabData = [
    { key: 'signals', label: t('tab_signals'), count: result.signals.length },
    { key: 'entities', label: t('tab_entities'), count: result.entities.length },
    { key: 'followup', label: t('tab_followup'), count: result.followUps.length },
  ];
  const tabContents: Record<string, HTMLElement> = {};

  for (const td of tabData) {
    const btn = createElement('button', {
      className: `abd-tab ${td.key === 'signals' ? 'abd-tab--active' : ''}`,
      textContent: `${td.label} (${td.count})`,
      onclick: () => {
        tabs.querySelectorAll('.abd-tab').forEach(b => b.classList.remove('abd-tab--active'));
        btn.classList.add('abd-tab--active');
        Object.values(tabContents).forEach(c => c.style.display = 'none');
        tabContents[td.key].style.display = 'block';
      },
    });
    tabs.appendChild(btn);
  }
  body.appendChild(tabs);

  // Signals tab
  tabContents.signals = renderSignals(result.signals, mode, locale);
  body.appendChild(tabContents.signals);

  // Entities tab
  tabContents.entities = renderEntities(result.entities, locale);
  tabContents.entities.style.display = 'none';
  body.appendChild(tabContents.entities);

  // Follow-up tab
  tabContents.followup = renderFollowUps(result.followUps, locale);
  tabContents.followup.style.display = 'none';
  body.appendChild(tabContents.followup);

  // Footer
  const footer = createElement('div', {
    className: 'abd-footer',
    innerHTML: `<span>${t('powered_by')}</span>`,
  });
  body.appendChild(footer);
}

/* ------------------------------------------------------------------ */
/*  Render helpers                                                     */
/* ------------------------------------------------------------------ */

function renderSignals(signals: BiasSignal[], mode: UserMode, locale: string): HTMLElement {
  const container = createElement('div', { className: 'abd-signals' });
  if (signals.length === 0) {
    container.innerHTML = `<div class="abd-signals__empty">${t('badge_clean')}</div>`;
    return container;
  }

  for (const signal of signals) {
    const card = createElement('div', {
      className: `abd-signal abd-signal--${signal.severity}`,
    });
    const loc = locale as 'en' | 'zh';
    card.innerHTML = `
      <div class="abd-signal__header">
        <span class="abd-signal__severity">${severityIcon(signal.severity)}</span>
        <span class="abd-signal__title">${signal.title[loc]}</span>
      </div>
      <div class="abd-signal__desc">${signal.description[loc]}</div>
      ${mode === 'expert' ? `<div class="abd-signal__evidence"><code>${escapeHtml(signal.evidence)}</code></div>` : ''}
      <div class="abd-signal__suggestion">${signal.suggestion[loc]}</div>
    `;
    container.appendChild(card);
  }
  return container;
}

function renderEntities(entities: RecommendedEntity[], locale: string): HTMLElement {
  const container = createElement('div', { className: 'abd-entities' });
  for (const entity of entities) {
    const sentimentClass = entity.sentimentScore > 0.3 ? 'positive' :
      entity.sentimentScore < -0.3 ? 'negative' : 'neutral';
    const card = createElement('div', { className: 'abd-entity' });
    card.innerHTML = `
      <div class="abd-entity__name">${escapeHtml(entity.name)}</div>
      <div class="abd-entity__meta">
        <span>${t('entity_mentions', { n: entity.mentionCount })}</span>
        <span class="abd-entity__sentiment abd-entity__sentiment--${sentimentClass}">
          ${t('entity_sentiment')}: ${entity.sentimentScore > 0 ? '+' : ''}${entity.sentimentScore}
        </span>
      </div>
    `;
    container.appendChild(card);
  }
  return container;
}

function renderFollowUps(followUps: FollowUpPrompt[], locale: string): HTMLElement {
  const container = createElement('div', { className: 'abd-followups' });
  const loc = locale as 'en' | 'zh';

  for (const fu of followUps) {
    const card = createElement('div', { className: 'abd-followup' });
    card.innerHTML = `
      <div class="abd-followup__label">${fu.label[loc]}</div>
      <div class="abd-followup__prompt">${escapeHtml(fu.prompt[loc])}</div>
      <div class="abd-followup__actions">
        <button class="abd-btn abd-btn--send">${t('followup_send')}</button>
        <button class="abd-btn abd-btn--copy">${t('followup_copy')}</button>
      </div>
    `;
    card.querySelector('.abd-btn--send')!.addEventListener('click', () => {
      currentAdapter?.sendMessage(fu.prompt[loc]);
      togglePanel(false);
    });
    card.querySelector('.abd-btn--copy')!.addEventListener('click', (e) => {
      navigator.clipboard.writeText(fu.prompt[loc]);
      const btn = e.target as HTMLButtonElement;
      btn.textContent = t('followup_copied');
      setTimeout(() => { btn.textContent = t('followup_copy'); }, 1500);
    });
    container.appendChild(card);
  }
  return container;
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function togglePanel(force?: boolean): void {
  if (!panelEl) return;
  const hidden = force !== undefined ? !force : !panelEl.classList.contains('abd-panel--hidden');
  panelEl.classList.toggle('abd-panel--hidden', hidden);
}

function severityIcon(severity: Severity): string {
  const icons: Record<Severity, string> = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '⛔',
  };
  return icons[severity];
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { onclick?: () => void },
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) Object.assign(el, props);
  return el;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ------------------------------------------------------------------ */
/*  Styles (injected into shadow DOM)                                  */
/* ------------------------------------------------------------------ */

function getStyles(): string {
  return `
    :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    /* Badge */
    .abd-badge {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: #fff;
      cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.18);
      transition: all .25s ease; user-select: none;
    }
    .abd-badge:hover { transform: scale(1.1); }
    .abd-badge--hidden { display: none; }
    .abd-badge--low    { background: #f59e0b; }
    .abd-badge--medium { background: #f97316; }
    .abd-badge--high   { background: #ef4444; }
    .abd-badge--clean  { background: #22c55e; font-size: 20px; }

    /* Panel */
    .abd-panel {
      position: fixed; top: 16px; right: 16px; bottom: 16px;
      width: ${PANEL_WIDTH}px; z-index: 2147483646;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.15);
      display: flex; flex-direction: column;
      overflow: hidden; transition: transform .3s ease, opacity .3s ease;
      color: #1a1a2e; font-size: 14px; line-height: 1.5;
    }
    .abd-panel--hidden { transform: translateX(${PANEL_WIDTH + 40}px); opacity: 0; pointer-events: none; }

    .abd-panel__header {
      padding: 20px 20px 12px;
      border-bottom: 1px solid #f0f0f5;
      position: relative;
    }
    .abd-panel__title { font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .abd-panel__subtitle { font-size: 12px; color: #888; margin-top: 2px; }
    .abd-panel__close {
      position: absolute; top: 16px; right: 16px;
      background: none; border: none; font-size: 22px; color: #aaa;
      cursor: pointer; padding: 4px 8px; border-radius: 6px;
    }
    .abd-panel__close:hover { background: #f5f5f5; color: #333; }

    .abd-panel__body { flex: 1; overflow-y: auto; padding: 16px 20px; }
    .abd-panel__empty { text-align: center; color: #aaa; padding: 40px 0; }

    /* Score */
    .abd-score { margin-bottom: 16px; }
    .abd-score__label { font-size: 12px; color: #888; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; }
    .abd-score__bar { height: 8px; background: #f0f0f5; border-radius: 4px; overflow: hidden; }
    .abd-score__fill { height: 100%; border-radius: 4px; transition: width .6s ease; }
    .abd-score__fill--low    { background: linear-gradient(90deg, #22c55e, #84cc16); }
    .abd-score__fill--medium { background: linear-gradient(90deg, #f59e0b, #f97316); }
    .abd-score__fill--high   { background: linear-gradient(90deg, #f97316, #ef4444); }
    .abd-score__value { font-size: 13px; margin-top: 6px; font-weight: 600; }
    .abd-score__value--low    { color: #22c55e; }
    .abd-score__value--medium { color: #f59e0b; }
    .abd-score__value--high   { color: #ef4444; }

    /* Tabs */
    .abd-tabs { display: flex; gap: 4px; margin-bottom: 12px; border-bottom: 1px solid #f0f0f5; padding-bottom: 8px; }
    .abd-tab {
      background: none; border: none; padding: 6px 12px; border-radius: 8px;
      font-size: 13px; color: #666; cursor: pointer; transition: all .15s;
    }
    .abd-tab:hover { background: #f5f5f5; }
    .abd-tab--active { background: #1a1a2e; color: #fff; }

    /* Signals */
    .abd-signal {
      border-radius: 10px; padding: 12px; margin-bottom: 10px;
      border-left: 4px solid;
    }
    .abd-signal--low      { background: #fffbeb; border-color: #f59e0b; }
    .abd-signal--medium   { background: #fff7ed; border-color: #f97316; }
    .abd-signal--high     { background: #fef2f2; border-color: #ef4444; }
    .abd-signal--critical { background: #fef2f2; border-color: #991b1b; }
    .abd-signal__header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .abd-signal__title { font-weight: 600; font-size: 14px; }
    .abd-signal__desc { font-size: 13px; color: #555; }
    .abd-signal__evidence { margin-top: 6px; }
    .abd-signal__evidence code { font-size: 12px; background: rgba(0,0,0,.05); padding: 2px 6px; border-radius: 4px; }
    .abd-signal__suggestion { margin-top: 8px; font-size: 13px; color: #2563eb; font-style: italic; }

    /* Entities */
    .abd-entity {
      padding: 10px; border-radius: 8px; background: #f8fafc;
      margin-bottom: 8px;
    }
    .abd-entity__name { font-weight: 600; font-size: 14px; text-transform: capitalize; }
    .abd-entity__meta { font-size: 12px; color: #888; display: flex; gap: 12px; margin-top: 4px; }
    .abd-entity__sentiment--positive { color: #22c55e; }
    .abd-entity__sentiment--negative { color: #ef4444; }
    .abd-entity__sentiment--neutral  { color: #888; }

    /* Follow-ups */
    .abd-followup {
      padding: 12px; border-radius: 10px; background: #f0f4ff;
      margin-bottom: 10px;
    }
    .abd-followup__label { font-weight: 600; font-size: 13px; color: #1a1a2e; margin-bottom: 4px; }
    .abd-followup__prompt { font-size: 13px; color: #444; margin-bottom: 10px; line-height: 1.6; }
    .abd-followup__actions { display: flex; gap: 8px; }
    .abd-btn {
      padding: 6px 14px; border-radius: 8px; border: none;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s;
    }
    .abd-btn--send { background: #2563eb; color: #fff; }
    .abd-btn--send:hover { background: #1d4ed8; }
    .abd-btn--copy { background: #e5e7eb; color: #333; }
    .abd-btn--copy:hover { background: #d1d5db; }

    /* Footer */
    .abd-footer {
      padding: 12px 0 4px; border-top: 1px solid #f0f0f5; margin-top: 16px;
      text-align: center; font-size: 11px; color: #bbb;
    }

    /* Scrollbar */
    .abd-panel__body::-webkit-scrollbar { width: 6px; }
    .abd-panel__body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  `;
}
