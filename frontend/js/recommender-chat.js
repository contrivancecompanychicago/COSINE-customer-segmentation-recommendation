(() => {
  'use strict';
  const catalog = window.CONTRIGAMEBOT_CATALOG;
  const api = window.ContriGameRecommender;
  const form = document.getElementById('recommend-form');
  const input = document.getElementById('preferences');
  const log = document.getElementById('chat-log');
  const toggle = document.getElementById('use-ai');
  const modeNote = document.getElementById('mode-note');
  const submit = form.querySelector('button[type=submit]');
  const clear = document.getElementById('clear-chat');
  let history = [], busy = false;
  function message(label, value) {
    const article = document.createElement('article');
    const heading = document.createElement('h2'); heading.textContent = label;
    const p = document.createElement('p'); p.textContent = value;
    article.append(heading, p); log.append(article); return article;
  }
  function keywordNote() { modeNote.textContent = 'Keyword mode: each request is matched independently. Include all your preferences.'; }
  const errors = api.validateCatalog(catalog);
  if (errors.length) {
    message('ContriGameBot', 'The game catalog could not be loaded. Please contact the project maintainer.');
    submit.disabled = true; return;
  }
  keywordNote();
  fetch('/api/config', { signal: AbortSignal.timeout(3000) }).then(r => r.ok ? r.json() : null).then(config => {
    if (config?.aiEnabled) {
      toggle.disabled = false; toggle.dataset.available = 'true';
      modeNote.textContent = 'AI conversation is available. Enable it below to send your requests and recent conversation to OpenAI.';
    }
  }).catch(() => { /* Static hosting keeps keyword mode. */ });
  toggle.addEventListener('change', () => {
    history = [];
    if (toggle.checked) modeNote.textContent = 'AI mode: requests and up to eight recent conversation messages are sent to OpenAI. Clear conversation resets this page’s context.';
    else keywordNote();
  });
  message('ContriGameBot', 'What would you like to play? Try “a forest text adventure”, “a lighthouse rescue”, “Krebsville”, or “CULAPSE data farm”.');
  form.addEventListener('submit', async event => {
    event.preventDefault(); const query = input.value.trim(); if (!query || busy) return;
    busy = true; submit.disabled = true; clear.disabled = true; toggle.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const useAi = toggle.checked;
    message('You', query);
    history.push({ role: 'user', content: query }); history = history.slice(-8);
    let data, fallback = false;
    try {
      if (useAi) {
        modeNote.textContent = 'Understanding your preferences…';
        try {
          const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history }), signal: AbortSignal.timeout(30000) });
          if (!response.ok) throw new Error('AI unavailable');
          data = await response.json();
          if (data.mode !== 'ai' || !Array.isArray(data.matches) || !Array.isArray(data.alternatives)) throw new Error('Invalid response');
          modeNote.textContent = 'AI mode: preferences interpreted with AI; game details and links come from the catalog.';
        } catch (_) {
          fallback = true; history = [];
          data = api.recommend(catalog, query);
          modeNote.textContent = 'AI is unavailable. This reply uses keyword matching for your latest request only; conversation context was reset.';
        }
      } else data = api.recommend(catalog, query);
      const { matches, alternatives, clarification } = data;
      const intro = clarification || (matches.length ? 'Here are catalog matches. Check the notes before choosing.' : 'No confirmed match for that request. These catalog entries are alternatives, not verified matches:');
      const reply = message(useAi && !fallback ? 'ContriGameBot · AI preferences' : 'ContriGameBot · Keyword matching', intro);
      const entries = matches.length ? matches : alternatives;
      if (!clarification && !entries.length) {
        const p = document.createElement('p'); p.textContent = 'No catalog entries meet the known constraints. Try different preferences.'; reply.append(p);
      }
      entries.forEach(({ game, reasons, unknowns }) => {
        // Resolve display details against the local catalog, never model-authored descriptions or URLs.
        const entry = catalog.games.find(item => item.id === game.id); if (!entry) return;
        const card = document.createElement('section'); card.className = 'result';
        const title = document.createElement('h3'); title.textContent = entry.title;
        const desc = document.createElement('p'); desc.textContent = entry.description;
        const why = document.createElement('p'); why.textContent = reasons.length ? 'Matches: ' + reasons.join(', ') + '.' : 'Alternative from the catalog; no matching attributes were confirmed.';
        const note = document.createElement('p'); note.className = 'note'; note.textContent = unknowns.join(' ');
        const link = document.createElement('a'); link.href = entry.playUrl; link.textContent = api.actionLabel(entry);
        card.append(title, desc, why, note, link); reply.append(card);
      });
      if (useAi && !fallback) {
        history.push({ role: 'assistant', content: (intro + ' ' + entries.map(row => row.game.title).join('; ')).slice(0, 1000) });
        history = history.slice(-7);
      } else history = [];
      input.value = '';
    } finally {
      busy = false; submit.disabled = false; clear.disabled = false;
      // AI remains selectable only when config discovery enabled it or this request used it.
      toggle.disabled = !useAi && toggle.dataset.available !== 'true';
      if (useAi) { toggle.disabled = false; toggle.dataset.available = 'true'; }
      form.removeAttribute('aria-busy'); input.focus();
    }
  });
  clear.addEventListener('click', () => { history = []; log.replaceChildren(); message('ContriGameBot', 'Conversation cleared. What would you like to play?'); input.focus(); });
})();
