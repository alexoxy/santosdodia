import assert from 'node:assert/strict';
import { extractSaintsFromCalendarHtml, monthDays, selectedDays } from './harvest-vatican-saints.mjs';

const html = `
<html><body>
<h1>Santo do dia</h1>
<h2>S. Lourenço, diácono e mártir</h2>
<p>Resumo editorial que o indexador não deve guardar.</p>
<a href="/pt/santo-do-dia/08/10/s--lourenco--diacono-e-martir.html">Leia tudo...</a>
<h2>S. Blano, bispo</h2>
<a href="https://www.vaticannews.va/pt/santo-do-dia/08/10/s--blano--bispo.html">Leia tudo...</a>
<h2>Atividades do Papa</h2>
<a href="/pt/papa.html">mais</a>
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
    detailUrl: 'https://www.vaticannews.va/pt/santo-do-dia/08/10/s--blano--bispo.html'
  }
]);
assert.equal(JSON.stringify(saints).includes('Resumo editorial'), false);
const alternateHeadingLevel = extractSaintsFromCalendarHtml(`
<h3>S. Eduardo, rei da Inglaterra</h3>
<p>Resumo.</p>
<h3>S. João Nepomuceno Neumann, bispo</h3>
<p>Resumo.</p>
<h2>Atividades do Papa</h2>`, {
  month: 1,
  day: 5,
  pageUrl: 'https://www.vaticannews.va/pt/santo-do-dia/01/05.html'
});
assert.deepEqual(alternateHeadingLevel, [
  { name: 'S. Eduardo, rei da Inglaterra', detailUrl: null },
  { name: 'S. João Nepomuceno Neumann, bispo', detailUrl: null }
]);

assert.equal(monthDays(2).length, 29);
assert.equal(monthDays(4).length, 30);
assert.equal(monthDays(12).length, 31);
assert.equal(selectedDays('all').length, 366);
assert.equal(selectedDays('month:8').length, 31);
assert.equal(selectedDays('current-month', new Date('2026-08-10T00:00:00Z')).length, 31);
assert.throws(() => selectedDays('bad-scope'), /Unsupported scope/);

console.log('Vatican News saints metadata parser tests passed.');
