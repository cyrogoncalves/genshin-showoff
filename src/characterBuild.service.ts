import * as CHARACTERS from "../assets/characters.json";
import * as WEAPONS from '../assets/weapons.json';
import * as SCALING_STATS from '../assets/weaponScalingStats.json';
import * as SCALING_SUBSTATS from '../assets/weaponScalingSubstats.json';
import { BuildStats, Character, CharacterBuild, Weapon, WeaponLevel } from './model';
import { ArtifactService } from './artifact.service';

const ascensionLevelMap = [
  [1, 5, 10, 15, 20],
  [20, 25, 30, 35, 40],
  [40, 45, 50],
  [50, 55, 60],
  [60, 65, 70],
  [70, 75, 80],
  [80, 85, 90]
];

const getCharacter = (name: string): Character => CHARACTERS.find(c => c.name === name) as Character;

const createDefault = (
    character: Character,
    playerId: string,
): CharacterBuild => ({
  characterName: character.name,
  playerId,
  talentLevels: {
    normalAttack: 1,
    elementalSkill: 1,
    elementalBurst: 1
  },
  constellation: 0,
  level: 1,
  ascension: 0,
  artifacts: new Array(5),
  weapon: {
    name: WEAPONS.find(w => w.type === character.weaponType && w.rarity === 1).name,
    level: 1, ascension: 0, refinement: 1
  }
});

const calculateStats = (build: CharacterBuild): BuildStats => {
  const character = getCharacter(build.characterName);
  const initial = { "ER": 100, "CR": 5, "CD": 50};
  const baseStats = character.stats[build.ascension][build.level];
  const artStats = build.artifacts.map(art => ArtifactService.getStats(art));
  const artBonusStats = ArtifactService.getBonusStats(build.artifacts);
  const weaponStats = calculateWeaponStats(build.weapon);

  const stats = {};
  [initial, baseStats, ...artStats, ...artBonusStats, weaponStats].forEach(s =>
    Object.keys(s).forEach(statName => stats[statName] = (stats[statName] || 0) + s[statName]));

  if (stats["HP%"]) stats["HP"] += baseStats["HP"] * (stats["HP%"] / 100);
  if (stats["DEF%"]) stats["DEF"] += baseStats["DEF"] * (stats["DEF%"] / 100);
  if (stats["ATK%"]) stats["ATK"] += (baseStats["ATK"] + weaponStats["ATK"]) * (stats["ATK%"] / 100);

  return stats;
}

const validateLevelAscension = (o: CharacterBuild | Weapon) => {
  if (o.level && !o.ascension) {
    o.ascension = ascensionLevelMap.findIndex(a => a.includes(o.level));
  } else if (!o.level && o.ascension) {
    o.level = ascensionLevelMap[o.ascension][0] as WeaponLevel;
  } else if (o.level && o.ascension && !ascensionLevelMap[o.ascension].includes(o.level)) {
    throw new Error(`Invalid level-ascension (level=${o.level}, ascension=${o.ascension})`);
  }
};

const calculateWeaponStats = (weapon: Weapon): BuildStats => {
  const weaponModel = WEAPONS.find(w => w.name === weapon.name);
  const stats = {};
  stats["ATK"] = SCALING_STATS
      [weaponModel.rarity-1]
      .find(s => s[0][0] === weaponModel.baseAtk)
      [weapon.ascension]
      [ascensionLevelMap[weapon.ascension].findIndex(l => l === weapon.level)];
  stats[weaponModel.substat.type] = SCALING_SUBSTATS[weaponModel.substat.base][Math.floor(weapon.level / 5)];
  return stats;
}

export {
  getCharacter,
  createDefault,
  calculateStats,
  validateLevelAscension,
  calculateWeaponStats
}