(() => {
  'use strict';
  const catalog = window.CONTRIGAMEBOT_CATALOG;
  const api = window.ContriGameRecommender;
  const form = document.getElementById('recommend-form');
  const input = document.getElementById('preferences');
  const log = document.getElementById('chat-log');
  function message(label, value) {
    const article = document.createElement('article');
    const heading = document.createElement('h2'); heading.textContent = label;
    const p = document.createElement('p'); p.textContent = value;
    article.append(heading, p); log.append(article); return article;
  }
  const errors = api.validateCatalog(catalog);
  if (errors.length) {
    message('ContriGameBot', 'The game catalog could not be loaded. Please contact the project maintainer.');
    form.querySelector('button').disabled = true; return;
  }
  message('ContriGameBot', 'What would you like to play? Try “a forest text adventure” or “a lighthouse rescue”. Each request is matched independently; include all your preferences.');
  form.addEventListener('submit', event => {
    event.preventDefault(); const query = input.value.trim(); if (!query) return;
    message('You', query);
    const { matches, alternatives } = api.recommend(catalog, query);
    const reply = message('ContriGameBot', matches.length ? 'Here are catalog matches. Check the notes before choosing.' : 'No confirmed match for that request. These catalog entries are alternatives, not verified matches:');
    const entries = matches.length ? matches : alternatives;
    if (!entries.length) { const p = document.createElement('p'); p.textContent = 'No available catalog entries meet the known constraints. Try different preferences.'; reply.append(p); }
    entries.forEach(({ game, reasons, unknowns }) => {
      const card = document.createElement('section'); card.className = 'result';
      const title = document.createElement('h3'); title.textContent = game.title;
      const desc = document.createElement('p'); desc.textContent = game.description;
      const why = document.createElement('p'); why.textContent = reasons.length ? 'Matches: ' + reasons.join(', ') + '.' : 'Alternative from the catalog; no matching attributes were confirmed.';
      const note = document.createElement('p'); note.className = 'note'; note.textContent = unknowns.join(' ');
      const link = document.createElement('a'); link.href = game.playUrl; link.textContent = api.actionLabel(game);
      card.append(title, desc, why, note, link); reply.append(card);
    });
    input.value = ''; input.focus();
  });
  document.getElementById('clear-chat').addEventListener('click', () => { log.replaceChildren(); message('ContriGameBot', 'Start a fresh request. What would you like to play?'); input.focus(); });
})();
