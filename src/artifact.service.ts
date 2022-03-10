import * as ARTIFACTS from "../assets/artifacts.json";

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

export const ArtifactService = {
  possibleCombinations,
  estimateSubstatRolls
}
