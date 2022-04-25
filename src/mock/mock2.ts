import { Artifact, CharacterBuild } from '../model';

export const flower: Artifact = {
  set: 'Maiden Beloved',
  level: 20,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {'EM': 40, 'CD': 7, 'ATK%': 9.3, 'CR': 12.1}
};

export const plume: Artifact = {
  set: 'Heart of Depth',
  level: 20,
  type: 'Plume',
  rarity: 5,
  mainStat: 'ATK',
  subStats: {'DEF': 16, 'CD': 5.4, 'HP': 478, 'CR': 14}
}

export const sands: Artifact = {
  set: "Gladiator's Finale",
  level: 20,
  type: 'Sands',
  rarity: 5,
  mainStat: 'ATK%',
  subStats: {'CD': 29.5, 'CR': 7.4, 'HP': 299, 'ATK': 16}
}

export const goblet: Artifact = {
  set: "Blizzard Strayer",
  level: 20,
  type: 'Goblet',
  rarity: 5,
  mainStat: 'Hydro DMG',
  subStats: {'CR': 7.8, 'ATK': 18, 'HP': 508, 'CD': 22.5}
}

export const circlet: Artifact = {
  set: 'Heart of Depth',
  level: 20,
  type: 'Circlet',
  rarity: 5,
  mainStat: 'CD',
  subStats: {'EM': 21, 'CR': 12.1, 'DEF': 37, 'ATK%': 4.1}
}

export const build: CharacterBuild = {
  characterName: "Tartaglia",
  playerId: "playerId",
  talentLevels: {
    normalAttack: 5,
    elementalSkill: 10,
    elementalBurst: 9
  },
  constellation: 0,
  level: 90,
  ascension: 6,
  artifacts: [
    flower,
    plume,
    sands,
    goblet,
    circlet
  ],
  weapon: {
    name: "The Viridescent Hunt",
    level: 90,
    ascension: 6,
    refinement: 1
  }
}