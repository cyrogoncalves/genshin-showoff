import * as ARTIFACTS from "../assets/artifacts.json";
import { Artifact, BuildStats } from './model';

const possibleCombinations = (possibleRollsCount: number, count: number, num: number = 0): number[][] => {
  const array = [];
  for (let i = num; i < possibleRollsCount; i++) {
    if (count === 1)
      array.push([i]);
    else {
      const rec = possibleCombinations(possibleRollsCount, count-1, i);
      array.push(...rec.map(rec => [i, ...rec]));
    }
  }
  return array;
};

const estimateSubstatRolls = (type: string, value: number, rarity = 5) => {
  const possibleRolls = ARTIFACTS.rolls[type][rarity - 1];
  let approx = null;
  for (let count = 1; count < 6; count++) {
    for (let combination of possibleCombinations(possibleRolls.length, count)) {
      const rollSum = combination.reduce((sum, i) => sum + possibleRolls[i], 0);
      const diff = Math.abs(value - rollSum);
      if (!approx || diff < approx.diff)
        approx = { diff, combination };
    }
  }
  return approx.combination;
};

const getMainStatValue = (art: Artifact): number => {
  const scalingStat = art.mainStat.replace(/Pyro|Hydro|Electro|Anemo|Cryo|Geo/, 'Elemental');
  return ARTIFACTS.scalingStats[art.rarity - 1][scalingStat][art.level]
}

const getStats = (art: Artifact): BuildStats => {
  if (!art) return {};
  const stats = { ...art.subStats };
  stats[art.mainStat] = getMainStatValue(art);
  return stats;
}

const getBonusStats = (artifacts: Artifact[]): BuildStats[] => {
  const setCount = {};
  artifacts.forEach(art => setCount[art.set] = (setCount[art.set] || 0) + 1);
  return Object.keys(setCount).filter(key => setCount[key] >= 2)
      .map(key => ARTIFACTS.sets[key]?.twoPieceBonus).filter(s => s);
}

export const ArtifactService = {
  possibleCombinations,
  estimateSubstatRolls,
  getMainStatValue,
  getStats,
  getBonusStats
}
