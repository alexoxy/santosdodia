#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SOURCE_ENV_KEYS = {
  catholicism: 'SAINTS_SOURCE_CATHOLICISM',
  anglicanism: 'SAINTS_SOURCE_ANGLICANISM',
  orthodox: 'SAINTS_SOURCE_ORTHODOX'
};

async function fetchSource(tradition) {
  const envKey = SOURCE_ENV_KEYS[tradition];
  const url = envKey ? process.env[envKey] : null;

  if (!url) {
    console.warn(`⚠️  Variável ${envKey} não definida. Ignorado.`);
    return [];
  }

  console.log(`🔄 A obter dados oficiais de ${tradition} a partir de ${url}`);

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`❌ Falha ao ler ${url}: ${response.status} ${response.statusText}`);
      return [];
    }

    const payload = await response.json();
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.records)) {
      return payload.records;
    }

    console.error(`❌ Formato inesperado recebido de ${url}.`);
  } catch (error) {
    console.error(`❌ Erro a comunicar com ${url}:`, error.message);
  }

  return [];
}

async function loadStatic() {
  const modulePath = path.resolve(__dirname, '../data/saints/static.js');
  const mod = await import(modulePath);
  return mod.STATIC_SAINTS || [];
}

function merge(base, incoming) {
  const map = new Map();
  base.forEach((record) => {
    const key = `${record.date}-${record.tradition}`;
    map.set(key, record);
  });

  incoming.forEach((record) => {
    const key = `${record.date}-${record.tradition}`;
    const current = map.get(key) || {};
    map.set(key, {
      ...current,
      ...record,
      titles: { ...(current.titles || {}), ...(record.titles || {}) },
      bios: { ...(current.bios || {}), ...(record.bios || {}) }
    });
  });

  return Array.from(map.values());
}

async function main() {
  const staticRecords = await loadStatic();
  const official = [];

  for (const tradition of Object.keys(SOURCE_ENV_KEYS)) {
    const records = await fetchSource(tradition);
    official.push(...records);
  }

  if (official.length === 0) {
    console.warn('⚠️  Nenhum dado oficial obtido. A manter apenas o arquivo local.');
  }

  const combined = merge(staticRecords, official);
  const output = {
    generatedAt: new Date().toISOString(),
    records: combined
  };

  const target = path.resolve(__dirname, '../data/saints/official.json');
  fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(`✅ Guardado ${combined.length} registos em ${target}`);
  console.log('Síncronia concluída. Reinicie o servidor para carregar os novos dados se necessário.');
}

main().catch((error) => {
  console.error('❌ Erro durante a sincronização:', error);
  process.exit(1);
});
