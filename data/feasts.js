const DEFINITIONS = [
  { month: 1, day: 1, tradition: 'catolica', name: 'Santa Maria, Mãe de Deus', notes: 'Solenidade de guarda.' },
  { month: 1, day: 1, tradition: 'ortodoxa', name: 'São Basílio Magno', notes: 'Bispo da Cesareia, doutor da Igreja.' },
  { month: 1, day: 2, tradition: 'catolica', name: 'São Basílio Magno e São Gregório Nazianzeno', notes: 'Bispos e doutores.' },
  { month: 1, day: 6, tradition: 'catolica', name: 'Epifania do Senhor', notes: 'Manifestação de Cristo às nações.' },
  { month: 1, day: 7, tradition: 'ortodoxa', name: 'Natal do Senhor (calendário juliano)', notes: 'Celebração segundo o calendário juliano.' },
  { month: 1, day: 17, tradition: 'catolica', name: 'Santo Antão Abade', notes: 'Pai do monaquismo cristão.' },
  { month: 2, day: 2, tradition: 'catolica', name: 'Apresentação do Senhor', notes: 'Festa também conhecida por Candelária.' },
  { month: 2, day: 2, tradition: 'ortodoxa', name: 'Encontro do Senhor', notes: 'Hypapante do Senhor.' },
  { month: 2, day: 11, tradition: 'catolica', name: 'Nossa Senhora de Lourdes' },
  { month: 3, day: 19, tradition: 'catolica', name: 'São José, Esposo da Virgem Maria', notes: 'Padroeiro universal da Igreja.' },
  { month: 3, day: 25, tradition: 'catolica', name: 'Anunciação do Senhor' },
  { month: 3, day: 25, tradition: 'ortodoxa', name: 'Anunciação da Theotokos' },
  { month: 4, day: 23, tradition: 'catolica', name: 'São Jorge, mártir', notes: 'Soldado e mártir, padroeiro de diversas nações.' },
  { month: 4, day: 23, tradition: 'ortodoxa', name: 'Grande mártir Jorge, o Vitorioso' },
  { month: 4, day: 25, tradition: 'catolica', name: 'São Marcos Evangelista' },
  { month: 5, day: 13, tradition: 'catolica', name: 'Nossa Senhora de Fátima' },
  { month: 5, day: 21, tradition: 'ortodoxa', name: 'Santos Constantino e Helena' },
  { month: 6, day: 13, tradition: 'catolica', name: 'Santo António de Lisboa', notes: 'Também chamado de Santo António de Pádua.' },
  { month: 6, day: 24, tradition: 'catolica', name: 'Natividade de São João Batista' },
  { month: 6, day: 29, tradition: 'catolica', name: 'São Pedro e São Paulo, apóstolos', notes: 'Solenidade.' },
  { month: 6, day: 29, tradition: 'ortodoxa', name: 'Santos Apóstolos Pedro e Paulo' },
  { month: 7, day: 16, tradition: 'catolica', name: 'Nossa Senhora do Carmo' },
  { month: 7, day: 20, tradition: 'ortodoxa', name: 'Profeta Elias, o Tesbita' },
  { month: 7, day: 25, tradition: 'catolica', name: 'São Tiago Maior, apóstolo' },
  { month: 8, day: 6, tradition: 'catolica', name: 'Transfiguração do Senhor' },
  { month: 8, day: 6, tradition: 'ortodoxa', name: 'Transfiguração de Cristo' },
  { month: 8, day: 15, tradition: 'catolica', name: 'Assunção de Nossa Senhora', notes: 'Solenidade de guarda.' },
  { month: 8, day: 15, tradition: 'ortodoxa', name: 'Dormição da Santíssima Theotokos' },
  { month: 9, day: 8, tradition: 'catolica', name: 'Natividade de Nossa Senhora' },
  { month: 9, day: 14, tradition: 'catolica', name: 'Exaltação da Santa Cruz' },
  { month: 9, day: 14, tradition: 'ortodoxa', name: 'Exaltação da Honrada Cruz' },
  { month: 9, day: 17, tradition: 'catolica', name: 'São Roberto Belarmino, bispo e doutor' },
  { month: 10, day: 1, tradition: 'ortodoxa', name: 'Proteção da Mãe de Deus (Pokrov)' },
  { month: 10, day: 4, tradition: 'catolica', name: 'São Francisco de Assis' },
  { month: 10, day: 15, tradition: 'catolica', name: 'Santa Teresa de Jesus' },
  { month: 10, day: 18, tradition: 'catolica', name: 'São Lucas Evangelista' },
  { month: 11, day: 1, tradition: 'catolica', name: 'Todos os Santos', notes: 'Solenidade.' },
  { month: 11, day: 8, tradition: 'ortodoxa', name: 'Sinaxe dos Arcanjos Miguel e Gabriel' },
  { month: 11, day: 15, tradition: 'ortodoxa', name: 'Início do jejum da Natividade', notes: 'Preparação para o Natal.' },
  { month: 11, day: 22, tradition: 'catolica', name: 'Santa Cecília, virgem e mártir', notes: 'Padroeira dos músicos.' },
  { month: 12, day: 6, tradition: 'catolica', name: 'São Nicolau, bispo' },
  { month: 12, day: 6, tradition: 'ortodoxa', name: 'São Nicolau, o Taumaturgo' },
  { month: 12, day: 8, tradition: 'catolica', name: 'Imaculada Conceição de Maria' },
  { month: 12, day: 25, tradition: 'catolica', name: 'Natal do Senhor', notes: 'Solenidade de guarda.' },
  { month: 12, day: 25, tradition: 'ortodoxa', name: 'Natal do Senhor (calendário gregoriano)' }
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function toDetail(def, year) {
  const dateISO = `${year}-${pad(def.month)}-${pad(def.day)}`;
  return {
    id: `${dateISO}-${slugify(def.name)}-${def.tradition}`,
    dateISO,
    name: def.name,
    tradition: def.tradition,
    notes: def.notes
  };
}

function filterByTradition(items, tradition) {
  if (!tradition) return items;
  return items.filter((item) => item.tradition === tradition);
}

export function getMonthlyFeasts(year, monthIndex, tradition) {
  const month = monthIndex + 1;
  const matches = DEFINITIONS.filter((def) => def.month === month);
  return filterByTradition(matches, tradition)
    .map((def) => toDetail(def, year))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export function getFeastsForDate(dateISO, tradition) {
  const [yearStr, monthStr, dayStr] = dateISO.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return [];
  }
  const matches = DEFINITIONS.filter((def) => def.month === month && def.day === day);
  return filterByTradition(matches, tradition).map((def) => toDetail(def, year));
}

export function getAllFeasts(year, tradition) {
  return filterByTradition(DEFINITIONS, tradition)
    .map((def) => toDetail(def, year))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export const availableFeeds = {
  all: undefined,
  catolica: 'catolica',
  ortodoxa: 'ortodoxa'
};
