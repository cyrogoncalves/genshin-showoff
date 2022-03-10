import {calculateStats, getCharacter, calculateWeaponStats} from './characterBuild.service';
import { build } from "./mock/mock";

describe('CharacterBuildService', () => {
  it('calculateStats', () => {
    const stats = calculateStats(build);
    expect(Math.floor(stats.HP)).toBe(16501);
    expect(Math.floor(stats.DEF)).toBe(1766);
    expect(Math.round(stats.ATK)).toBe(1500); // 1501
  });

  describe("getCharacter", () => {
    it("gets character data", () => {
      const character = getCharacter("Ganyu");
      expect(character.element).toBe("Cryo");
    });
  });
});

describe('WeaponService', () => {
  describe('calculateStats', () => {
    it('works', () => {
      const stats = calculateWeaponStats(build.weapon);
      expect(stats.atk).toBe(674);
      expect(stats.substat.type).toBe("ER");
      expect(stats.substat.value).toBe(36.8);
    })
  });
});
