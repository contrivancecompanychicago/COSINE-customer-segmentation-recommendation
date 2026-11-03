(function (root) {
  'use strict';
  // Discovery metadata is independent of playable scene packs.
  const catalog = {
    schemaVersion: 1,
    games: [
      {
        id: 'lantern-in-the-shire', title: 'The Lantern in the Shire',
        description: 'Explore Bramblewood, help a jay, and recover a missing glowstone.',
        genres: ['adventure', 'fantasy'], themes: ['forest', 'friendship', 'exploration'],
        formats: ['text adventure', 'choice based'], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'playable',
        playUrl: 'contrigamebot.html?game=lantern-in-the-shire', packId: 'lantern-in-the-shire'
      },
      {
        id: 'clockwork-lighthouse', title: 'The Clockwork Lighthouse',
        description: 'Find a brass key and restore a stormbound lighthouse to guide a ship home.',
        genres: ['adventure'], themes: ['lighthouse', 'storm', 'rescue', 'clockwork'],
        formats: ['text adventure', 'choice based'], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'playable',
        playUrl: 'contrigamebot.html?game=clockwork-lighthouse', packId: 'clockwork-lighthouse'
      },
      {
        id: 'krebsville-nights-unequal-treatment', title: 'Krebsville Nights: Unequal Treatment',
        description: 'A COSINE MUD adventure following Dr. Grant through hospital scenes, commands, choices, and quests.',
        genres: ['adventure', 'role playing'], themes: ['hospital', 'unequal treatment'],
        formats: ['text adventure', 'command based', 'choice based'], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'playable',
        playUrl: 'https://krebsvilleunequaltreatmentpt-1.replit.app'
      },
      {
        id: 'culapsedatafarm-agent-lab', title: 'CULAPSEDataFarm: Kaggriculture Agent Lab',
        description: 'The CULAPSE Data Farm Agent Lab project hub. Gameplay availability has not been verified.',
        genres: [], themes: ['culapse', 'data farm', 'kaggriculture', 'agent lab'],
        formats: [], platforms: ['browser'],
        devices: null, sessionMinutes: null, status: 'project-hub',
        playUrl: 'https://culapsedatafarm-agent-lab.erichilarysmithsr.chatgpt.site'
      }
    ]
  };
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.CONTRIGAMEBOT_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this);
