#!/usr/bin/env node

import assert from 'node:assert/strict';
import { normalizeDisplayLabel, normalizeDisplaySentence } from './normalize-display-label.mjs';

assert.equal(normalizeDisplayLabel('San  Pancrazio Martire'), 'San Pancrazio Martire');
assert.equal(normalizeDisplayLabel('  Saint\tPancrazio\nMartyr  '), 'Saint Pancrazio Martyr');
assert.equal(normalizeDisplayLabel('Святой  Николай'), 'Святой Николай');
assert.equal(normalizeDisplayLabel('São\u00a0João'), 'São João');
assert.equal(normalizeDisplayLabel('TODOS OS SANTOS', 'pt'), 'Todos os Santos');
assert.equal(normalizeDisplayLabel('S. FRANCISCO XAVIER', 'pt'), 'S. Francisco Xavier');
assert.equal(normalizeDisplayLabel('NOSSA SENHORA DE FÁTIMA', 'pt'), 'Nossa Senhora de Fátima');
assert.equal(normalizeDisplayLabel('15.º DOMINGO DO TEMPO COMUM', 'pt'), '15.º Domingo do Tempo Comum');
assert.equal(normalizeDisplayLabel('ROXO – OFÍCIO DA FÉRIA.', 'pt'), 'Roxo – Ofício da féria.');
assert.equal(normalizeDisplayLabel('NATIVITY OF THE LORD', 'en'), 'Nativity of the Lord');
assert.equal(normalizeDisplaySentence('THE SAINT WAS BORN IN ROME. HE SERVED THE CHURCH.', 'en'), 'The saint was born in rome. He served the church.');
assert.equal(normalizeDisplayLabel(''), '');
assert.equal(normalizeDisplayLabel(null), null);

console.log('Display-label whitespace and casing normalization tests passed.');
