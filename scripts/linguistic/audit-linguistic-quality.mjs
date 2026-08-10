#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const policy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/linguistic-style-policy.json'), 'utf8'));
const authorities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/language-authorities.json'), 'utf8'));
const errors = [];
const warnings = [];

const requiredLocales = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
for (const locale of requiredLocales) {
  const authority = authorities[locale];
  const localePolicy = policy.locales?.[locale];
  if (!authority) errors.push(`Missing language authority for ${locale}.`);
  if (!localePolicy) errors.push(`Missing linguistic style policy for ${locale}.`);
  if (!authority?.variant || !authority?.dictionary || !authority?.dateFormatting || !authority?.reference) {
    errors.push(`Language authority ${locale} is incomplete.`);
  }
}

function walk(directory, extensions) {
  const out = [];
  if (!fs.existsSync(directory)) return out;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules','.next','.git'].includes(entry.name)) continue;
      out.push(...walk(full, extensions));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) out.push(full);
  }
  return out;
}

const cssFiles = walk(path.join(ROOT, 'app'), ['.css']);
for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/text-transform\s*:\s*capitalize\b/iu.test(content)) {
    errors.push(`${path.relative(ROOT, file)} uses text-transform: capitalize; localized language must control casing.`);
  }
}

const textBearingFiles = [
  ...walk(path.join(ROOT, 'app'), ['.ts','.tsx','.json']),
  ...walk(path.join(ROOT, 'lib'), ['.ts','.tsx','.json']),
  ...walk(path.join(ROOT, 'data'), ['.ts','.json']),
].filter((file) => !file.includes(`${path.sep}generated${path.sep}`));

for (const file of textBearingFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const rule of policy.locales?.pt?.forbiddenPatterns ?? []) {
    const expression = new RegExp(rule.pattern, rule.flags ?? 'u');
    if (expression.test(content)) errors.push(`${path.relative(ROOT, file)} violates ${rule.id}.`);
  }
  if (/\b(?:Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+DE\b/u.test(content)) {
    errors.push(`${path.relative(ROOT, file)} contains an uppercase Portuguese date preposition.`);
  }
}

const translationCatalog = path.join(ROOT, 'data/generated/translation-catalog.json');
if (fs.existsSync(translationCatalog)) {
  const catalog = JSON.parse(fs.readFileSync(translationCatalog, 'utf8'));
  for (const [entryId, entry] of Object.entries(catalog.entries ?? {})) {
    for (const [locale, label] of Object.entries(entry.labels ?? {})) {
      if (!requiredLocales.includes(locale)) continue;
      if (typeof label !== 'string' || !label.trim()) errors.push(`Translation ${entryId}/${locale} is empty.`);
      if (/\s{2,}/u.test(label)) warnings.push(`Translation ${entryId}/${locale} contains repeated spaces.`);
      if (/\s+[,.!?;:]/u.test(label) && locale !== 'fr') warnings.push(`Translation ${entryId}/${locale} has suspicious punctuation spacing.`);
      if (locale === 'pt' && /\b(?:Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+De\b/u.test(label)) {
        errors.push(`Translation ${entryId}/pt contains invalid date casing: ${label}`);
      }
    }
  }
}

if (policy.principles?.neverTitleCaseByCss !== true) errors.push('Linguistic policy must forbid title casing by CSS.');
if (policy.principles?.machineTranslationIsNeverSilentlyCanonical !== true) errors.push('Machine translations must never become silently canonical.');
if (policy.translationGate?.blockEnglishFallbackAsTranslation !== true) errors.push('English fallback must not masquerade as a translation.');

const report = {
  schemaVersion: 1,
  ok: errors.length === 0,
  locales: requiredLocales,
  authorityCount: Object.keys(authorities).length,
  scannedTextFiles: textBearingFiles.length,
  scannedCssFiles: cssFiles.length,
  errors,
  warnings,
  generatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
