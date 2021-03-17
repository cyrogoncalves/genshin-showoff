const weaponTypeNames = ['Sword', 'Bow', 'Polearm', 'Catalyst', 'Claymore'] as const;

export type Level = 1 | 20 | 40 | 50 | 60 | 70 | 80 | 90; // [1-90]

export type WeaponType = typeof weaponTypeNames[number];

export type ArtifactType = 'Flower' | 'Plume' | 'Sands' | 'Goblet' | 'Circlet';

export interface Player {
  readonly id: string;
  readonly username: string;
  readonly nickname: string;
}

export interface Character {
  readonly name: string;
  readonly rarity: 4 | 5;
  readonly element?: 'Pyro' | 'Hydro' | 'Electro' | 'Cryo' | 'Anemo' | 'Geo' | 'Dendro'; // Element not specified for traveller
  readonly weaponType: WeaponType;
  readonly stats: {
    [key in Level]: {
      [key in StatType]?: number /* "HP": number, "ATK": number, "DEF": number */
    }
  }[]
}

export interface WeaponModel {
  name: string;
  type: WeaponType;
  rarity: number; // [1-5]
  baseAtk: number;
  substat: {
    type: SubStatType;
    base: number;
  };
}

export interface Weapon {
  model: WeaponModel;
  level: Level; // [1-90]
  ascension: number; // [1-6]
  refinement: number; // [1-5]
  exp?: number;
}

const subStatNames = ['HP', 'HP%', 'DEF', 'DEF%', 'ATK', 'ATK%', 'EM', 'ER', 'CD', 'CR'] as const;
export type SubStatType = typeof subStatNames[number];

export type StatType = SubStatType | 'Healing' | 'Pyro DMG' | 'Hydro DMG' | 'Electro DMG' | 'Cryo DMG' | 'Anemo DMG' | 'Geo DMG' | 'Physical DMG';

export interface Artifact {
  set: string;
  rarity: number; // [1-5]
  type: ArtifactType;
  mainStat: StatType;
  level: number; // [1-20]
  exp?: number;
  subStats: {
    [key in SubStatType]?: number;
  }; // [1-4]
}

export interface CharacterBuild {
  character: Character,
  player?: Player,
  talentLevels: {
    normalAttack: number, // [1-10]
    elementalSkill: number, // [1-10]
    elementalBurst: number, // [1-10]
  },
  constellation: number, // [1-6]
  level: Level, // [1-90]
  exp?: number,
  ascension: number, // [1-6]
  artifacts: Artifact[], // [5]
  weapon: Weapon,
}