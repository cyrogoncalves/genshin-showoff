import { Artifact, Character, CharacterBuild } from '../model';
import * as CHARACTERS from '../../assets/characters.json';

export const flower: Artifact = {
  set: 'Retracting Bolide',
  level: 16,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {'HP%': 4.7, 'DEF%': 7.25, 'ATK%': 14, 'ATK': 27}
};

export const plume: Artifact = {
  set: 'Retracting Bolide',
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
  set: 'Retracting Bolide',
  level: 20,
  type: 'Circlet',
  rarity: 5,
  mainStat: 'CD',
  subStats: {'ATK': 33, 'CR': 2.7, 'DEF': 53, 'HP': 448}
}

export const build: CharacterBuild = {
  character: CHARACTERS.find(c => c.name === "Noelle") as Character,
  player: {
    id: "playerId",
    username: "username",
    nickname: "playerNickname",
  },
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
    model: {
      name: "Skyward Pride",
      type: 'Claymore',
      rarity: 5,
      baseAtk: 48,
      substat: {
        type: 'ER',
        base: 8
      },
    },
    level: 90,
    ascension: 6,
    refinement: 1
  }
}