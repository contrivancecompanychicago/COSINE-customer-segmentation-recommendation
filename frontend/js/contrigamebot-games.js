(() => {
  'use strict';

  // Add future game packs here (or load them as separate scripts) using the same data shape.
  // The engine stays game-agnostic: each game provides metadata, quests, items, and scenes.
  window.CONTRIGAMEBOT_GAMES = {
    'lantern-in-the-shire': {
      title: 'The Lantern in the Shire',
      kicker: 'A SHIRE HEALTH QUEST • GAME MASTER DEMO',
      description: 'The village lantern has gone dark. Explore Bramblewood, help a curious jay, and recover the glowstone that will light the Shire again.',
      chapters: 5,
      start: 'arrival',
      stats: { energy: 3, courage: 0, insight: 0 },
      quests: [
        { id: 'find-glowstone', title: 'Find the glowstone', description: 'Follow the trail and recover the lantern’s missing stone.', availableAt: ['arrival'], optional: false },
        { id: 'help-jay', title: 'Help the jay', description: 'Look for the bird in Bramblewood and lend a hand.', availableAt: ['bridge', 'grove'], optional: true },
        { id: 'read-the-woods', title: 'Read the woods', description: 'Use a map, the chimes, or the jay’s clues to find your way.', availableAt: ['arrival', 'crossroads', 'bridge', 'grove'], optional: true }
      ],
      items: {
        map: { name: 'Keeper’s map', icon: '▧', description: 'A hand-drawn map of Bramblewood.' },
        berry: { name: 'Sweet berry', icon: '●', description: 'A small snack for a hungry forest friend.' },
        jay-feather: { name: 'Blue jay feather', icon: '✦', description: 'A bright token of your new friendship.' },
        glowstone: { name: 'Glowstone', icon: '◆', description: 'The warm heart of the Shire lantern.' },
        chime-note: { name: 'Chime-note', icon: '♫', description: 'A melody that points toward the hollow oak.' }
      },
      scenes: {
        arrival: {
          chapter: 1, icon: '☾', title: 'A lantern gone dark',
          text: 'At dusk, the Shire’s great lantern flickers out. The village keeper asks you to find its missing glowstone in Bramblewood. A trail of tiny silver leaves leads away from the square.',
          choices: [
            { label: 'Ask the keeper for a map', next: 'crossroads', effects: { stats: { insight: 1 }, items: [{ id: 'map' }], completeQuests: ['read-the-woods'] } },
            { label: 'Set off at once and follow the leaves', next: 'crossroads', effects: { stats: { courage: 1 } } }
          ]
        },
        crossroads: {
          chapter: 2, icon: '⌘', title: 'The Bramblewood fork',
          text: 'The trail splits. To the left, a rickety bridge crosses a stream. To the right, soft blue lights drift between the trees. Somewhere nearby, a small bird is calling for help.',
          choices: [
            { label: 'Take the old bridge toward the birdcall', next: 'bridge', effects: { stats: { courage: 1 } } },
            { label: 'Follow the blue lights into the grove', next: 'grove', effects: { stats: { insight: 1 }, items: [{ id: 'chime-note' }], completeQuests: ['read-the-woods'] } }
          ]
        },
        bridge: {
          chapter: 3, icon: '⌁', title: 'The bridge and the jay',
          text: 'A bright-feathered jay is tangled in a loose ribbon near the bridge. The stream burbles below, and the bird watches you with hopeful eyes.',
          choices: [
            { label: 'Carefully free the jay', next: 'meeting', effects: { stats: { courage: 1, energy: -1 }, items: [{ id: 'jay-feather' }], completeQuests: ['help-jay', 'read-the-woods'] } },
            { label: 'Offer a berry and let it lead the way', next: 'meeting', effects: { stats: { insight: 1 }, items: [{ id: 'berry', quantity: -1 }, { id: 'jay-feather' }], completeQuests: ['help-jay', 'read-the-woods'] } }
          ]
        },
        grove: {
          chapter: 3, icon: '✧', title: 'The listening grove',
          text: 'The blue lights gather around a ring of old stone chimes. Their quiet melody seems to point toward a hollow oak, where a jay is waiting.',
          choices: [
            { label: 'Listen for the tune hidden in the chimes', next: 'meeting', effects: { stats: { insight: 1 }, items: [{ id: 'chime-note' }], completeQuests: ['read-the-woods'] } },
            { label: 'Call a cheerful greeting into the trees', next: 'meeting', effects: { stats: { courage: 1 } } }
          ]
        },
        meeting: {
          chapter: 4, icon: '♧', title: 'A little help goes a long way',
          text: 'The jay flutters to the hollow oak and nudges a glowing stone from its nest. It is the missing glowstone! The bird chirps as if inviting you to choose how to carry it home.',
          choices: [
            { label: 'Carry it carefully, following the jay’s song', next: 'return', effects: { stats: { insight: 1 }, items: [{ id: 'glowstone' }], completeQuests: ['find-glowstone'] } },
            { label: 'Invite the jay to fly beside you', next: 'return', effects: { stats: { courage: 1 }, items: [{ id: 'glowstone' }, { id: 'jay-feather' }], completeQuests: ['find-glowstone', 'help-jay'] } }
          ]
        },
        return: {
          chapter: 5, icon: '✦', title: 'Light for everyone',
          text: 'Back in the village square, neighbors gather around the great lantern. The glowstone fits perfectly into its heart. How will you help the Shire celebrate?',
          choices: [
            { label: 'Ask everyone to share one kind wish', next: 'ending', effects: { ending: 'together' } },
            { label: 'Lead the jay’s merry song', next: 'ending', effects: { ending: 'song' } }
          ]
        },
        ending: {
          chapter: 5, icon: '☼', title: 'The Shire shines again',
          text: 'Warm light spills across the square. The keeper thanks you, and the jay settles on the lantern’s rim.',
          choices: []
        }
      }
    }
  };
})();
