(() => {
  'use strict';

  const games = window.CONTRIGAMEBOT_GAMES || {};
  const el = (id) => document.getElementById(id);
  const ui = {
    picker: el('game-picker'), player: el('player-name'), slot: el('save-slot'), title: el('game-title'), kicker: el('game-kicker'), description: el('game-description'),
    chapter: el('chapter-count'), energy: el('energy-stat'), courage: el('courage-stat'), insight: el('insight-stat'), icon: el('scene-icon'), label: el('scene-label'), sceneTitle: el('scene-title'), text: el('scene-text'),
    choices: el('choices'), ending: el('ending-message'), reset: el('reset-game'), saveNow: el('save-now'), saveNote: el('save-note'), questList: el('quest-list'), questCount: el('quest-count'), inventory: el('inventory-list'),
    createForm: el('pack-create-form'), newTitle: el('new-game-title'), newDescription: el('new-game-description'), importFile: el('pack-import'), exportButton: el('pack-export'), packStatus: el('pack-status')
  };
  const defaultIds = Object.keys(games);
  if (!defaultIds.length) return;

  const PACKS_KEY = 'contrigamebot:custom-packs:v1';
  const LAST_GAME_KEY = 'contrigamebot:last-game:v1';
  let gameId = new URLSearchParams(location.search).get('game') || localStorage.getItem(LAST_GAME_KEY) || defaultIds[0];
  if (!games[gameId]) gameId = defaultIds[0];
  let slot = '1';
  let state;

  function safeRead(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value === null ? fallback : value; }
    catch (error) { return fallback; }
  }
  function playerId() {
    const name = (ui.player.value || 'Player').trim().slice(0, 24) || 'Player';
    return name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'player';
  }
  function saveKey() { return `contrigamebot:save:v2:${encodeURIComponent(playerId())}:${encodeURIComponent(gameId)}:${slot}`; }
  function initialState(game) { return { scene: game.start, stats: { ...game.stats }, inventory: {}, completedQuests: [], ending: '' }; }
  function validState(saved, game) {
    return saved && game.scenes[saved.scene] && saved.stats && ['energy', 'courage', 'insight'].every((key) => Number.isFinite(saved.stats[key])) &&
      saved.inventory && typeof saved.inventory === 'object' && Array.isArray(saved.completedQuests);
  }
  function loadState() {
    let saved = safeRead(saveKey(), null);
    // Migrate the original prototype’s per-game save into Player / Slot 1 once.
    if (!saved && slot === '1' && playerId() === 'player') {
      saved = safeRead(`contrigamebot:${gameId}:v1`, null);
      if (validState(saved, games[gameId])) { try { localStorage.setItem(saveKey(), JSON.stringify(saved)); } catch (error) { /* Play without persistence. */ } }
    }
    return validState(saved, games[gameId]) ? saved : initialState(games[gameId]);
  }
  function saveState() {
    try { localStorage.setItem(saveKey(), JSON.stringify(state)); ui.saveNote.textContent = `Saved locally · ${ui.player.value.trim() || 'Player'} · Slot ${slot}`; }
    catch (error) { ui.saveNote.textContent = 'Browser storage unavailable; progress lasts for this visit.'; }
  }
  function updateUrl() {
    const url = new URL(location.href); url.searchParams.set('game', gameId); history.replaceState({}, '', url);
  }
  function renderPicker() {
    const current = gameId;
    ui.picker.replaceChildren();
    Object.entries(games).forEach(([id, pack]) => { const option = document.createElement('option'); option.value = id; option.textContent = pack.title; ui.picker.append(option); });
    ui.picker.value = current;
  }
  function renderHeader() { const game = games[gameId]; ui.title.textContent = game.title; ui.kicker.textContent = game.kicker || 'A CONTRIGAMEBOT GAME PACK'; ui.description.textContent = game.description; }
  function renderQuests() {
    const quests = games[gameId].quests || [];
    const completed = new Set(state.completedQuests);
    ui.questCount.textContent = `${completed.size}/${quests.length}`;
    ui.questList.replaceChildren();
    quests.forEach((quest) => {
      const done = completed.has(quest.id); const available = (quest.availableAt || []).includes(state.scene) || done;
      const card = document.createElement('article'); card.className = `quest-card${done ? ' is-complete' : ''}${!available ? ' is-locked' : ''}`;
      const badge = document.createElement('span'); badge.className = 'quest-status'; badge.textContent = done ? 'COMPLETE' : (available ? (quest.optional ? 'SIDE QUEST' : 'ACTIVE') : 'UPCOMING');
      const title = document.createElement('h3'); title.textContent = quest.title;
      const description = document.createElement('p'); description.textContent = done ? 'Quest complete — well done!' : quest.description;
      card.append(badge, title, description); ui.questList.append(card);
    });
    if (!quests.length) { const note = document.createElement('p'); note.className = 'inventory-empty'; note.textContent = 'No quests in this pack yet.'; ui.questList.append(note); }
  }
  function renderInventory() {
    const items = games[gameId].items || {}; ui.inventory.replaceChildren();
    const entries = Object.entries(state.inventory).filter(([id, quantity]) => quantity > 0 && items[id]);
    if (!entries.length) { const empty = document.createElement('li'); empty.className = 'inventory-empty'; empty.textContent = 'Your pack is empty. Discoveries appear here.'; ui.inventory.append(empty); return; }
    entries.forEach(([id, quantity]) => {
      const item = items[id]; const row = document.createElement('li'); row.className = 'inventory-item';
      const icon = document.createElement('span'); icon.className = 'item-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = item.icon || '◆';
      const details = document.createElement('span'); details.className = 'item-details';
      const name = document.createElement('strong'); name.textContent = item.name; const desc = document.createElement('small'); desc.textContent = item.description || '';
      details.append(name, desc); const count = document.createElement('span'); count.className = 'item-quantity'; count.textContent = `×${quantity}`; row.append(icon, details, count); ui.inventory.append(row);
    });
  }
  function applyEffects(effects) {
    if (!effects) return;
    Object.entries(effects.stats || {}).forEach(([key, amount]) => { state.stats[key] = Math.max(0, (state.stats[key] || 0) + amount); });
    (effects.items || []).forEach((change) => { const count = (state.inventory[change.id] || 0) + (change.quantity === undefined ? 1 : change.quantity); if (count > 0) state.inventory[change.id] = count; else delete state.inventory[change.id]; });
    (effects.completeQuests || []).forEach((id) => { if (!state.completedQuests.includes(id)) state.completedQuests.push(id); });
    if (effects.ending) state.ending = effects.ending;
  }
  function endingText() {
    const ending = state.ending;
    if (ending === 'together') return `With ${state.stats.insight} insight and ${state.stats.courage} courage, you helped the whole village make the lantern’s light their own. The keeper names you Friend of the Shire.`;
    if (ending === 'song') return `Your courage and insight carried the jay’s song through the square. The villagers join in, and the evening becomes a celebration.`;
    if (ending === 'crew') return 'The harbor crew welcomes you as a friend. The lighthouse beam will guide sailors for many nights to come.';
    if (ending === 'craft') return 'Mara teaches you the first secret of clockwork: every small gear helps the whole machine turn.';
    return 'Your choices have shaped this adventure. A new journey is waiting whenever you are ready.';
  }
  function render() {
    const game = games[gameId]; const scene = game.scenes[state.scene];
    if (!scene) { state = initialState(game); return render(); }
    ui.chapter.textContent = `${scene.chapter} / ${game.chapters}`;
    ui.energy.textContent = state.stats.energy; ui.courage.textContent = state.stats.courage; ui.insight.textContent = state.stats.insight;
    ui.icon.textContent = scene.icon || '✦'; ui.label.textContent = `CHAPTER ${scene.chapter}`; ui.sceneTitle.textContent = scene.title; ui.text.textContent = scene.text;
    ui.choices.replaceChildren(); ui.ending.hidden = state.scene !== 'ending'; ui.ending.textContent = state.scene === 'ending' ? endingText() : '';
    renderQuests(); renderInventory();
    const choices = scene.choices || [];
    if (state.scene === 'ending' || !choices.length) {
      const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'choice-button'; replay.textContent = 'Play this game again';
      replay.addEventListener('click', () => { state = initialState(game); saveState(); render(); }); ui.choices.append(replay); return;
    }
    choices.forEach((choice) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'choice-button'; button.textContent = choice.label; button.addEventListener('click', () => { applyEffects(choice.effects); state.scene = choice.next; saveState(); render(); }); ui.choices.append(button); });
  }
  function switchGame(nextId) { if (!games[nextId]) return; gameId = nextId; try { localStorage.setItem(LAST_GAME_KEY, gameId); } catch (error) { /* URL still retains the selection. */ } state = loadState(); renderHeader(); updateUrl(); render(); }
  function validatePack(pack) {
    if (!pack || typeof pack !== 'object' || !pack.title || !pack.description || !pack.start || !pack.scenes || !pack.scenes[pack.start]) throw new Error('Pack needs a title, description, start scene, and scenes.');
    if (!Number.isInteger(pack.chapters) || pack.chapters < 1) throw new Error('Chapters must be a positive whole number.');
    const sceneIds = new Set(Object.keys(pack.scenes));
    Object.values(pack.scenes).forEach((scene) => { if (!scene.title || !scene.text || !Array.isArray(scene.choices)) throw new Error('Every scene needs a title, text, and choices array.'); scene.choices.forEach((choice) => { if (!choice.label || !sceneIds.has(choice.next)) throw new Error(`Choice in “${scene.title}” points to a missing scene.`); }); });
    if (!pack.stats || !['energy', 'courage', 'insight'].every((key) => Number.isFinite(pack.stats[key]))) throw new Error('Pack needs starting energy, courage, and insight stats.');
    pack.quests = Array.isArray(pack.quests) ? pack.quests : []; pack.items = pack.items && typeof pack.items === 'object' ? pack.items : {};
    return pack;
  }
  function loadCustomPacks() {
    const custom = safeRead(PACKS_KEY, {});
    Object.entries(custom || {}).forEach(([id, pack]) => { try { games[id] = validatePack(pack); } catch (error) { /* Ignore invalid stored pack and keep built-in worlds. */ } });
  }
  function slugify(text) { return text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-game'; }
  function createStarterPack(title, description) {
    let id = slugify(title); let suffix = 2; while (games[id]) id = `${slugify(title)}-${suffix++}`;
    const pack = { title, kicker: 'YOUR NEW ADVENTURE', description, chapters: 2, start: 'beginning', stats: { energy: 3, courage: 0, insight: 0 }, quests: [{ id: 'first-step', title: 'Take the first step', description: 'Choose a path and begin your adventure.', availableAt: ['beginning'] }], items: {}, scenes: {
      beginning: { chapter: 1, icon: '✧', title: 'A new beginning', text: description, choices: [{ label: 'Take the bold path', next: 'ending', effects: { stats: { courage: 1 }, completeQuests: ['first-step'], ending: 'bold' } }, { label: 'Pause and make a plan', next: 'ending', effects: { stats: { insight: 1 }, completeQuests: ['first-step'], ending: 'thoughtful' } }] },
      ending: { chapter: 2, icon: '☼', title: 'Your story begins', text: 'You made your first choice. Add scenes, quests, and items to this game pack in the registry or import an edited JSON pack.', choices: [] }
    } };
    games[id] = validatePack(pack);
    const custom = safeRead(PACKS_KEY, {}); custom[id] = pack;
    try { localStorage.setItem(PACKS_KEY, JSON.stringify(custom)); } catch (error) { ui.packStatus.textContent = 'Created for this visit, but browser storage is unavailable.'; }
    renderPicker(); switchGame(id); ui.packStatus.textContent = `Created “${title}”. Export the pack to keep or share it.`;
  }
  function downloadPack() {
    const blob = new Blob([JSON.stringify(games[gameId], null, 2)], { type: 'application/json' }); const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `${gameId}.json`; link.click(); URL.revokeObjectURL(link.href); ui.packStatus.textContent = `Exported ${games[gameId].title}.`;
  }
  async function importPack(file) {
    if (file.size > 1024 * 1024) throw new Error('Game pack file must be smaller than 1 MB.');
    const pack = validatePack(JSON.parse(await file.text())); let id = slugify(pack.id || pack.title); let suffix = 2; while (games[id]) id = `${slugify(pack.id || pack.title)}-${suffix++}`;
    pack.id = id; games[id] = pack; const custom = safeRead(PACKS_KEY, {}); custom[id] = pack; localStorage.setItem(PACKS_KEY, JSON.stringify(custom)); renderPicker(); switchGame(id); ui.packStatus.textContent = `Imported “${pack.title}”.`;
  }

  loadCustomPacks();
  const queryGame = new URLSearchParams(location.search).get('game'); if (games[queryGame]) gameId = queryGame;
  const querySlot = new URLSearchParams(location.search).get('slot'); if (['1', '2', '3'].includes(querySlot)) slot = querySlot;
  ui.slot.value = slot;
  ui.picker.addEventListener('change', () => switchGame(ui.picker.value));
  ui.slot.addEventListener('change', () => { slot = ui.slot.value; state = loadState(); render(); });
  ui.player.addEventListener('change', () => { state = loadState(); render(); });
  ui.saveNow.addEventListener('click', saveState);
  ui.reset.addEventListener('click', () => { if (confirm(`Restart ${games[gameId].title} in Slot ${slot}? This replaces the current save.`)) { state = initialState(games[gameId]); saveState(); render(); } });
  ui.createForm.addEventListener('submit', (event) => { event.preventDefault(); createStarterPack(ui.newTitle.value.trim(), ui.newDescription.value.trim()); ui.createForm.reset(); });
  ui.exportButton.addEventListener('click', downloadPack);
  ui.importFile.addEventListener('change', async () => { const file = ui.importFile.files[0]; if (!file) return; try { await importPack(file); } catch (error) { ui.packStatus.textContent = `Could not import pack: ${error.message}`; } finally { ui.importFile.value = ''; } });
  renderPicker(); ui.picker.value = gameId; ui.player.value = localStorage.getItem('contrigamebot:player:v1') || 'Player';
  ui.player.addEventListener('change', () => { try { localStorage.setItem('contrigamebot:player:v1', ui.player.value.trim() || 'Player'); } catch (error) { /* Name is still used for this visit. */ } });
  state = loadState(); renderHeader(); render();
})();
