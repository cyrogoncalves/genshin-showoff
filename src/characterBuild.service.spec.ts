import { CharacterBuildService } from './characterBuild.service';
import { build } from "./mock/mock";

describe('CharacterBuildService', () => {
  it('calculateStats', () => {
    const stats = CharacterBuildService.calculateStats(build);
    expect(Math.floor(stats.HP)).toEqual(16501);
    // expect(stats.DEF).toEqual(1766);
  });
});