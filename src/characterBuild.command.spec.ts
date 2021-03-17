import { CharacterBuildCommand } from "./characterBuild.command";
import { build } from "./mock/mock";
import * as Discord from 'discord.js';

const mockMessage = {
  channel: {
    send: (
        content: Discord.APIMessageContentResolvable | (Discord.MessageOptions & { split?: false }) | Discord.MessageAdditions,
    ): Promise<Discord.Message> => null,
    guild: {
      members: {
        cache: new Discord.Collection<Discord.Snowflake, Discord.GuildMember>([["id", { nickname: "nickname"} as Discord.GuildMember]])
      }
    }
  },
  author: {
    id: "id",
    username: "username",
    avatarURL: () => "avatarURL"
  }
} as Discord.Message;

describe('CharacterBuildCommand', () => {
  describe('createEmbed', () => {
    it('works', () => {
      const embed = CharacterBuildCommand.createEmbed(mockMessage, build);
      expect(embed).toBeTruthy();
      expect(embed.author.name).toBe("nickname");
      expect(embed.author.iconURL).toBe("avatarURL");
      expect(embed.thumbnail).toEqual({"url": "attachment://char.png"});
      expect(embed.title).toBe("<:geo:814601970617811015> Noelle C6");

      // .addField(`Stats:`, `${ShowoffEmoji.HP} **HP:** 3000\n${ShowoffEmoji.ATK} **ATK:** 311\n${ShowoffEmoji.DEF} **DEF:** 800\n${ShowoffEmoji.EM} **EM:** 80`, true)
      // .addField(`(lvl 50/60 ${ShowoffEmoji.ascension11}${ShowoffEmoji.ascension10}${ShowoffEmoji.ascension00})`, `${ShowoffEmoji.ER} **ER:** 160%\n${ShowoffEmoji.CR} **Crit Rate:** 14,1%\n${ShowoffEmoji.CD} **Crit DMG:** 106,6%\n${ShowoffEmoji.geo} **Geo DMG:** +46,6%`, true)
      expect(embed.fields[0].name).toBe("Stats:")
      expect(embed.fields[0].value).toMatch(/<:HP:\d+> \*\*HP:\*\* \d+\n<:ATK:\d+> \*\*ATK:\*\* \d+\n<:DEF:\d+> \*\*DEF:\*\* \d+\n<:EM:\d+> \*\*EM:\*\* \d+/);
      expect(embed.fields[0].value).toBe([
        "${ShowoffEmoji.HP} **HP:** 3000",
        "${ShowoffEmoji.ATK} **ATK:** 311",
        "${ShowoffEmoji.DEF} **DEF:** 800",
        "${ShowoffEmoji.EM} **EM:** 80"
      ].join("\n"));
    })
  });
});
