import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as Discord from 'discord.js';
import { CharacterBuild, StatType } from './model';

const ascensionMaxLevels = [20, 40, 50, 60, 70, 80, 90];

const getAscensionEmotes = (ascension: number): string[] /* ShowoffEmoji[] */ => {
  return [
    ascension === 0 ? ShowoffEmoji.ascension00 : ascension === 1 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 3 ? ShowoffEmoji.ascension00 : ascension < 4 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 5 ? ShowoffEmoji.ascension00 : ascension < 6 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
  ];
}

const getStatLabel = (statType: StatType, value: number) => {
  return ['HP', 'DEF', 'ATK', 'EM'].includes(statType) ? value : `${value}%`;
}

const getUsername = (message: Discord.Message) => {
  return (message.channel as Discord.TextChannel).guild.members.cache.get(message.author.id).nickname || message.author.username;
}

const createEmbed = (message: Discord.Message, build: CharacterBuild): Discord.MessageEmbed => {
  const { weaponAttack, weaponSubstatValue } = { weaponAttack: 674, weaponSubstatValue: 30 }; // TODO
  return new Discord.MessageEmbed().setColor('#ffbf00')
      .setAuthor(getUsername(message), message.author.avatarURL())
      .setThumbnail("attachment://char.png")
      .setTitle(`${ShowoffEmoji.geo} ${build.character.name} C${build.constellation}`)

      .addField(`Stats:`, `${ShowoffEmoji.HP} **HP:** 3000\n${ShowoffEmoji.ATK} **ATK:** 311\n${ShowoffEmoji.DEF} **DEF:** 800\n${ShowoffEmoji.EM} **EM:** 80`, true)
      .addField(`(lvl 50/60 ${ShowoffEmoji.ascension11}${ShowoffEmoji.ascension10}${ShowoffEmoji.ascension00})`, `${ShowoffEmoji.ER} **ER:** 160%\n${ShowoffEmoji.CR} **Crit Rate:** 14,1%\n${ShowoffEmoji.CD} **Crit DMG:** 106,6%\n${ShowoffEmoji.geo} **Geo DMG:** +46,6%`, true)

      .addField(`${ShowoffEmoji[build.weapon.model.type]} ${build.weapon.model.name} R${build.weapon.refinement}`,
          `(level ${build.weapon.level}/${ascensionMaxLevels[build.weapon.ascension - 1]} ${getAscensionEmotes(build.weapon.ascension).join("")})\n${ShowoffEmoji.ATK} ${weaponAttack} ${ShowoffEmoji[build.weapon.model.substat.type]} +${getStatLabel(build.weapon.model.substat.type, weaponSubstatValue)}`, true)
      .addField("Talents:", `Normal: ${build.talentLevels.normalAttack}\nElemental: ${build.talentLevels.elementalSkill}\nBurst: ${build.talentLevels.elementalBurst}`, true)

      .addField(":sunflower: Retracting Bolide", [
        `**+20 ${ShowoffEmoji.ATK} 311**`,
        `${ShowoffEmoji.CR} \`+15.6%\` ${ShowoffEmoji.roll2}${ShowoffEmoji.roll3}${ShowoffEmoji.roll4}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.CD} +23.4% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll1}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ATK} +5.8% ${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ER} +6.5% ${ShowoffEmoji.roll3}`,
      ].join('\n'), true)
      .addField(":feather: Retracting Bolide", [
        `**+20 ${ShowoffEmoji.ATK} 311**`,
        `${ShowoffEmoji.CR} +15.6% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll4}`,
        `${ShowoffEmoji.CD} +23.4%${ShowoffEmoji.roll1}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ATK} +5.8%${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ER} +6.5%${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
      ].join('\n'), true)
      .addField(":hourglass: Retracting Bolide", [
        `**+20 ${ShowoffEmoji.ATK} 311**`,
        `${ShowoffEmoji.CR} +15.6% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.CD} +23.4% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ATK} +5.8% ${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ER} +6.5% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
      ].join('\n'), true)
      .addField(":wine_glass: Retracting Bolide", [
        `**+20 ${ShowoffEmoji.ATK} 311**`,
        `${ShowoffEmoji.CR} +15.6% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.CD} +23.4% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ATK} +5.8% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ER} +6.5% ${ShowoffEmoji.roll3}`,
      ].join('\n'), true)
      .addField(":crown: Retracting Bolide", [
        `+20 ${ShowoffEmoji.ATK}**ATK: 311**`,
        `${ShowoffEmoji.CR} +15.6% ${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.CD} +23.4% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ATK} +5.8% ${ShowoffEmoji.roll3}`,
        `${ShowoffEmoji.ER} +6.5% ${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}${ShowoffEmoji.roll3}`,
      ].join('\n'), true);
}

export const CharacterBuildCommand = {
  createEmbed
}