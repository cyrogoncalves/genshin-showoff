import { build } from './mock/mock';
import { WeaponService } from './weapon.service';

describe('WeaponService', () => {
  describe('calculateStats', () => {
    it('works', () => {
      const stats = WeaponService.calculateStats(build.weapon);
      expect(stats.ATK).toBe(674);
      expect(stats.ER).toBe(36.8);
    })
  });
});
