import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(path.resolve('lib/saint-navigation-summary.ts')).href;
const { readSaintCenturySummary, readSaintCountrySummary } = await import(moduleUrl);

const calls = [];
let nextRows = [];
const db = {
  prepare(sql) {
    return {
      bind(...params) {
        calls.push({ sql, params });
        return { async all() { return { success: true, results: nextRows }; } };
      }
    };
  }
};

nextRows = [{ century: 3, saint_count: 14 }, { century: 13, saint_count: 87 }];
const centuries = await readSaintCenturySummary(db, 'pt');
if (centuries[0].century !== 3 || centuries[1].saintCount !== 87) throw new Error('Century summary was not mapped.');
if (!calls.at(-1).sql.includes("d.active = 1") || !calls.at(-1).sql.includes("d.status = 'published'")) throw new Error('Century summary does not fail closed to the active published dataset.');
if (calls.at(-1).params[0] !== 'pt') throw new Error('Century summary locale was not bound.');

nextRows = [{ country_code: 'IT', saint_count: 300, place_count: 95 }];
const countries = await readSaintCountrySummary(db, 'pt');
if (countries[0].countryCode !== 'IT' || countries[0].saintCount !== 300 || countries[0].placeCount !== 95) throw new Error('Country summary was not mapped.');
if (!calls.at(-1).sql.includes("d.active = 1") || !calls.at(-1).sql.includes("d.status = 'published'")) throw new Error('Country summary does not fail closed to the active published dataset.');

let rejected = false;
try { await readSaintCenturySummary(db, '../pt'); } catch { rejected = true; }
if (!rejected) throw new Error('Invalid locale was accepted.');

const failingDb = { prepare() { return { bind() { return { async all() { return { success: false, error: 'boom' }; } }; } }; } };
let failedClosed = false;
try { await readSaintCountrySummary(failingDb, 'pt'); } catch { failedClosed = true; }
if (!failedClosed) throw new Error('Summary D1 errors did not fail closed.');

console.log('Published saints navigation summary tests passed.');
