import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createLaunchNotebook } from './launch-notebook.mjs';
const generator=readFileSync(new URL('./generate_dialog.py',import.meta.url),'utf8');
const renderer=readFileSync(new URL('./render_episode.py',import.meta.url),'utf8');
test('launch notebook embeds all data, compiles every Python cell, has no automatic publication',()=>{
  const bundle={id:'a'.repeat(64),version:1,records:[{text:'Žluťoučký "text"\n\\ něco'}]};
  const notebook=createLaunchNotebook(bundle,generator,renderer);
  const code=notebook.cells.filter(c=>c.cell_type==='code').map(c=>c.source.join(''));
  const check=spawnSync('python3',['-c','import json,sys\ncells=json.load(sys.stdin)\nfor c in cells: compile(c,"notebook","exec")\nns={}\nexec(cells[0],ns)\nassert ns["BUNDLE"]["version"]==1'],{input:JSON.stringify(code),encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  assert.ok(code[1].includes('generate_episode'));
  assert.ok(code[3].includes('report["minimumMet"]'));
  assert.ok(!code.join('').includes('/api/episodes'));
});
test('checked-in public generator notebook matches builder',()=>{
  const notebook=JSON.parse(readFileSync(new URL('./FantasticFuture.ipynb',import.meta.url)));
  const code=notebook.cells.filter(c=>c.cell_type==='code').map(c=>c.source.join('')).join('');
  assert.ok(code.includes('BUNDLE = json.loads'));
  assert.ok(!code.includes('BUNDLE = json.loads("null")'));
  assert.ok(code.includes('torch==2.8.0'));
  assert.ok(code.includes('uninstall'));
});
