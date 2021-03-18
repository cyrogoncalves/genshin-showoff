import { CharacterBuildService } from './characterBuild.service';
import { build } from "./mock/mock";

describe('CharacterBuildService', () => {
  it('calculateStats', () => {
    const stats = CharacterBuildService.calculateStats(build);
    expect(Math.floor(stats.HP)).toBe(16501);
    expect(Math.floor(stats.DEF)).toBe(1766);
  });
});