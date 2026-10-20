// Source-level checks. Browser layout and assistive-technology checks are separate.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', '01-klar72.html', '02-skab.html', '03-rolig.html', '04-sammen.html', '05-parat.html'];

function load(file, existing = {}) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const nodes = new Map();
  const storage = new Map(Object.entries(existing));
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', innerHTML: '', textContent: '', open: false,
      showModal() { this.open = true; }, close() { this.open = false; },
      focus() {}, scrollIntoView() {}, click() {}, append() {}, remove() {},
    });
    return nodes.get(id);
  };
  const context = vm.createContext({
    console, Date, Intl, Math, Number, String, Set, JSON, Blob,
    setTimeout: () => 0,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document: {
      documentElement: { lang: 'da', outerHTML: html },
      getElementById: node,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      createElement: () => node('temporary'),
      body: { append() {} },
    },
    window: { print() {} },
    location: { pathname: '/' + file },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
  });
  vm.runInContext(code, context, { filename: file });
  vm.runInContext('var captured=[]; toast=message=>captured.push(message); download=(name,text)=>captured.push({name,text});', context);
  return { context, node, storage, run: source => vm.runInContext(source, context), html };
}

for (const file of files) {
  const app = load(file);
  assert.match(app.html, /<!DOCTYPE html>/i);
  assert.match(app.html, /name="viewport"/);
  assert.doesNotMatch(app.html, /<(?:script|link|img)[^>]+(?:src|href)="https?:/i);
  assert.ok(app.node('app').innerHTML.length > 3000, `${file}: renders without dependencies`);
  assert.match(app.node('app').innerHTML, /Ikke en officiel myndighedstjeneste/);
  app.run("lang='en'; updatePage()");
  assert.equal(app.context.document.documentElement.lang, 'en');
  assert.match(app.node('app').innerHTML, /Not an official government service/);
  assert.match(app.node('app').innerHTML, /https:\/\/samsik.dk\/forberedt\//);
  for (const match of app.node('app').innerHTML.matchAll(/href="([a-z0-9-]+\.html)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), `${file}: valid relative link ${match[1]}`);
  }
  console.log(`PASS ${file}: render, DA/EN, source links, dependency-free HTML`);
}

const klar = load('01-klar72.html');
assert.equal(klar.run('state.people*9'), 18);
klar.run('people(1)');
assert.equal(klar.run('state.people*9'), 27);
klar.run('people(100)');
assert.equal(klar.run('state.people'), 12);
klar.run('people(-100)');
assert.equal(klar.run('state.people'), 1);
klar.run("state.checked=['water']; persist(); filter='done'; updatePage(); exportChecklist()");
assert.match(klar.node('app').innerHTML, /100\s*%|11%/);
assert.match(klar.run('captured.at(-1).text'), /\[x\] Drikkevand/);
assert.equal(load('01-klar72.html', Object.fromEntries(klar.storage)).run('state.checked[0]'), 'water');
console.log('PASS Klar72: water arithmetic, bounds, filtered checklist, export and persistence');

const skab = load('02-skab.html');
assert.equal(skab.run("deficits().find(x=>x.id==='water').missing"), 6);
skab.run("quantity('water',-100)");
assert.equal(skab.run("state.items.find(x=>x.id==='water').qty"), 0);
skab.run("openItem();");
for (const [id, value] of Object.entries({'item-name':'Test <b>item</b>','item-cat':'gear','item-unit':'each','item-qty':'2','item-target':'2','item-date':''})) skab.node(id).value = value;
skab.node('item-form').onsubmit({preventDefault(){}});
assert.equal(skab.run('state.items.length'), 6);
assert.match(skab.node('app').innerHTML, /Test &lt;b&gt;item&lt;\/b&gt;/);
skab.run("exportShopping()");
assert.match(skab.run('captured.at(-1).text'), /Test <b>item<\/b>: 2/);
skab.run("filter='soon'; search=''; updatePage()");
assert.match(skab.node('app').innerHTML, /Brug \/ gennemgå snart/);
skab.run("removeItem(state.items.at(-1).id)");
assert.equal(skab.run('state.items.length'), 5);
console.log('PASS Skab: quantities, shopping deficits, add/delete, escaped input, date filter and export');

const rolig = load('03-rolig.html');
rolig.run("selectScenario('siren'); goStep(2)");
assert.match(rolig.node('app').innerHTML, /Brug troværdige kilder/);
rolig.run('finishPractice()');
assert.match(rolig.run('captured.at(-1)'), /stadig punkter/);
rolig.run("scenarios.siren.steps.forEach((step,i)=>state.done['siren-'+i]=step.tasks.map((_,j)=>j)); finishPractice()");
assert.match(rolig.run('captured.at(-1)'), /Øvelsen er gennemgået/);
rolig.run('offlineDownload()');
assert.equal(rolig.run('captured.at(-2).name'), '03-rolig.html');
assert.match(rolig.run('captured.at(-2).text'), /<!DOCTYPE html>/);
assert.equal(load('03-rolig.html', Object.fromEntries(rolig.storage)).run('state.scenario'), 'siren');
console.log('PASS Rolig: scenarios, navigation, incomplete/complete exercises, offline export and persistence');

const sammen = load('04-sammen.html');
sammen.run('openPerson()');
sammen.node('person-name').value = 'Test <script>alert(1)</script>';
sammen.node('person-role').value = 'friend';
sammen.node('person-phone').value = '+45 00 00 00 00';
sammen.node('person-form').onsubmit({preventDefault(){}});
assert.match(sammen.node('app').innerHTML, /Test &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
sammen.node('meeting-name').value = 'Bibliotekets hovedindgang';
sammen.node('meeting-backup').value = 'Ved familie';
sammen.node('meeting-form').onsubmit({preventDefault(){}});
assert.match(sammen.node('app').innerHTML, /Bibliotekets hovedindgang/);
assert.match(sammen.node('app').innerHTML, /print-details/);
sammen.run("deletePerson('p1')");
assert.equal(sammen.run('state.owners.water'), '');
assert.equal(load('04-sammen.html', Object.fromEntries(sammen.storage)).run('state.meeting'), 'Bibliotekets hovedindgang');
console.log('PASS Sammen: contact form, escaped input, meeting plan, print content, reassignment and persistence');

const parat = load('05-parat.html');
parat.run('openLesson(0); completeLesson(); openLesson(0); completeLesson()');
assert.equal(parat.run('state.complete.length'), 1);
parat.run('startQuiz()');
for (let i = 0; i < 5; i++) {
  parat.run('chooseAnswer(questions[questionIndex].correct); revealAnswer()');
  assert.match(parat.node('quiz-dialog').innerHTML, /Korrekt/);
  parat.run('nextQuestion()');
}
assert.equal(parat.run('state.best'), 5);
assert.match(parat.node('quiz-dialog').innerHTML, /5\/5/);
parat.run('startQuiz(); chooseAnswer(0); revealAnswer()');
assert.match(parat.node('quiz-dialog').innerHTML, /option wrong/);
assert.match(parat.node('quiz-dialog').innerHTML, /option correct/);
assert.equal(load('05-parat.html', Object.fromEntries(parat.storage)).run('state.best'), 5);
console.log('PASS Parat: lessons, duplicate prevention, quiz feedback, scoring and persistence');
console.log('All source-level checks passed. Browser visual QA was not performed.');
