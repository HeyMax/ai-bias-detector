/**
 * Remote conflict database updater.
 *
 * Strategy:
 * 1. The extension ships with a built-in snapshot of the conflict DB
 *    (conflict-db.ts) as offline fallback — always works, even with
 *    no network.
 * 2. On startup and every 24h, it tries to fetch the latest version
 *    from a public GitHub raw URL.  If successful, the fresh data is
 *    cached in chrome.storage.local.
 * 3. The analyzer always merges built-in + remote data, deduplicating
 *    by (vendor, brand) key.
 *
 * This means:
 * - Contributors add entries to conflict-db-remote.json via PR
 * - After merge, every user gets the update within 24h — no extension
 *   update needed
 * - If GitHub is unreachable, the built-in data still works
 */

import type { ConflictEntry } from '../types/index.js';
import { CONFLICT_DATABASE } from './conflict-db.js';

const REMOTE_URL =
  'https://raw.githubusercontent.com/HeyMax/ai-bias-detector/main/data/conflict-db.json';

const CACHE_KEY = 'conflict_db_remote';
const CACHE_TS_KEY = 'conflict_db_remote_ts';
const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    // Fetch fresh data in background — don't block the UI
    fetchAndCache().catch(() => {});

    // Return whatever we have cached right now
    return cached;
  } catch {
    return [];
  }
}

async function fetchAndCache(): Promise<void> {
  const response = await fetch(REMOTE_URL, {
    cache: 'no-cache',
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) return;

  const data: ConflictEntry[] = await response.json();

  if (!Array.isArray(data) || data.length === 0) return;

  // Basic validation: each entry must have vendor, brand, relationship
  const valid = data.filter(
    e => typeof e.vendor === 'string' &&
         typeof e.brand === 'string' &&
         typeof e.relationship === 'string',
  );

  await chrome.storage.local.set({
    [CACHE_KEY]: valid,
    [CACHE_TS_KEY]: Date.now(),
  });
}

function mergeAndDedupe(
  builtin: ConflictEntry[],
  remote: ConflictEntry[],
): ConflictEntry[] {
  const seen = new Set<string>();
  const result: ConflictEntry[] = [];

  // Remote entries take priority (may have newer relationship types)
  for (const entry of [...remote, ...builtin]) {
    const key = `${entry.vendor}::${entry.brand}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

/**
 * Force an immediate refresh — called from settings panel or
 * when user clicks "Check for updates".
 */
export async function forceRefresh(): Promise<{ count: number; success: boolean }> {
  try {
    await fetchAndCache();
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const remote: ConflictEntry[] = stored[CACHE_KEY] ?? [];
    const merged = mergeAndDedupe(CONFLICT_DATABASE, remote);
    return { count: merged.length, success: true };
  } catch {
    return { count: CONFLICT_DATABASE.length, success: false };
  }
}
