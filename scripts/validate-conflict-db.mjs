#!/usr/bin/env node

/**
 * Validates data/conflict-db.json
 *
 * Rules:
 * 1. Valid JSON array
 * 2. Every entry has vendor, brand, relationship, source (all strings)
 * 3. source must be a valid HTTPS URL
 * 4. source URL must be reachable (HTTP 200/301/302)
 * 5. relationship must be from the allowed list
 * 6. No duplicate (vendor, brand) pairs
 * 7. vendor and brand must be lowercase
 *
 * Exit 0 = all good, Exit 1 = validation failed
 */

import { readFile } from 'node:fs/promises';
import { argv } from 'node:process';

const ALLOWED_RELATIONSHIPS = new Set([
  'investor',
  'investor_product',
  'investor_cloud',
  'exclusive_cloud',
  'partner',
  'integration',
  'subsidiary',
  'technology_provider',
  'parent_fund',
  'data_partner',
  'acquirer',
]);

const SKIP_URL_CHECK = argv.includes('--skip-url-check');

async function main() {
  const path = 'data/conflict-db.json';
  const errors = [];
  const warnings = [];

  // 1. Read and parse
  let data;
  try {
    const raw = await readFile(path, 'utf-8');
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`FATAL: Cannot parse ${path}: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error('FATAL: Root must be a JSON array');
    process.exit(1);
  }

  console.log(`Validating ${data.length} entries...\n`);

  const seen = new Set();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const prefix = `[${i}] ${entry.vendor ?? '?'}→${entry.brand ?? '?'}`;

    // 2. Required fields
    for (const field of ['vendor', 'brand', 'relationship', 'source']) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        errors.push(`${prefix}: missing or empty "${field}"`);
      }
    }

    if (errors.length > 0 && errors[errors.length - 1].includes('missing')) {
      continue;
    }

    // 3. Lowercase check
    if (entry.vendor !== entry.vendor.toLowerCase()) {
      errors.push(`${prefix}: vendor must be lowercase (got "${entry.vendor}")`);
    }
    if (entry.brand !== entry.brand.toLowerCase()) {
      errors.push(`${prefix}: brand must be lowercase (got "${entry.brand}")`);
    }

    // 4. Relationship allowlist
    if (!ALLOWED_RELATIONSHIPS.has(entry.relationship)) {
      errors.push(
        `${prefix}: unknown relationship "${entry.relationship}". ` +
        `Allowed: ${[...ALLOWED_RELATIONSHIPS].join(', ')}`
      );
    }

    // 5. Source URL format
    try {
      const url = new URL(entry.source);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        errors.push(`${prefix}: source must be http(s), got "${url.protocol}"`);
      }
    } catch {
      errors.push(`${prefix}: source is not a valid URL: "${entry.source}"`);
    }

    // 6. Duplicate check
    const key = `${entry.vendor}::${entry.brand}`;
    if (seen.has(key)) {
      errors.push(`${prefix}: duplicate (vendor, brand) pair`);
    }
    seen.add(key);
  }

  // 7. URL reachability (parallel, with timeout)
  if (!SKIP_URL_CHECK) {
    console.log('Checking source URL reachability...');
    const urlChecks = data.map(async (entry, i) => {
      const prefix = `[${i}] ${entry.vendor}→${entry.brand}`;
      try {
        const resp = await fetch(entry.source, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
        });
        if (resp.status >= 400) {
          warnings.push(
            `${prefix}: source URL returned HTTP ${resp.status}: ${entry.source}`
          );
        }
      } catch (e) {
        warnings.push(
          `${prefix}: source URL unreachable: ${entry.source} (${e.message})`
        );
      }
    });
    await Promise.allSettled(urlChecks);
  }

  // Report
  console.log('\n' + '='.repeat(60));

  if (errors.length > 0) {
    console.error(`\n❌ ${errors.length} ERROR(s):\n`);
    for (const e of errors) console.error(`  • ${e}`);
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  ${warnings.length} WARNING(s) (non-blocking):\n`);
    for (const w of warnings) console.warn(`  • ${w}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`\n✅ All ${data.length} entries passed validation.`);
  } else if (errors.length === 0) {
    console.log(`\n✅ All ${data.length} entries passed (with ${warnings.length} warnings).`);
  }

  console.log('='.repeat(60));
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
