import { BuildStats, Weapon, WeaponType } from './model';
import * as WEAPONS from "../assets/weapons.json";
import * as SCALING_STATS from "../assets/weaponScalingStats.json"
import * as SCALING_SUBSTATS from "../assets/weaponScalingSubstats.json"

const ascensionLevelMap = [
  [1, 5, 10, 15, 20],
  [20, 25, 30, 35, 40],
  [40, 45, 50],
  [50, 55, 60],
  [60, 65, 70],
  [70, 75, 80],
  [80, 85, 90]
];

const createDefault = (type: WeaponType): Weapon => ({
  name: WEAPONS.find(w => w.type === type && w.rarity === 1).name,
  level:1, ascension:0, refinement:1
})

const calculateStats = (weapon: Weapon): BuildStats => {
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

export const WeaponService = {
  calculateStats,
  createDefault
}
