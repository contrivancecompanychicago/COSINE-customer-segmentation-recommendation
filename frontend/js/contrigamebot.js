(() => {
  'use strict';

  const SAVE_KEY = 'contrigamebot-lantern-v1';
  const initialState = () => ({ scene: 'arrival', chapter: 1, energy: 3, courage: 0, insight: 0, ending: '' });
  const scenes = {
    arrival: {
      chapter: 1, icon: '☾', title: 'A lantern gone dark',
      text: 'At dusk, the Shire’s great lantern flickers out. The village keeper asks you to find its missing glowstone in Bramblewood. A trail of tiny silver leaves leads away from the square.',
      choices: [
        { label: 'Ask the keeper for a map', next: 'crossroads', insight: 1 },
        { label: 'Set off at once and follow the leaves', next: 'crossroads', courage: 1 }
      ]
    },
    crossroads: {
      chapter: 2, icon: '⌘', title: 'The Bramblewood fork',
      text: 'The trail splits. To the left, a rickety bridge crosses a stream. To the right, soft blue lights drift between the trees. Somewhere nearby, a small bird is calling for help.',
      choices: [
        { label: 'Take the old bridge toward the birdcall', next: 'bridge', courage: 1 },
        { label: 'Follow the blue lights into the grove', next: 'grove', insight: 1 }
      ]
    },
    bridge: {
      chapter: 3, icon: '⌁', title: 'The bridge and the jay',
      text: 'A bright-feathered jay is tangled in a loose ribbon near the bridge. The stream burbles below, and the bird watches you with hopeful eyes.',
      choices: [
        { label: 'Carefully free the jay', next: 'meeting', courage: 1, energy: -1 },
        { label: 'Offer a berry and let it lead the way', next: 'meeting', insight: 1 }
      ]
    },
    grove: {
      chapter: 3, icon: '✧', title: 'The listening grove',
      text: 'The blue lights gather around a ring of old stone chimes. Their quiet melody seems to point toward a hollow oak, where a jay is waiting.',
      choices: [
        { label: 'Listen for the tune hidden in the chimes', next: 'meeting', insight: 1 },
        { label: 'Call a cheerful greeting into the trees', next: 'meeting', courage: 1 }
      ]
    },
    meeting: {
      chapter: 4, icon: '♧', title: 'A little help goes a long way',
      text: 'The jay flutters to the hollow oak and nudges a glowing stone from its nest. It is the missing glowstone! The bird chirps as if inviting you to choose how to carry it home.',
      choices: [
        { label: 'Carry it carefully, following the jay’s song', next: 'return', insight: 1 },
        { label: 'Invite the jay to fly beside you', next: 'return', courage: 1 }
      ]
    },
    return: {
      chapter: 5, icon: '✦', title: 'Light for everyone',
      text: 'Back in the village square, neighbors gather around the great lantern. The glowstone fits perfectly into its heart. How will you help the Shire celebrate?',
      choices: [
        { label: 'Ask everyone to share one kind wish', next: 'ending', ending: 'together' },
        { label: 'Lead the jay’s merry song', next: 'ending', ending: 'song' }
      ]
    },
    ending: {
      chapter: 5, icon: '☼', title: 'The Shire shines again',
      text: 'Warm light spills across the square. The keeper thanks you, and the jay settles on the lantern’s rim.',
      choices: []
    }
  };

  const el = (id) => document.getElementById(id);
  const ui = {
    chapter: el('chapter-count'), energy: el('energy-stat'), courage: el('courage-stat'), insight: el('insight-stat'),
    icon: el('scene-icon'), label: el('scene-label'), title: el('scene-title'), text: el('scene-text'),
    choices: el('choices'), ending: el('ending-message'), reset: el('reset-game'), saveNote: el('save-note')
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && scenes[saved.scene] && Number.isInteger(saved.energy) && Number.isInteger(saved.courage) && Number.isInteger(saved.insight)) {
        return { ...initialState(), ...saved };
      }
    } catch (error) {
      // Storage can be unavailable in private browsing; the game still works for this visit.
    }
    return initialState();
  }

  let state = loadState();

  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      ui.saveNote.textContent = 'Your progress saves in this browser.';
    } catch (error) {
      ui.saveNote.textContent = 'Progress lasts for this visit; browser storage is unavailable.';
    }
  }

  function endingCopy() {
    if (state.ending === 'together') {
      return 'With your ' + state.insight + ' insight and ' + state.courage + ' courage, you helped the whole village make the lantern’s light their own. The keeper names you Friend of the Shire.';
    }
    return 'Your ' + state.courage + ' courage and ' + state.insight + ' insight carried the jay’s song through the square. The villagers join in, and the evening becomes a celebration.';
  }

  function choose(choice) {
    state.energy = Math.max(0, state.energy + (choice.energy || 0));
    state.courage += choice.courage || 0;
    state.insight += choice.insight || 0;
    if (choice.ending) state.ending = choice.ending;
    state.scene = choice.next;
    state.chapter = scenes[state.scene].chapter;
    saveState();
    render();
  }

  function render() {
    const scene = scenes[state.scene];
    ui.chapter.textContent = `${scene.chapter} / 5`;
    ui.energy.textContent = state.energy;
    ui.courage.textContent = state.courage;
    ui.insight.textContent = state.insight;
    ui.icon.textContent = scene.icon;
    ui.label.textContent = `CHAPTER ${scene.chapter}`;
    ui.title.textContent = scene.title;
    ui.text.textContent = scene.text;
    ui.choices.replaceChildren();
    ui.ending.hidden = state.scene !== 'ending';
    ui.ending.textContent = state.scene === 'ending' ? endingCopy() : '';

    if (state.scene === 'ending') {
      const replay = document.createElement('button');
      replay.type = 'button';
      replay.className = 'choice-button';
      replay.textContent = 'Play the story again';
      replay.addEventListener('click', () => { state = initialState(); saveState(); render(); });
      ui.choices.append(replay);
      return;
    }

    for (const choice of scene.choices) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice.label;
      button.addEventListener('click', () => choose(choice));
      ui.choices.append(button);
    }
  }

  ui.reset.addEventListener('click', () => {
    state = initialState();
    saveState();
    render();
    ui.title.focus?.();
  });

  render();
})();
