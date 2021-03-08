import { Artifact } from './model';

const rolls = {
  "HP": [[24, 30], [50, 61, 72], [100, 115, 129, 143], [167, 191, 215, 239], [209, 239, 269, 299]],
  "ATK": [[2, 2], [3, 4, 5], [7, 7, 8, 9], [11, 12, 14, 16], [14, 16, 18, 19]],
  "DEF": [[2, 2], [4, 5, 6], [8, 9, 10, 11], [13, 15, 17, 19], [16, 19, 21, 23]],
  "HP%": [[1.2, 1.5], [1.6, 2, 2.3], [2.5, 2.8, 3.2, 3.5], [3.3, 3.7, 4.2, 4.7], [4.1, 4.7, 5.3, 5.8]],
  "ATK%": [[1.2, 1.5], [1.6, 2, 2.3], [2.5, 2.8, 3.2, 3.5], [3.3, 3.7, 4.2, 4.7], [4.1, 4.7, 5.3, 5.8]],
  "DEF%": [[1.5, 1.8], [2, 2.5, 2.9], [3.1, 3.5, 3.9, 4.4], [4.1, 4.7, 5.3, 5.8], [5.1, 5.8, 6.6, 7.3]],
  "EM": [[5, 6], [7, 8, 9], [10, 11, 13, 14], [13, 15, 17, 19], [16, 19, 21, 23]],
  "ER": [[1.3, 1.6], [1.8, 2.2, 2.6], [2.7, 3.1, 3.5, 3.9], [3.6, 4.1, 4.7, 5.2], [4.5, 5.2, 5.8, 6.5]],
  "CR": [[0.8, 1.0], [1.1, 1.3, 1.6], [1.6, 1.9, 2.1, 2.3], [2.2, 2.5, 2.8, 3.1], [2.7, 3.1, 3.5, 3.9]],
  "CD": [[1.6, 1.9], [2.2, 2.6, 3.1], [3.3, 3.7, 4.2, 4.7], [4.4, 5, 5.6, 6.2], [5.4, 6.2, 7, 7.8]],
}

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
  for (let count = 1; count < 5; count++) {
    const combinations = possibleCombinations(rolls[type][rarity-1].length, count);
    const matchedCombination = combinations.find(c => c.reduce((sum, i) => sum + rolls[type][rarity-1][i], 0) === value);
    if (matchedCombination)
      return matchedCombination;
  }
  return null;
};

const estimateRolls = (art: Artifact): number[][] => {
  return Object.keys(art.subStats).map(type =>  estimateSubstatRolls(type, art.subStats[type], art.rarity));
};

export const ArtifactService = {
  possibleCombinations,
  estimateSubstatRolls,
  estimateRolls
}
