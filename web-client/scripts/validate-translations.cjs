#!/usr/bin/env node

/**
 * Translation Key Validator
 * Compares EN and FR translation files to find missing keys.
 * Usage: node scripts/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const LANGUAGES = ['en', 'fr'];
const BASE_LANG = 'en';

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadNamespace(lang, namespace) {
  const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`  Error parsing ${lang}/${namespace}.json: ${err.message}`);
    return null;
  }
}

function main() {
  console.log('Translation Key Validator');
  console.log('========================\n');

  // Get all namespaces from base language
  const baseDir = path.join(LOCALES_DIR, BASE_LANG);
  if (!fs.existsSync(baseDir)) {
    console.error(`Base language directory not found: ${baseDir}`);
    process.exit(1);
  }

  const namespaces = fs.readdirSync(baseDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  console.log(`Found ${namespaces.length} namespaces: ${namespaces.join(', ')}\n`);

  let totalMissing = 0;
  let totalExtra = 0;
  let totalEmpty = 0;

  for (const ns of namespaces) {
    const baseData = loadNamespace(BASE_LANG, ns);
    if (!baseData) {
      console.error(`Could not load ${BASE_LANG}/${ns}.json`);
      continue;
    }

    const baseKeys = getKeys(baseData);

    for (const lang of LANGUAGES) {
      if (lang === BASE_LANG) continue;

      const langData = loadNamespace(lang, ns);
      if (!langData) {
        console.error(`  MISSING FILE: ${lang}/${ns}.json`);
        totalMissing += baseKeys.length;
        continue;
      }

      const langKeys = getKeys(langData);
      const baseSet = new Set(baseKeys);
      const langSet = new Set(langKeys);

      const missing = baseKeys.filter(k => !langSet.has(k));
      const extra = langKeys.filter(k => !baseSet.has(k));

      // Check for empty values
      const emptyKeys = [];
      function checkEmpty(obj, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(fullKey);
          } else if (typeof value === 'object' && value !== null) {
            checkEmpty(value, fullKey);
          }
        }
      }
      checkEmpty(langData);

      if (missing.length > 0 || extra.length > 0 || emptyKeys.length > 0) {
        console.log(`[${ns}] ${lang} vs ${BASE_LANG}:`);
        if (missing.length > 0) {
          console.log(`  Missing ${missing.length} key(s):`);
          missing.forEach(k => console.log(`    - ${k}`));
          totalMissing += missing.length;
        }
        if (extra.length > 0) {
          console.log(`  Extra ${extra.length} key(s) (not in ${BASE_LANG}):`);
          extra.forEach(k => console.log(`    + ${k}`));
          totalExtra += extra.length;
        }
        if (emptyKeys.length > 0) {
          console.log(`  Empty ${emptyKeys.length} value(s):`);
          emptyKeys.forEach(k => console.log(`    ! ${k}`));
          totalEmpty += emptyKeys.length;
        }
        console.log();
      }
    }
  }

  console.log('========================');
  console.log('Summary:');
  console.log(`  Namespaces checked: ${namespaces.length}`);
  console.log(`  Missing keys: ${totalMissing}`);
  console.log(`  Extra keys: ${totalExtra}`);
  console.log(`  Empty values: ${totalEmpty}`);

  if (totalMissing > 0) {
    console.log('\nResult: FAIL - Missing translations detected');
    process.exit(1);
  } else {
    console.log('\nResult: PASS - All translations present');
    process.exit(0);
  }
}

main();
