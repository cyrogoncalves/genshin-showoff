import { ArtifactService } from './artifact.service';
import { build } from "./mock/mock";

describe('ArtifactService', () => {
  describe('Possible combinations', () => {
    it('For 1 Roll on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 1);
      expect(possibleSums).toEqual([[0], [1], [2], [3]]);
    })

    it('For 2 Rolls on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 2);
      expect(possibleSums).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3]]);
    });

    it('For 3 Rolls on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 3);
      expect(possibleSums).toEqual([
        [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 1, 1], [0, 1, 2], [0, 1, 3], [0, 2, 2], [0, 2, 3], [0, 3, 3],
        [1, 1, 1], [1, 1, 2], [1, 1, 3], [1, 2, 2], [1, 2, 3], [1, 3, 3],
        [2, 2, 2], [2, 2, 3], [2, 3, 3],
        [3, 3, 3]]);
    });
  });

  describe("estimate substat rolls", () => {
    const f = ArtifactService.estimateSubstatRolls;
    it('for ER:6.5%', () => expect(f('ER', 6.5)).toEqual([3]));
    it('for ER:11.7%', () => expect(f('ER', 11.7)).toEqual([1, 3]));
    it('for ER:16.2%', () => expect(f('ER', 16.2)).toEqual([0, 1, 3]));

    it('for CD:10.9%', () => expect(f('CD', 10.9)).toEqual([0, 0]));
    it('for CD:20.2%', () => expect(f('CD', 20.2)).toEqual([1, 2, 2]));
    it('for CD:23.3%', () => expect(f('CD', 23.3)).toEqual([3, 3, 3])); //
    it('for CD:27.2%', () => expect(f('CD', 27.2)).toEqual([1, 2, 2, 2]));
    it('for CD:28.0%', () => expect(f('CD', 28)).toEqual([2, 2, 2, 2]));
    it('for CD:33.4%', () => expect(f('CD', 33.4)).toEqual([0, 2, 2, 2, 2]));

    it('for CR:10.5%', () => expect(f('CR', 10.5)).toEqual([0, 3, 3]));
    it('for CR:15.6%', () => expect(f('CR', 15.6)).toEqual([3, 3, 3, 3])); //
  });

  describe("get main stat", () => {
    it("calculates main stat value", () => {
      const value = ArtifactService.getMainStatValue(build.artifacts[0]);
      expect(value).toBe(3967);
    });
  });

  describe("get stats", () => {
    it("returns empty object for null artifact", () => {
      const stats = ArtifactService.getStats(null);
      expect(stats).toEqual({});
    });

    it("gathers stats from artifact", () => {
      const stats = ArtifactService.getStats(build.artifacts[0]);
      expect(stats).toEqual({'HP': 3967, 'HP%': 4.7, 'ATK': 27, 'DEF%': 7.25, 'ATK%': 14});
    });
  });

  describe("get bonus stats", () => {
    it("get bonus from Defender's will", () => {
      const bonusStats = ArtifactService.getBonusStats(build.artifacts)
      expect(bonusStats).toEqual([{"Geo DMG": 15}, {'DEF%': 30}]);
    });
  });
});
