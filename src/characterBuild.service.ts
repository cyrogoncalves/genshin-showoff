import * as CHARACTERS from "../assets/characters.json";
import { BuildStats, Character, CharacterBuild } from './model';
import { WeaponService } from './weapon.service';
import { ArtifactService } from './artifact.service';

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
  weapon: WeaponService.createDefault(character.weaponType)
});

const calculateStats = (build: CharacterBuild): BuildStats => {
  const character = getCharacter(build.characterName);
  const initial = { "ER": 100, "CR": 5, "CD": 50};
  const baseStats = character.stats[build.ascension][build.level];
  const artStats = build.artifacts.map(art => ArtifactService.getStats(art));
  const artBonusStats = ArtifactService.getBonusStats(build.artifacts);
  const weaponStats = WeaponService.calculateStats(build.weapon);

  const stats = {};
  [initial, baseStats, ...artStats, ...artBonusStats, weaponStats].forEach(s =>
    Object.keys(s).forEach(statName => stats[statName] = (stats[statName] || 0) + s[statName]));

  stats["HP"] += baseStats["HP"] * (stats["HP%"] / 100);
  stats["DEF"] += baseStats["DEF"] * (stats["DEF%"] / 100);
  stats["ATK"] += (baseStats["ATK"] + weaponStats["ATK"]) * (stats["ATK%"] / 100);

  return stats;
}

export const CharacterBuildService = {
  getCharacter,
  createDefault,
  calculateStats
}