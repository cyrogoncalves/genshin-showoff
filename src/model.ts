const weaponTypeNames = ['Sword', 'Bow', 'Polearm', 'Catalyst', 'Claymore'] as const;

export type WeaponType = typeof weaponTypeNames[number];

export type ArtifactType = 'Flower' | 'Plume' | 'Sands' | 'Goblet' | 'Circlet';

export interface Player {
  readonly id: string;
  readonly username: string;
  readonly uid: number;
  readonly nickname: number;
}

export interface Character {
  readonly name: string;
  readonly rarity: number; // [4-5]
  readonly element: 'Pyro' | 'Hydro' | 'Electro' | 'Cryo' | 'Anemo' | 'Geo' | 'Dendro';
  readonly weaponType: WeaponType;
}

export interface Weapon {
  name: string;
  type: WeaponType;
  rarity: number; // [1-5]
  atk: number;
  secondary: SubStatType;
}

export interface PlayerWeapon extends Weapon {
  level: number; // [1-90]
  refinement: number; // [1-5]
  exp?: number;
}

export type SubStatType = 'HP' | 'HP%' | 'DEF' | 'DEF%' | 'ATK' | 'ATK%' | 'EM' | 'ER' | 'CD' | 'CR';

export type StatType = SubStatType | 'Healing Bonus' | 'Pyro DMG Bonus' | 'Hydro DMG Bonus' | 'Electro DMG Bonus'
    | 'Cryo DMG Bonus' | 'Anemo DMG Bonus' | 'Geo DMG Bonus' | 'Physical DMG Bonus';

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

export interface PlayerCharacter extends Character {
  player: Player;
  talentLevels: {
    normalAttack: number; // [1-10]
    elementalSkill: number; // [1-10]
    elementalBurst: number; // [1-10]
  };
  constellation: number; // [1-6]
  level: number; // [1-90]
  exp: number;
  ascension: number; // [1-6]
  artifacts: {
    flower: Artifact;
    plume: Artifact;
    sands: Artifact;
    goblet: Artifact;
    circlet: Artifact;
  };
  weapon: PlayerWeapon;
}