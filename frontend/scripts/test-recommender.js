'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const catalog = require('../js/game-catalog');
const { validateCatalog, recommend } = require('../js/game-recommender');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/contrigamebot-games.js'), 'utf8'), context);
assert.deepEqual(validateCatalog(catalog, context.window.CONTRIGAMEBOT_GAMES), []);
assert.equal(recommend(catalog, 'forest fantasy').matches[0].game.id, 'lantern-in-the-shire');
assert.equal(recommend(catalog, 'lighthouse rescue').matches[0].game.id, 'clockwork-lighthouse');
assert.equal(recommend(catalog, 'racing multiplayer').matches.length, 0);
assert.equal(recommend(catalog, 'racing multiplayer').alternatives.length, 3);
const mobile = recommend(catalog, 'short text adventure on my phone').matches;
assert.equal(mobile.length, 3);
assert.ok(mobile.every(r => r.unknowns.length === 2 && !r.reasons.includes('mobile support')));
const clone = () => JSON.parse(JSON.stringify(catalog));
let invalid = clone(); invalid.games.push(invalid.games[0]);
assert.ok(validateCatalog(invalid).some(e => e.includes('unique')));
for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.test', '../escape.html', 'https://user:pass@example.com']) {
  invalid = clone(); invalid.games[0].playUrl = url;
  assert.ok(validateCatalog(invalid).some(e => e.includes('playUrl')));
}
invalid = clone(); invalid.games[0].sessionMinutes = -1;
assert.ok(validateCatalog(invalid).some(e => e.includes('sessionMinutes')));
invalid = clone(); invalid.games[0].packId = 'missing';
assert.ok(validateCatalog(invalid, context.window.CONTRIGAMEBOT_GAMES).some(e => e.includes('packId')));
invalid = clone(); delete invalid.games[0].devices;
assert.ok(validateCatalog(invalid).some(e => e.includes('devices')));
const expanded = clone();
expanded.games.push({ id: 'external-demo', title: 'External demo', description: 'Test fixture only.', genres: ['racing'], themes: [], formats: [], platforms: ['browser'], devices: ['desktop'], sessionMinutes: 30, status: 'playable', playUrl: 'https://example.com/game' });
assert.deepEqual(validateCatalog(expanded), []);
assert.equal(recommend(expanded, 'racing').matches[0].game.id, 'external-demo');
assert.equal(recommend(expanded, 'racing on my phone').matches.length, 0);
assert.equal(recommend(expanded, 'racing under 10 minutes').matches.length, 0);
expanded.games.at(-1).status = 'coming-soon';
assert.equal(recommend(expanded, 'racing').matches.length, 0);
assert.deepEqual(recommend(catalog, 'text adventure'), recommend(clone(), 'text adventure'));
// Every local play link resolves to a packaged HTML file and valid built-in pack.
for (const game of catalog.games.filter(game => game.packId)) assert.ok(fs.existsSync(path.join(__dirname, '../html', game.playUrl.split('?')[0])));
console.log('Recommender tests passed: catalog validation, matching, unknowns, external games, constraints, links.');

const krebsville = recommend(catalog, 'Krebsville unequal treatment').matches[0];
assert.equal(krebsville.game.id, 'krebsville-nights-unequal-treatment');
assert.equal(krebsville.game.playUrl, 'https://krebsvilleunequaltreatmentpt-1.replit.app');
assert.ok(!Object.hasOwn(krebsville.game, 'packId'));
assert.equal(recommend(catalog, 'hospital').matches[0].game.id, krebsville.game.id);
