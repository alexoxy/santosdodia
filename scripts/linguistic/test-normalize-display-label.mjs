#!/usr/bin/env node

import assert from 'node:assert/strict';
import { normalizeDisplayLabel } from './normalize-display-label.mjs';

assert.equal(normalizeDisplayLabel('San  Pancrazio Martire'), 'San Pancrazio Martire');
assert.equal(normalizeDisplayLabel('  Saint\tPancrazio\nMartyr  '), 'Saint Pancrazio Martyr');
assert.equal(normalizeDisplayLabel('Святой  Николай'), 'Святой Николай');
assert.equal(normalizeDisplayLabel('São\u00a0João'), 'São João');
assert.equal(normalizeDisplayLabel(''), '');
assert.equal(normalizeDisplayLabel(null), null);

console.log('Display-label whitespace normalization tests passed.');
