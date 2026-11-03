(function (root) {
  'use strict';
  const words = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  const list = (value) => Array.isArray(value) && value.every(text);
  function safeUrl(value) {
    if (!text(value)) return false;
    if (/^https:\/\//i.test(value)) {
      try { const u = new URL(value); return !!u.hostname && !u.username && !u.password; } catch (_) { return false; }
    }
    // Local links stay within the static package's HTML directory.
    return /^[a-z0-9_-]+\.html(?:\?[^\s#\\]*)?$/i.test(value);
  }
  function validateCatalog(catalog, packs) {
    const errors = [];
    if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.games)) return ['Expected catalog schemaVersion 1 and a games array.'];
    const ids = new Set();
    for (const game of catalog.games) {
      if (!game || typeof game !== 'object') { errors.push('Game must be an object.'); continue; }
      const id = game.id;
      if (!text(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) errors.push('Game IDs must be unique stable slugs: ' + id);
      ids.add(id);
      if (!text(game.title) || !text(game.description)) errors.push(id + ': title and description required.');
      for (const key of ['genres', 'themes', 'formats', 'platforms']) if (!list(game[key])) errors.push(id + ': ' + key + ' must be a string array.');
      if (game.devices !== null && !list(game.devices)) errors.push(id + ': devices must be a string array or null (unknown).');
      if (game.sessionMinutes !== null && (!Number.isInteger(game.sessionMinutes) || game.sessionMinutes < 1)) errors.push(id + ': sessionMinutes must be positive or null (unknown).');
      if (!['playable', 'coming-soon', 'unavailable'].includes(game.status)) errors.push(id + ': invalid status.');
      if (game.playUrl !== null && !safeUrl(game.playUrl)) errors.push(id + ': unsafe or invalid playUrl.');
      if (game.status === 'playable' && !safeUrl(game.playUrl)) errors.push(id + ': playable games need a playUrl.');
      if (game.packId !== undefined && (!text(game.packId) || (packs && !Object.hasOwn(packs, game.packId)))) errors.push(id + ': unknown packId.');
      if (game.packId && game.playUrl !== 'contrigamebot.html?game=' + encodeURIComponent(game.packId)) errors.push(id + ': pack link must match packId.');
    }
    return errors;
  }
  function recommend(catalog, query) {
    const errors = validateCatalog(catalog);
    if (errors.length) throw new Error(errors.join('\n'));
    const tokens = new Set(words(query));
    const has = (...terms) => terms.some(t => tokens.has(t));
    const device = has('phone', 'mobile', 'android', 'iphone') ? 'mobile' : has('desktop', 'computer', 'laptop') ? 'desktop' : null;
    const time = query.match(/\b(\d+)\s*(?:minutes?|mins?)\b/i);
    const maxMinutes = time ? Number(time[1]) : has('short', 'quick') ? 15 : null;
    const results = [];
    for (const game of catalog.games.filter(g => g.status === 'playable')) {
      if (device && game.devices !== null && !game.devices.includes(device)) continue;
      if (maxMinutes !== null && game.sessionMinutes !== null && game.sessionMinutes > maxMinutes) continue;
      const matched = [];
      for (const tag of [...game.genres, ...game.themes, ...game.formats, ...game.platforms]) {
        if (words(tag).some(w => tokens.has(w))) matched.push(tag);
      }
      const titleMatch = words(game.title).filter(w => !['the', 'in', 'a'].includes(w)).some(w => tokens.has(w));
      if (titleMatch) matched.push(game.title);
      if (device && game.devices?.includes(device)) matched.push(device + ' support');
      if (maxMinutes !== null && game.sessionMinutes !== null) matched.push(game.sessionMinutes + ' minute session');
      const reasons = [...new Set(matched)];
      const unknowns = [];
      if (device && game.devices === null) unknowns.push('Device support is unknown.');
      if (maxMinutes !== null && game.sessionMinutes === null) unknowns.push('Session length is unknown.');
      results.push({ game, score: reasons.length, reasons, unknowns });
    }
    results.sort((a, b) => b.score - a.score || a.game.id.localeCompare(b.game.id));
    const matches = results.filter(r => r.score > 0);
    return { matches: matches.slice(0, 3), alternatives: matches.length ? [] : results.slice(0, 3) };
  }
  const api = { validateCatalog, recommend, safeUrl };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ContriGameRecommender = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
