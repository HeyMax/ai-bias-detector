/**
 * Remote conflict database updater.
 *
 * Design principle: the extension must work perfectly with ZERO
 * network access.  Remote update is a bonus, not a requirement.
 *
 * Update strategy:
 * 1. Built-in DB (conflict-db.ts) — compiled into the extension,
 *    always available, updated when user installs a new version
 *    from Chrome Web Store.
 * 2. Chrome Web Store auto-update — the primary update channel.
 *    When we release a new version, the built-in DB is refreshed.
 *    Most users get updates within 24-48h via Chrome's own mechanism.
 * 3. Remote hot-update (optional, best-effort) — tries multiple
 *    CDN mirrors to fetch the latest DB between extension releases.
 *    If ALL mirrors fail, silently falls back to built-in data.
 *
 * Remote mirrors (tried in order, first success wins):
 * - jsDelivr CDN (works in mainland China, backed by Cloudflare)
 * - GitHub raw (may be slow or blocked in some regions)
 *
 * Users don't need a GitHub account. Users don't need any account.
 * Users don't even need internet — built-in data always works.
 */

import type { ConflictEntry } from '../types/index.js';
import { CONFLICT_DATABASE } from './conflict-db.js';

/**
 * Multiple mirror URLs, tried in order.
 * jsDelivr is a global CDN with China PoPs, so it's listed first.
 */
const REMOTE_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/HeyMax/ai-bias-detector@main/data/conflict-db.json',
  'https://raw.githubusercontent.com/HeyMax/ai-bias-detector/main/data/conflict-db.json',
];

const CACHE_KEY = 'conflict_db_remote';
const CACHE_TS_KEY = 'conflict_db_remote_ts';
const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const ALLOWED_RELATIONSHIPS = new Set([
  'investor', 'investor_product', 'investor_cloud', 'exclusive_cloud',
  'partner', 'integration', 'subsidiary', 'technology_provider',
  'parent_fund', 'data_partner', 'acquirer',
]);

export async function getConflictDatabase(): Promise<ConflictEntry[]> {
  const remote = await getCachedOrFetch();
  return mergeAndDedupe(CONFLICT_DATABASE, remote);
}

async function getCachedOrFetch(): Promise<ConflictEntry[]> {
  try {
    const stored = await chrome.storage.local.get([CACHE_KEY, CACHE_TS_KEY]);
    const cached: ConflictEntry[] = stored[CACHE_KEY] ?? [];
    const lastUpdate: number = stored[CACHE_TS_KEY] ?? 0;

    if (Date.now() - lastUpdate < UPDATE_INTERVAL_MS && cached.length > 0) {
      return cached;
    }

    fetchFromMirrors().catch(() => {});
    return cached;
  } catch {
    return [];
  }
}

/**
 * Try each mirror in order. First successful + valid response wins.
 */
async function fetchFromMirrors(): Promise<void> {
  for (const url of REMOTE_MIRRORS) {
    try {
      const response = await fetch(url, {
        cache: 'no-cache',
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok) continue;

      const data: ConflictEntry[] = await response.json();
      if (validateAndCache(data)) return; // success — stop trying
    } catch {
      continue; // try next mirror
    }
  }
  // All mirrors failed — that's fine, built-in DB is the fallback
}

function validateAndCache(data: unknown): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;

  const valid = (data as ConflictEntry[]).filter(e => {
    if (typeof e.vendor !== 'string' || e.vendor !== e.vendor.toLowerCase()) return false;
    if (typeof e.brand !== 'string' || e.brand !== e.brand.toLowerCase()) return false;
    if (typeof e.relationship !== 'string' || !ALLOWED_RELATIONSHIPS.has(e.relationship)) return false;
    if (typeof e.source !== 'string' || !e.source.startsWith('http')) return false;
    return true;
  });

  // Anomaly detection: if >50% entries fail, data is probably corrupt
  if (valid.length < data.length * 0.5) return false;

  chrome.storage.local.set({
    [CACHE_KEY]: valid,
    [CACHE_TS_KEY]: Date.now(),
  });

  return true;
}

function mergeAndDedupe(
  builtin: ConflictEntry[],
  remote: ConflictEntry[],
): ConflictEntry[] {
  const seen = new Set<string>();
  const result: ConflictEntry[] = [];

  for (const entry of [...remote, ...builtin]) {
    const key = `${entry.vendor}::${entry.brand}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

export async function forceRefresh(): Promise<{ count: number; success: boolean }> {
  try {
    await fetchFromMirrors();
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const remote: ConflictEntry[] = stored[CACHE_KEY] ?? [];
    const merged = mergeAndDedupe(CONFLICT_DATABASE, remote);
    return { count: merged.length, success: true };
  } catch {
    return { count: CONFLICT_DATABASE.length, success: false };
  }
}
