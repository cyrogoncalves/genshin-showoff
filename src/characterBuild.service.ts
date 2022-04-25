import * as CHARACTERS from "../assets/characters.json";
import * as WEAPONS from '../assets/weapons.json';
import * as ARTIFACTS from "../assets/artifacts.json";
import { Artifact, BuildStats, Character, CharacterBuild, StatType, Weapon, WeaponModel } from './model';
import { groupBy } from "./util";

export const getCharacter = (name: string): Character => CHARACTERS.find(c => c.name === name) as Character;

export const createDefault = (character: Character, playerId: string): CharacterBuild => ({
  characterName: character.name,
  playerId,
  talentLevels: { normalAttack: 1, elementalSkill: 1, elementalBurst: 1 },
  constellation: 0,
  level: 1,
  ascension: 0,
  artifacts: new Array(5),
  weapon: {
    name: WEAPONS.models.find(w => w.type === character.weaponType && w.rarity === 1).name,
    level: 1, ascension: 0, refinement: 1
  }
});

export const calculateStats = (build: CharacterBuild): BuildStats => {
  const character = getCharacter(build.characterName);
  const weapon = calculateWeaponStats(build.weapon);
  const baseStats = { ...character.stats[build.ascension][build.level] }; // HP, ATK, DEF
  baseStats["ATK"] += weapon.atk;

  const s100 = { "HP%": "HP", "ATK%": "ATK", "DEF%": "DEF" };
  return [
    { [character.substat.type] : character.substat.values[build.ascension] } as BuildStats,
    { [weapon.substat.type]: weapon.substat.value } as BuildStats,
    ...build.artifacts.map(art => getArtifactStats(art)),
    ...getArtifactBonusStats(build.artifacts)
  ].reduce((stats, s) => {
    Object.entries(s).forEach(([statName, value]) =>
        s100[statName] ? stats[s100[statName]] += value / 100 * baseStats[s100[statName]]
            : stats[statName] = (stats[statName] || 0) + value);
    return stats;
  }, { ...baseStats, "EM": 0, "CR": 5, "CD": 50, "ER": 100 });
}

export const calculateWeaponStats = (weapon: Weapon): { atk:number, substat: { type:StatType, value:number } } => {
  const weaponModel = WEAPONS.models.find(w => w.name === weapon.name) as WeaponModel;
  return {
    atk: WEAPONS.scalingStats[weaponModel.rarity - 1][weaponModel.baseAtk][weapon.ascension][weapon.level],
    substat: {
      value: WEAPONS.scalingSubstats[weaponModel.substat.base][Math.floor(weapon.level / 5)],
      type: weaponModel.substat.type as StatType
    }
  };
}

export const getMainStatValue = (art: Artifact): number => {
  const scalingStat = art.mainStat.replace(/Pyro|Hydro|Electro|Anemo|Cryo|Geo/, 'Elemental');
  return ARTIFACTS.scalingStats[art.rarity - 1][scalingStat][art.level]
}

const getArtifactStats = (art: Artifact): BuildStats =>
    !art ? {} : {...art.subStats, [art.mainStat]: getMainStatValue(art)};

const getArtifactBonusStats = (artifacts: Artifact[]): BuildStats[] =>
    Object.entries(groupBy(artifacts, art => art.set))
        .filter(([_, arts]) => arts.length >= 2)
        .map(([setName]) => ARTIFACTS.sets[setName]?.twoPieceBonus ?? {});
