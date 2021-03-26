import * as CHARACTERS from "../assets/characters.json";
import { BuildStats, Character, CharacterBuild } from './model';
import { WeaponService } from './weapon.service';
import { ArtifactService } from './artifact.service';

const getCharacter = (name: string): Character => CHARACTERS.find(c => c.name === name) as Character;

const calculateStats = (build: CharacterBuild): BuildStats => {
  const character = getCharacter(build.characterName);
  const baseStats = character.stats[build.ascension][build.level];
  const artStats = build.artifacts.map(art => ArtifactService.getStats(art));
  const artBonusStats = ArtifactService.getBonusStats(build.artifacts);
  const weaponStats = WeaponService.calculateStats(build.weapon);

  const stats = {};
  [baseStats, ...artStats, ...artBonusStats, weaponStats].forEach(s =>
    Object.keys(s).forEach(statName => stats[statName] = (stats[statName] || 0) + s[statName]));

  stats["HP"] += baseStats["HP"] * (stats["HP%"] / 100);
  stats["DEF"] += baseStats["DEF"] * (stats["DEF%"] / 100);
  stats["ATK"] += (baseStats["ATK"] + weaponStats["ATK"]) * (stats["ATK%"] / 100);

  return stats;
}

export const CharacterBuildService = {
  getCharacter,
  calculateStats
}