'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const catalog = require('../js/game-catalog');
const api = require('../js/game-recommender');
class Element {
  constructor() { this.children = []; this.events = {}; this.dataset = {}; this.value = ''; this.checked = false; this.disabled = false; this.textContent = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
  addEventListener(event, fn) { this.events[event] = fn; }
  setAttribute() {}
  removeAttribute() {}
  focus() {}
}
async function main() {
  const ids = Object.fromEntries(['recommend-form', 'preferences', 'chat-log', 'use-ai', 'mode-note', 'clear-chat'].map(id => [id, new Element()]));
  ids['use-ai'].disabled = true;
  const button = new Element(); ids['recommend-form'].querySelector = () => button;
  const bodies = []; let fail = false;
  const fetchMock = async (url, options) => {
    if (url === '/api/config') return { ok: true, json: async () => ({ aiEnabled: true }) };
    bodies.push(JSON.parse(options.body));
    if (fail) return { ok: false };
    return { ok: true, json: async () => ({ mode: 'ai', ...api.recommend(catalog, 'lighthouse rescue') }) };
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/recommender-chat.js'), 'utf8'), {
    window: { CONTRIGAMEBOT_CATALOG: catalog, ContriGameRecommender: api },
    document: { getElementById: id => ids[id], createElement: () => new Element() },
    fetch: fetchMock, AbortSignal
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ids['use-ai'].disabled, false);
  ids['use-ai'].checked = true; ids['use-ai'].events.change();
  async function submit(query) { ids.preferences.value = query; await ids['recommend-form'].events.submit({ preventDefault() {} }); }
  await submit('Help a ship'); await submit('More like that');
  assert.equal(bodies[1].messages.length, 3);
  assert.equal(bodies[1].messages[0].content, 'Help a ship');
  assert.ok(ids['chat-log'].children.at(-1).children[0].textContent.includes('AI preferences'));
  ids['clear-chat'].events.click(); await submit('New request');
  assert.equal(bodies[2].messages.length, 1);
  fail = true; await submit('forest fantasy');
  assert.ok(ids['mode-note'].textContent.includes('latest request only'));
  assert.ok(ids['chat-log'].children.at(-1).children[0].textContent.includes('Keyword matching'));
  fail = false; await submit('Fresh context');
  assert.equal(bodies.at(-1).messages.length, 1);
  assert.equal(button.disabled, false); assert.equal(ids['clear-chat'].disabled, false);
  console.log('Chat checks passed: AI opt-in, follow-up context, clear, fallback labels, context reset.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
