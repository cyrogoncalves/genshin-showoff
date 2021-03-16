import { ArtifactService } from './artifact.service';
import { Artifact, CharacterBuild } from './model';

const flower: Artifact = {
  set: 'Retracting Bolide',
  level: 16,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {'HP%': 4.7, 'DEF%': 7.3, 'ATK%': 14, 'ATK': 27}
};

const plume: Artifact = {
  set: 'Retracting Bolide',
  level: 18,
  type: 'Plume',
  rarity: 5,
  mainStat: 'ATK',
  subStats: {'HP': 299, 'CD': 13.2, 'EM': 56, 'ATK%': 10.5}
}

const sands: Artifact = {
  set: 'Guardian',
  level: 12,
  type: 'Sands',
  rarity: 4,
  mainStat: 'DEF%',
  subStats: {'EM': 15, 'HP%': 3.7, 'ATK': 28, 'DEF': 30}
}

const goblet: Artifact = {
  set: 'Guardian',
  level: 16,
  type: 'Goblet',
  rarity: 4,
  mainStat: 'DEF%',
  subStats: {'HP': 191, 'ATK': 14, 'ATK%': 7.5, 'ER': 9.8}
}

const circlet: Artifact = {
  set: 'Retracting Bolide',
  level: 20,
  type: 'Circlet',
  rarity: 5,
  mainStat: 'CD',
  subStats: {'ATK': 33, 'CR': 2.7, 'DEF': 53, 'HP': 448}
}

const build: CharacterBuild = {
  character: {
    name: "Noelle",
    rarity: 4,
    element: 'Geo',
    weaponType: 'Claymore',
  },
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
  level: 50,
  ascension: 3,
  artifacts: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  weapon: {
    name: "Skyward Pride",
    type: 'Claymore',
    rarity: 5,
    baseAtk: 48,
    substat: {
      type: 'ER',
      base: 8
    },

    level: 90,
    ascension: 6,
    refinement: 1
  }
}

describe('CharacterBuildCommand', () => {
  it('possible Values For 1 Roll on 5*', () => {
    const possibleSums = ArtifactService.possibleCombinations(4, 1);
    expect(possibleSums).toEqual([[0], [1], [2], [3]]);
  })
});
