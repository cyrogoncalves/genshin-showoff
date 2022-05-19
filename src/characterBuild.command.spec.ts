import * as CharacterBuildCommand from "./characterBuild.command";
import { build } from "./mock/mock";
import { build as build2 } from "./mock/mock2";

const input = `childe talents=5,10,9 level=90
weapon viridescent
flower maiden em=40 cd=7 atk%=9.3 cr=12.1
plume depth def=16 cd=5.4 hp=478 cr=14
sands gladiator atk% cd=29.5 cr=7.4 hp=299 atk=16
goblet blizzard hydro cr=7.8 atk=18 hp=508 cd=22.5
circlet depth cd em=21 cr=12.1 def=37 atk%=4.1`;

describe('CharacterBuildCommand', () => {
  describe("parseBuild", () => {
    const { updates } = CharacterBuildCommand.parseBuild(input.split(/\s+|\n/), build2);
    expect(updates).toMatchObject(build2);
  });

  describe('createEmbed', () => {
    it('works', () => {
      const embed = CharacterBuildCommand.createEmbed(build);
      expect(embed).toBeTruthy();
      expect(embed.title).toBe("<:geo:814601970617811015> Noelle C6 ★★★★");

      expect(embed.fields[0].name).toBe("LV80 ✦✦✦✦✦✧");
      expect(embed.fields[0].value).toMatch(/<:HP:\d+> \*\*HP:\*\* \d+\n<:ATK:\d+> \*\*ATK:\*\* \d+\n<:DEF:\d+> \*\*DEF:\*\* \d+\n<:EM:\d+> \*\*EM:\*\* \d+/);
      expect(embed.fields[1].name).toBe("Talents:");
      expect(embed.fields[1].value).toMatch(/^Normal attack: 1\nElemental skill: 1 \(\+3\)\nElemental burst: 9 \(\+3\)\n\n\*\*<:claymore:\d+> Skyward Pride R1\*\*\n\(level 90 <:ascension11:\d+><:ascension11:\d+><:ascension11:\d+>\)\n<:ATK:\d+> \*\*ATK:\*\* 674\n<:ER:\d+> \*\*ER:\*\* 36.8%/);
    });
  });
});
