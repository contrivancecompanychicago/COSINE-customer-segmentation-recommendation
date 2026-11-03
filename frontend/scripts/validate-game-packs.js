#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'js', 'contrigamebot-games.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });
const games = context.window.CONTRIGAMEBOT_GAMES;
const errors = [];

if (!games || typeof games !== 'object' || Object.keys(games).length < 2) {
  errors.push('Expected at least two built-in game packs.');
}

for (const [gameId, game] of Object.entries(games || {})) {
  const prefix = `Game "${gameId}"`;
  if (!game.title || !game.description || !Number.isInteger(game.chapters) || game.chapters < 1) {
    errors.push(`${prefix} is missing title/description or a positive chapter count.`);
  }
  if (!game.scenes || !game.scenes[game.start]) {
    errors.push(`${prefix} start scene does not exist.`);
    continue;
  }
  if (!game.stats || !['energy', 'courage', 'insight'].every((key) => Number.isFinite(game.stats[key]))) {
    errors.push(`${prefix} must define finite energy, courage, and insight starting stats.`);
  }
  const questIds = new Set((game.quests || []).map((quest) => quest.id));
  for (const [sceneId, scene] of Object.entries(game.scenes)) {
    if (!scene.title || !scene.text || !Array.isArray(scene.choices)) {
      errors.push(`${prefix}, scene "${sceneId}" needs title, text, and a choices array.`);
      continue;
    }
    for (const choice of scene.choices) {
      if (!choice.label || !game.scenes[choice.next]) {
        errors.push(`${prefix}, scene "${sceneId}" has a choice with a missing label or destination.`);
      }
      const effects = choice.effects || {};
      for (const item of effects.items || []) {
        if (!game.items || !game.items[item.id]) errors.push(`${prefix}, scene "${sceneId}" references unknown item "${item.id}".`);
      }
      for (const questId of effects.completeQuests || []) {
        if (!questIds.has(questId)) errors.push(`${prefix}, scene "${sceneId}" completes unknown quest "${questId}".`);
      }
    }
  }
  for (const quest of game.quests || []) {
    for (const sceneId of quest.availableAt || []) {
      if (!game.scenes[sceneId]) errors.push(`${prefix}, quest "${quest.id}" references missing scene "${sceneId}".`);
    }
  }
}

if (errors.length) {
  console.error('Game pack validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(games).length} ContriGameBot game packs.`);
}
