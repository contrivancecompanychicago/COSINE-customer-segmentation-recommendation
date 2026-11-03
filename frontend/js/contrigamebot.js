(() => {
  'use strict';

  const games = window.CONTRIGAMEBOT_GAMES || {};
  const gamePicker = document.getElementById('game-picker');
  const gameIds = Object.keys(games);
  if (!gameIds.length) return;

  const defaultGameId = gameIds[0];
  const selectedGameId = new URLSearchParams(window.location.search).get('game');
  let gameId = games[selectedGameId] ? selectedGameId : defaultGameId;
  let game = games[gameId];
  let state;

  const el = (id) => document.getElementById(id);
  const ui = {
    title: el('game-title'), kicker: el('game-kicker'), description: el('game-description'),
    chapter: el('chapter-count'), energy: el('energy-stat'), courage: el('courage-stat'), insight: el('insight-stat'),
    icon: el('scene-icon'), label: el('scene-label'), sceneTitle: el('scene-title'), text: el('scene-text'),
    choices: el('choices'), ending: el('ending-message'), reset: el('reset-game'), saveNote: el('save-note'),
    questList: el('quest-list'), questCount: el('quest-count'), inventory: el('inventory-list')
  };

  function storageKey(id) { return `contrigamebot:${id}:v1`; }

  function initialState() {
    return {
      scene: game.start,
      stats: { ...game.stats },
      inventory: {},
      completedQuests: [],
      ending: ''
    };
  }

  function isValidState(saved) {
    return saved && game.scenes[saved.scene] && saved.stats &&
      ['energy', 'courage', 'insight'].every((key) => Number.isFinite(saved.stats[key])) &&
      saved.inventory && typeof saved.inventory === 'object' && Array.isArray(saved.completedQuests);
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(gameId)));
      if (isValidState(saved)) return saved;
    } catch (error) {
      // Storage may be disabled; the game remains playable for this visit.
    }
    return initialState();
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey(gameId), JSON.stringify(state));
      ui.saveNote.textContent = 'Progress saves in this browser for this game.';
    } catch (error) {
      ui.saveNote.textContent = 'Progress lasts for this visit; browser storage is unavailable.';
    }
  }

  function addItem(itemChange) {
    const nextQuantity = (state.inventory[itemChange.id] || 0) + (itemChange.quantity || 1);
    if (nextQuantity > 0) state.inventory[itemChange.id] = nextQuantity;
    else delete state.inventory[itemChange.id];
  }

  function applyEffects(effects) {
    if (!effects) return;
    Object.entries(effects.stats || {}).forEach(([name, change]) => {
      state.stats[name] = Math.max(0, (state.stats[name] || 0) + change);
    });
    (effects.items || []).forEach(addItem);
    (effects.completeQuests || []).forEach((questId) => {
      if (!state.completedQuests.includes(questId)) state.completedQuests.push(questId);
    });
    if (effects.ending) state.ending = effects.ending;
  }

  function endingCopy() {
    const stats = state.stats;
    return state.ending === 'together'
      ? `With ${stats.insight} insight and ${stats.courage} courage, you helped the whole village make the lantern’s light their own. The keeper names you Friend of the Shire.`
      : `Your ${stats.courage} courage and ${stats.insight} insight carried the jay’s song through the square. The villagers join in, and the evening becomes a celebration.`;
  }

  function renderQuests() {
    const currentScene = game.scenes[state.scene];
    const completed = new Set(state.completedQuests);
    const quests = game.quests;
    ui.questCount.textContent = `${completed.size}/${quests.length}`;
    ui.questList.replaceChildren();

    quests.forEach((quest) => {
      const isComplete = completed.has(quest.id);
      const isAvailable = quest.availableAt.includes(state.scene) || isComplete;
      const card = document.createElement('article');
      card.className = `quest-card${isComplete ? ' is-complete' : ''}${!isAvailable ? ' is-locked' : ''}`;
      const title = document.createElement('h3');
      title.textContent = quest.title;
      const description = document.createElement('p');
      description.textContent = isComplete ? 'Quest complete — well done!' : quest.description;
      const badge = document.createElement('span');
      badge.className = 'quest-status';
      badge.textContent = isComplete ? 'COMPLETE' : (isAvailable ? (quest.optional ? 'SIDE QUEST' : 'ACTIVE') : 'UPCOMING');
      card.append(badge, title, description);
      ui.questList.append(card);
    });
  }

  function renderInventory() {
    ui.inventory.replaceChildren();
    const entries = Object.entries(state.inventory).filter(([, quantity]) => quantity > 0);
    if (!entries.length) {
      const empty = document.createElement('li');
      empty.className = 'inventory-empty';
      empty.textContent = 'Your pack is empty. Your discoveries will appear here.';
      ui.inventory.append(empty);
      return;
    }
    entries.forEach(([itemId, quantity]) => {
      const item = game.items[itemId];
      if (!item) return;
      const row = document.createElement('li');
      row.className = 'inventory-item';
      const icon = document.createElement('span');
      icon.className = 'item-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.icon;
      const details = document.createElement('span');
      details.className = 'item-details';
      const name = document.createElement('strong');
      name.textContent = item.name;
      const description = document.createElement('small');
      description.textContent = item.description;
      details.append(name, description);
      const count = document.createElement('span');
      count.className = 'item-quantity';
      count.textContent = `×${quantity}`;
      row.append(icon, details, count);
      ui.inventory.append(row);
    });
  }

  function choose(choice) {
    applyEffects(choice.effects);
    state.scene = choice.next;
    saveState();
    render();
  }

  function render() {
    const scene = game.scenes[state.scene];
    ui.chapter.textContent = `${scene.chapter} / ${game.chapters}`;
    ui.energy.textContent = state.stats.energy;
    ui.courage.textContent = state.stats.courage;
    ui.insight.textContent = state.stats.insight;
    ui.icon.textContent = scene.icon;
    ui.label.textContent = `CHAPTER ${scene.chapter}`;
    ui.sceneTitle.textContent = scene.title;
    ui.text.textContent = scene.text;
    ui.choices.replaceChildren();
    ui.ending.hidden = state.scene !== 'ending';
    ui.ending.textContent = state.scene === 'ending' ? endingCopy() : '';
    renderQuests();
    renderInventory();

    if (state.scene === 'ending') {
      const replay = document.createElement('button');
      replay.type = 'button';
      replay.className = 'choice-button';
      replay.textContent = 'Play this story again';
      replay.addEventListener('click', () => { state = initialState(); saveState(); render(); });
      ui.choices.append(replay);
      return;
    }

    scene.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice.label;
      button.addEventListener('click', () => choose(choice));
      ui.choices.append(button);
    });
  }

  function selectGame(nextGameId) {
    gameId = nextGameId;
    game = games[gameId];
    state = loadState();
    const params = new URLSearchParams(window.location.search);
    params.set('game', gameId);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    ui.title.textContent = game.title;
    ui.kicker.textContent = game.kicker;
    ui.description.textContent = game.description;
    render();
  }

  gameIds.forEach((id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = games[id].title;
    gamePicker.append(option);
  });
  gamePicker.value = gameId;
  gamePicker.addEventListener('change', () => selectGame(gamePicker.value));
  ui.reset.addEventListener('click', () => {
    state = initialState();
    saveState();
    render();
  });

  state = loadState();
  ui.title.textContent = game.title;
  ui.kicker.textContent = game.kicker;
  ui.description.textContent = game.description;
  render();
})();
