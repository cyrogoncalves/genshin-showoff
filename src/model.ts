const weaponTypeNames = ['Sword', 'Bow', 'Polearm', 'Catalyst', 'Claymore'] as const;
export type WeaponType = typeof weaponTypeNames[number];

export const levelValues = [1, 20, 40, 50, 60, 70, 80, 90] as const;
export type Level = typeof levelValues[number]; // [1-90]

export const weaponLevelValues = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90] as const;
export type WeaponLevel = typeof weaponLevelValues[number]; // [1-90]

export const artifactTypeNames = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'] as const;
export type ArtifactType = typeof artifactTypeNames[number];

export const subStatNames = ['HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'EM', 'ER', 'CD', 'CR'];
export type SubStatType = typeof subStatNames[number];

export const mainStatNames = [...subStatNames, 'Healing', 'Pyro DMG', 'Hydro DMG', 'Electro DMG', 'Cryo DMG', 'Anemo DMG', 'Geo DMG', 'Physical DMG'];
export type StatType = typeof mainStatNames[number];

export type BuildStats = {
  [key in StatType]?: number;
}

export interface Character {
  readonly name: string;
  readonly rarity: 4 | 5;
  readonly element?: 'Pyro' | 'Hydro' | 'Electro' | 'Cryo' | 'Anemo' | 'Geo' | 'Dendro'; // Element not specified for traveller
  readonly weaponType: WeaponType;
  readonly skillTalentConstellation: 3 | 5,
  readonly burstTalentConstellation: 3 | 5,
  readonly stats: {
    readonly [level in Level]: BuildStats
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
  name: string;
  level: WeaponLevel; // [1-90]
  ascension: number; // [0-6]
  refinement: number; // [1-5]
  exp?: number;
}

export interface Artifact {
  set: string;
  rarity: number; // [1-5]
  type: ArtifactType;
  mainStat: StatType;
  level: number; // [0-20]
  exp?: number;
  subStats: {
    [key in SubStatType]?: number;
  }; // [1-4]
}

export interface CharacterBuild {
  characterName: string,
  playerId?: string
  talentLevels: {
    normalAttack: number, // [1-10]
    elementalSkill: number, // [1-10]
    elementalBurst: number, // [1-10]
  },
  constellation: number, // [0-6]
  level: Level, // [1-90]
  exp?: number,
  ascension: number, // [0-6]
  artifacts: Artifact[], // [5]
  weapon: Weapon
}
