/**
 * Content script — injected into supported AI chat pages.
 * Observes DOM mutations, detects new AI responses, runs the
 * bias analysis engine, and renders the floating panel.
 */

import { analyze, setRemoteConflicts } from '../engine/analyzer.js';
import { createAdapter } from '../platforms/base.js';
import { setLocale, t } from '../i18n/messages.js';
import { renderPanel, updatePanel, showBadge, hideBadge } from './ui/panel.js';
import { getConflictDatabase } from '../engine/conflict-updater.js';
import type { AnalysisResult, UserSettings } from '../types/index.js';
import { DEFAULT_SETTINGS } from '../types/index.js';

let settings: UserSettings = { ...DEFAULT_SETTINGS };
let lastAnalyzedText = '';
let observer: MutationObserver | null = null;

async function loadSettings(): Promise<void> {
  try {
    const stored = await chrome.storage.sync.get('settings');
    if (stored.settings) {
      settings = { ...DEFAULT_SETTINGS, ...stored.settings };
    }
  } catch {
    // storage unavailable in dev; use defaults
  }
  setLocale(settings.locale);
}

async function loadRemoteConflicts(): Promise<void> {
  try {
    const db = await getConflictDatabase();
    setRemoteConflicts(db);
  } catch {
    // built-in DB is the fallback
  }
}

function init(): void {
  const adapter = createAdapter(window.location.href);
  if (!adapter) return;

  if (!settings.enabledPlatforms.includes(adapter.name)) return;

  renderPanel(adapter);
  startObserving(adapter);
}

function startObserving(adapter: ReturnType<typeof createAdapter>): void {
  if (!adapter) return;

  const processResponses = debounce(() => {
    const elements = document.querySelectorAll(adapter.responseSelector);
    const lastEl = elements[elements.length - 1];
    if (!lastEl) return;

    const text = adapter.extractText(lastEl);
    if (!text || text === lastAnalyzedText || text.length < 50) return;

    lastAnalyzedText = text;

    if (settings.autoAnalyze) {
      const result = analyze(text, adapter.name, window.location.href);
      onAnalysisComplete(result, adapter);
    }
  }, 800);

  observer = new MutationObserver(processResponses);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  processResponses();
}

function onAnalysisComplete(
  result: AnalysisResult,
  adapter: ReturnType<typeof createAdapter>,
): void {
  if (result.signals.length > 0) {
    showBadge(result.signals.length, result.overallScore);
  } else {
    hideBadge();
  }
  updatePanel(result, settings.mode, adapter);

  try {
    chrome.storage.local.get('history', (data) => {
      const history: AnalysisResult[] = data.history ?? [];
      history.unshift({
        ...result,
        originalText: result.originalText.slice(0, 500),
      });
      if (history.length > 100) history.length = 100;
      chrome.storage.local.set({ history });
    });
  } catch {
    // non-critical
  }
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

loadSettings().then(() => {
  loadRemoteConflicts();
  init();
});

chrome.storage?.onChanged?.addListener((changes) => {
  if (changes.settings?.newValue) {
    settings = { ...DEFAULT_SETTINGS, ...changes.settings.newValue };
    setLocale(settings.locale);
  }
});
