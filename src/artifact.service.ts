import * as ARTIFACT_SCALING_STATS from "../assets/artifactScalingStats.json";
import * as ARTIFACT_SET_BONUSES from "../assets/artifactSetBonuses.json";
import * as ARTIFACT_ROLLS from "../assets/artifactRolls.json";
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
  const possibleRolls = ARTIFACT_ROLLS[type][rarity - 1];
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

const getStats = (art: Artifact): BuildStats => {
  if (!art) return {};
  const stats = { ...art.subStats };
  const scalingStat = art.mainStat.replace(/Pyro|Hydro|Electro|Anemo|Cryo|Geo/, 'Elemental');
  stats[art.mainStat] = ARTIFACT_SCALING_STATS[art.rarity - 1][scalingStat][art.level];
  return stats;
}

const getBonusStats = (artifacts: Artifact[]): BuildStats[] => {
  const setCount = {};
  artifacts.forEach(art => setCount[art.set] = (setCount[art.set] || 0) + 1);
  return Object.keys(setCount).filter(key => setCount[key] >= 2)
      .map(key => ARTIFACT_SET_BONUSES.twoPieceBonus[key]).filter(s => s);
}

export const ArtifactService = {
  possibleCombinations,
  estimateSubstatRolls,
  getStats,
  getBonusStats
}
