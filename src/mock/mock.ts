import { Artifact, CharacterBuild } from '../model';

export const flower: Artifact = {
  set: 'Retracting Bolide',
  level: 16,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {'HP%': 4.7, 'DEF%': 7.25, 'ATK%': 14, 'ATK': 27}
};

export const plume: Artifact = {
  set: 'Retracing Bolide',
  level: 18,
  type: 'Plume',
  rarity: 5,
  mainStat: 'ATK',
  subStats: {'HP': 299, 'CD': 13.2, 'EM': 56, 'ATK%': 10.5}
}

export const sands: Artifact = {
  set: 'Defender\'s Will',
  level: 12,
  type: 'Sands',
  rarity: 4,
  mainStat: 'DEF%',
  subStats: {'EM': 15, 'HP%': 3.7, 'ATK': 28, 'DEF': 30}
}

export const goblet: Artifact = {
  set: 'Defender\'s Will',
  level: 16,
  type: 'Goblet',
  rarity: 4,
  mainStat: 'DEF%',
  subStats: {'HP': 191, 'ATK': 14, 'ATK%': 7.5, 'ER': 9.8}
}

export const circlet: Artifact = {
  set: 'Retracing Bolide',
  level: 20,
  type: 'Circlet',
  rarity: 5,
  mainStat: 'CD',
  subStats: {'ATK': 33, 'CR': 2.7, 'DEF': 53, 'HP': 448}
}

export const build: CharacterBuild = {
  characterName: "Noelle",
  playerId: "playerId",
  talentLevels: {
    normalAttack: 1,
    elementalSkill: 1,
    elementalBurst: 9
  },
  constellation: 6,
  level: 80,
  ascension: 5,
  artifacts: [
    flower,
    plume,
    sands,
    goblet,
    circlet
  ],
  weapon: {
    name: "Skyward Pride",
    level: 90,
    ascension: 6,
    refinement: 1
  }
}