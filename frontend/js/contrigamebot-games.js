(() => {
  'use strict';

  const games = {
    'lantern-in-the-shire': {
      title: 'The Lantern in the Shire', kicker: 'A SHIRE HEALTH QUEST • GAME MASTER DEMO',
      description: 'Explore Bramblewood, help a curious jay, and recover the glowstone that will light the Shire again.', chapters: 5, start: 'arrival',
      stats: { energy: 3, courage: 0, insight: 0 },
      quests: [
        { id: 'find-glowstone', title: 'Find the glowstone', description: 'Follow the trail and recover the lantern’s missing stone.', availableAt: ['arrival'] },
        { id: 'help-jay', title: 'Help the jay', description: 'Look for the bird in Bramblewood and lend a hand.', availableAt: ['bridge', 'grove'], optional: true },
        { id: 'read-the-woods', title: 'Read the woods', description: 'Use a map, chimes, or clues to find your way.', availableAt: ['arrival', 'crossroads', 'bridge', 'grove'], optional: true }
      ],
      items: {
        map: { name: 'Keeper’s map', icon: '▧', description: 'A hand-drawn map of Bramblewood.' },
        berry: { name: 'Sweet berry', icon: '●', description: 'A small snack for a hungry forest friend.' },
        'jay-feather': { name: 'Blue jay feather', icon: '✦', description: 'A bright token of your new friendship.' },
        glowstone: { name: 'Glowstone', icon: '◆', description: 'The warm heart of the Shire lantern.' },
        'chime-note': { name: 'Chime-note', icon: '♫', description: 'A melody pointing toward the hollow oak.' }
      },
      scenes: {
        arrival: { chapter: 1, icon: '☾', title: 'A lantern gone dark', text: 'At dusk, the Shire’s great lantern flickers out. The keeper asks you to find its missing glowstone in Bramblewood. A trail of tiny silver leaves leads away from the square.', choices: [
          { label: 'Ask the keeper for a map', next: 'crossroads', effects: { stats: { insight: 1 }, items: [{ id: 'map' }], completeQuests: ['read-the-woods'] } },
          { label: 'Set off at once and follow the leaves', next: 'crossroads', effects: { stats: { courage: 1 } } }
        ] },
        crossroads: { chapter: 2, icon: '⌘', title: 'The Bramblewood fork', text: 'The trail splits. A rickety bridge crosses a stream; soft blue lights drift between the trees. Somewhere nearby, a small bird calls for help.', choices: [
          { label: 'Take the old bridge toward the birdcall', next: 'bridge', effects: { stats: { courage: 1 } } },
          { label: 'Follow the blue lights into the grove', next: 'grove', effects: { stats: { insight: 1 }, items: [{ id: 'chime-note' }], completeQuests: ['read-the-woods'] } }
        ] },
        bridge: { chapter: 3, icon: '⌁', title: 'The bridge and the jay', text: 'A bright-feathered jay is tangled in a loose ribbon near the bridge. The stream burbles below, and the bird watches you with hopeful eyes.', choices: [
          { label: 'Carefully free the jay', next: 'meeting', effects: { stats: { courage: 1, energy: -1 }, items: [{ id: 'jay-feather' }], completeQuests: ['help-jay', 'read-the-woods'] } },
          { label: 'Offer a berry and let it lead the way', next: 'meeting', effects: { stats: { insight: 1 }, items: [{ id: 'berry', quantity: -1 }, { id: 'jay-feather' }], completeQuests: ['help-jay', 'read-the-woods'] } }
        ] },
        grove: { chapter: 3, icon: '✧', title: 'The listening grove', text: 'Blue lights gather around old stone chimes. Their quiet melody points toward a hollow oak, where a jay is waiting.', choices: [
          { label: 'Listen for the tune hidden in the chimes', next: 'meeting', effects: { stats: { insight: 1 }, items: [{ id: 'chime-note' }], completeQuests: ['read-the-woods'] } },
          { label: 'Call a cheerful greeting into the trees', next: 'meeting', effects: { stats: { courage: 1 } } }
        ] },
        meeting: { chapter: 4, icon: '♧', title: 'A little help goes a long way', text: 'The jay nudges a glowing stone from its nest. It is the missing glowstone! The bird chirps as if inviting you to choose how to carry it home.', choices: [
          { label: 'Carry it carefully, following the jay’s song', next: 'return', effects: { stats: { insight: 1 }, items: [{ id: 'glowstone' }], completeQuests: ['find-glowstone'] } },
          { label: 'Invite the jay to fly beside you', next: 'return', effects: { stats: { courage: 1 }, items: [{ id: 'glowstone' }, { id: 'jay-feather' }], completeQuests: ['find-glowstone', 'help-jay'] } }
        ] },
        return: { chapter: 5, icon: '✦', title: 'Light for everyone', text: 'Back in the village square, neighbors gather around the great lantern. The glowstone fits perfectly into its heart. How will you help the Shire celebrate?', choices: [
          { label: 'Ask everyone to share one kind wish', next: 'ending', effects: { ending: 'together' } },
          { label: 'Lead the jay’s merry song', next: 'ending', effects: { ending: 'song' } }
        ] },
        ending: { chapter: 5, icon: '☼', title: 'The Shire shines again', text: 'Warm light spills across the square. The keeper thanks you, and the jay settles on the lantern’s rim.', choices: [] }
      }
    },
    'clockwork-lighthouse': {
      title: 'The Clockwork Lighthouse', kicker: 'A CONTRIGAMEBOT GAME PACK',
      description: 'A storm has stopped the lighthouse gears. Find the missing brass key and guide a ship safely into harbor.', chapters: 3, start: 'shore',
      stats: { energy: 3, courage: 0, insight: 0 },
      quests: [
        { id: 'find-key', title: 'Find the brass key', description: 'Search the shore or the keeper’s workshop.', availableAt: ['shore'] },
        { id: 'restore-light', title: 'Restore the lighthouse', description: 'Get the beacon turning before the ship reaches the rocks.', availableAt: ['tower'] }
      ],
      items: {
        'brass-key': { name: 'Brass key', icon: '⚿', description: 'A heavy key that fits the lighthouse gear box.' },
        'storm-lantern': { name: 'Storm lantern', icon: '♨', description: 'A steady light for finding your way.' },
        gear: { name: 'Spare gear', icon: '⚙', description: 'A replacement cog from the keeper’s workbench.' }
      },
      scenes: {
        shore: { chapter: 1, icon: '≈', title: 'A beacon in the storm', text: 'Rain sweeps across the harbor. The lighthouse beam is dark, and a ship is struggling beyond the breakwater. Keeper Mara asks you to restart the clockwork beacon.', choices: [
          { label: 'Search the tide pools for the key', next: 'tower', effects: { stats: { courage: 1 }, items: [{ id: 'brass-key' }], completeQuests: ['find-key'] } },
          { label: 'Check the keeper’s workshop first', next: 'tower', effects: { stats: { insight: 1 }, items: [{ id: 'brass-key' }, { id: 'gear' }, { id: 'storm-lantern' }], completeQuests: ['find-key'] } }
        ] },
        tower: { chapter: 2, icon: '⚙', title: 'The stopped gears', text: 'At the top of the tower, the brass mechanism is jammed. The key turns, but one cog is missing. Wind rattles the windows as the ship draws closer.', choices: [
          { label: 'Fit the spare gear and restart the beacon', next: 'harbor', effects: { stats: { insight: 1 }, items: [{ id: 'gear', quantity: -1 }], completeQuests: ['restore-light'] } },
          { label: 'Use the storm lantern to signal the ship while you work', next: 'harbor', effects: { stats: { courage: 1 }, items: [{ id: 'storm-lantern', quantity: -1 }], completeQuests: ['restore-light'] } }
        ] },
        harbor: { chapter: 3, icon: '☼', title: 'A safe harbor', text: 'The lighthouse shines through the storm. The ship follows the beam into calm water, and the keeper gives you a grateful salute.', choices: [
          { label: 'Celebrate with the harbor crew', next: 'ending', effects: { ending: 'crew' } },
          { label: 'Ask Mara to teach you the clockwork', next: 'ending', effects: { ending: 'craft' } }
        ] },
        ending: { chapter: 3, icon: '⚓', title: 'The harbor is safe', text: 'The ship is home, the beacon is bright, and a new adventure waits beyond the horizon.', choices: [] }
      }
    }
  };

  window.CONTRIGAMEBOT_GAMES = games;
})();
