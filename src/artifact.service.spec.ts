import { ArtifactService } from './artifact.service';
import { Artifact } from './model';

const godlyArtifact: Artifact = {
  set: 'Crimson', // Crimson Witch of Flames
  // exp: 270475,
  level: 20,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {
    'CR': 15.6,
    'CD': 23.4,
    'ATK%': 5.8,
    'ER': 6.5
  }
};

describe('ArtifactService', () => {
  describe('Possible combinations', () => {
    it('For 1 Roll on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 1);
      expect(possibleSums).toEqual([[0], [1], [2], [3]]);
    })

    it('For 2 Rolls on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 2);
      console.log(possibleSums);
      expect(possibleSums).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3]]);
    });

    it('For 3 Rolls on 5*', () => {
      const possibleSums = ArtifactService.possibleCombinations(4, 3);
      console.log(possibleSums);
      expect(possibleSums).toEqual([
        [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 1, 1], [0, 1, 2], [0, 1, 3], [0, 2, 2], [0, 2, 3], [0, 3, 3],
        [1, 1, 1], [1, 1, 2], [1, 1, 3], [1, 2, 2], [1, 2, 3], [1, 3, 3],
        [2, 2, 2], [2, 2, 3], [2, 3, 3],
        [3, 3, 3]]);
    });
  });

  describe("estimate substat rolls", () => {
    it('for ER:6.5%', () => {
      const estimate = ArtifactService.estimateSubstatRolls('ER', 6.5);
      expect(estimate).toEqual([3])
    });

    it('for CD:23.4%', () => {
      const estimate = ArtifactService.estimateSubstatRolls('CD', 23.4);
      expect(estimate).toEqual([3, 3, 3])
    });

    it('for CR:15.6%', () => {
      const estimate = ArtifactService.estimateSubstatRolls('CR', 15.6);
      expect(estimate).toEqual([3, 3, 3, 3])
    });

    it("for artifact", () => {
      const estimate = ArtifactService.estimateRolls(godlyArtifact);
      expect(estimate).toEqual([[3, 3, 3, 3], [3, 3, 3], [3], [3]]);
    });
  });
});

