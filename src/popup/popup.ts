import type { UserSettings, Locale, UserMode } from '../types/index.js';
import { DEFAULT_SETTINGS } from '../types/index.js';

const i18n: Record<string, Record<Locale, string>> = {
  title:            { en: 'AI Bias Detector', zh: 'AI 偏见检测器' },
  subtitle:         { en: "Don't trust AI blindly", zh: '别盲信 AI 推荐' },
  mode_title:       { en: 'Mode', zh: '模式' },
  simple_label:     { en: 'Simple', zh: '简洁' },
  simple_desc:      { en: 'For everyone', zh: '适合所有人' },
  expert_label:     { en: 'Expert', zh: '专家' },
  expert_desc:      { en: 'Full details', zh: '完整详情' },
  lang_title:       { en: 'Language', zh: '语言' },
  auto_label:       { en: 'Auto-analyze', zh: '自动分析' },
  stats_title:      { en: 'Statistics', zh: '统计' },
  stat_total_label: { en: 'Analyses', zh: '分析次数' },
  stat_signals_label: { en: 'Signals found', zh: '发现信号' },
  feedback_link:    { en: 'Feedback', zh: '反馈' },
};

let settings: UserSettings = { ...DEFAULT_SETTINGS };

async function init(): Promise<void> {
  const stored = await chrome.storage.sync.get('settings');
  settings = { ...DEFAULT_SETTINGS, ...stored.settings };
  applyUI();
  bindEvents();
  await loadStats();
}

function applyUI(): void {
  const loc = settings.locale;

  for (const [key, texts] of Object.entries(i18n)) {
    const el = document.getElementById(key.replace(/_/g, '-'));
    if (el) el.textContent = texts[loc];
  }

  document.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach(btn => {
    btn.classList.toggle('mode-btn--active', btn.dataset.mode === settings.mode);
  });

  document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === settings.locale);
  });

  const toggle = document.getElementById('auto-toggle')!;
  toggle.classList.toggle('toggle--on', settings.autoAnalyze);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.mode = btn.dataset.mode as UserMode;
      save();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.locale = btn.dataset.lang as Locale;
      save();
    });
  });

  document.getElementById('auto-toggle')!.addEventListener('click', () => {
    settings.autoAnalyze = !settings.autoAnalyze;
    save();
  });
}

async function save(): Promise<void> {
  await chrome.storage.sync.set({ settings });
  applyUI();
}

async function loadStats(): Promise<void> {
  const data = await chrome.storage.local.get('history');
  const history = data.history ?? [];
  document.getElementById('stat-total')!.textContent = String(history.length);
  const totalSignals = history.reduce(
    (sum: number, r: { signals?: unknown[] }) => sum + (r.signals?.length ?? 0),
    0,
  );
  document.getElementById('stat-signals')!.textContent = String(totalSignals);
}

init();
