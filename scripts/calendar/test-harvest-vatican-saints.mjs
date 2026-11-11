import assert from 'node:assert/strict';
import { extractSaintsFromCalendarHtml, monthDays, selectedDays } from './harvest-vatican-saints.mjs';

const html = `
<html><body>
<h2>Menu</h2>
<h2>Busca</h2>
<h1>Santo do dia</h1>
<h2>S. Lourenço, diácono e mártir</h2>
<p>Resumo editorial que o indexador não deve guardar.</p>
<a href="/pt/santo-do-dia/08/10/s--lourenco--diacono-e-martir.html">Leia tudo...</a>
<h2>S. Blano, bispo</h2>
<p>Este santo consta na página do dia, mas não tem página de detalhe.</p>
<h2>Atividades do Papa</h2>
<a href="/pt/papa.html">mais</a>
<h2>A Nossa Fé</h2>
</body></html>`;

const saints = extractSaintsFromCalendarHtml(html, {
  month: 8,
  day: 10,
  pageUrl: 'https://www.vaticannews.va/pt/santo-do-dia/08/10.html'
});
assert.deepEqual(saints, [
  {
    name: 'S. Lourenço, diácono e mártir',
    detailUrl: 'https://www.vaticannews.va/pt/santo-do-dia/08/10/s--lourenco--diacono-e-martir.html'
  },
  {
    name: 'S. Blano, bispo',
    detailUrl: null
  }
]);
assert.equal(JSON.stringify(saints).includes('Menu'), false);
assert.equal(JSON.stringify(saints).includes('Busca'), false);
assert.equal(JSON.stringify(saints).includes('Resumo editorial'), false);
assert.equal(JSON.stringify(saints).includes('Atividades do Papa'), false);
assert.equal(JSON.stringify(saints).includes('A Nossa Fé'), false);

const noDetailOnly = extractSaintsFromCalendarHtml(`
<h2>Menu</h2>
<h2>Busca</h2>
<h2>S. Vicente Maria Strámbi, bispo passionista</h2>
<p>Resumo.</p>
<h2>Santa Maria, Mãe de Deus</h2>
<p>Resumo.</p>
<h2>Atividades do Papa</h2>
<h2>Informações Úteis</h2>`, {
  month: 1,
  day: 1,
  pageUrl: 'https://www.vaticannews.va/pt/santo-do-dia/01/01.html'
});
assert.equal(noDetailOnly.length, 2);
assert.equal(noDetailOnly.every((item) => item.detailUrl === null), true);
assert.equal(noDetailOnly.some((item) => ['Menu', 'Busca'].includes(item.name)), false);

assert.equal(monthDays(2).length, 29);
assert.equal(monthDays(4).length, 30);
assert.equal(monthDays(12).length, 31);
assert.equal(selectedDays('all').length, 366);
assert.equal(selectedDays('month:8').length, 31);
assert.equal(selectedDays('current-month', new Date('2026-08-10T00:00:00Z')).length, 31);
assert.throws(() => selectedDays('bad-scope'), /Unsupported scope/);

console.log('Vatican News saints metadata parser tests passed.');
