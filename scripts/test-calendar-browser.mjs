import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=process.cwd();
const server=spawn('node',['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3108'],{cwd:root,stdio:'ignore'});
let browser;const checks=[];
try {
 for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:3108/api/v1/context');break;}catch{await new Promise(r=>setTimeout(r,250));}}
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({locale:'en-GB',timezoneId:'America/New_York',extraHTTPHeaders:{'cf-ipcountry':'PT'}});
 await context.addCookies([{name:'sdd-timezone',value:'Europe%2FLisbon',url:'http://127.0.0.1:3108'}]);
 const page=await context.newPage();await page.goto('http://127.0.0.1:3108/calendar');
 const region=page.locator('.filter-panel select').nth(2);
 await region.waitFor();await page.waitForFunction(()=>document.querySelectorAll('.filter-panel select')[2]?.value==='PT');assert.equal(await region.inputValue(),'PT');checks.push('location PT overrides browser en-GB');
 await region.selectOption('GLOBAL');await page.locator('.language-picker select').selectOption('pt');assert.equal(await region.inputValue(),'GLOBAL');checks.push('language change preserves GLOBAL');
 await page.reload();await region.waitFor();assert.equal(await region.inputValue(),'GLOBAL');checks.push('reload preserves GLOBAL');
 await region.selectOption('BR');assert.equal(await page.locator('.church-picker select').inputValue(),'roman-catholic');checks.push('country selection does not change Church');
 await page.locator('.church-picker select').selectOption('all');assert.equal(await region.inputValue(),'BR');checks.push('Church change preserves country BR');
 await page.goto('http://127.0.0.1:3108/');const feed=page.locator('a[href*="/api/ical/"]').first();await feed.waitFor();assert.match(await feed.getAttribute('href'),/country=BR/);checks.push('Today ICS link preserves BR after navigation');
 const cookies=await context.cookies();assert.equal(decodeURIComponent(cookies.find(c=>c.name==='sdd-timezone').value),'Europe/Lisbon');checks.push('browser timezone does not overwrite saved Lisbon');
 await page.goto('http://127.0.0.1:3108/calendar');await region.waitFor();assert.equal(await region.inputValue(),'BR');checks.push('return to calendar preserves BR');
 const report={commit:process.env.GITHUB_SHA??'local',scope:'Chromium against local production build; not deployed production',passed:true,checks};fs.mkdirSync(root+'/staging/calendar-browser',{recursive:true});fs.writeFileSync(root+'/staging/calendar-browser/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
} finally {await browser?.close();server.kill('SIGTERM');}
