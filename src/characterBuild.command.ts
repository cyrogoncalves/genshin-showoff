import * as Discord from 'discord.js';
import { CharacterBuild, StatType } from './model';

const ShowoffEmoji = {
  CD: "<:CD:814498047815319603>",
  ATK: "<:ATK:814500273455759390>",
  DEF: "<:DEF:814500273497047070>",
  ER: "<:ER:814500273585913888>",
  HP: "<:HP:814500273586307072>",
  EM: "<:EM:814500273644371988>",
  CR: "<:CR:814500533603008522>",
  ascension00: "<:ascension00:814957356860964926>",
  ascension11: "<:ascension11:814957356881674250>",
  ascension10: "<:ascension10:814957356886523975>",
  roll1: "<:roll1:814989225224175674>",
  roll2: "<:roll2:814989224796356639>",
  roll3: "<:roll3:814989225090744360>",
  roll4: "<:roll4:814989225132032070>",
  cryo: "<:cryo:814600347363704903>",
  pyro: "<:pyro:814600347481931797>",
  electro: "<:electro:814600347506180117>",
  anemo: "<:anemo:814601970307694643>",
  geo: "<:geo:814601970617811015>",
  hydro: "<:hydro:814603195514748979>",
  catalyst: "<:catalyst:814603787431313471>",
  bow: "<:bow:814603787817320508>",
  polearm: "<:polearm:814603788542672907>",
  claymore: "<:claymore:814603788907708506>",
  sword: "<:sword:814603788932874263>",
  "Flower": ":sunflower:",
}

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

      .addField(`${ShowoffEmoji[build.weapon.type]} ${build.weapon.name} R${build.weapon.refinement}`,
          `(level ${build.weapon.level}/${ascensionMaxLevels[build.weapon.ascension - 1]} ${getAscensionEmotes(build.weapon.ascension).join("")})\n${ShowoffEmoji.ATK} ${weaponAttack} ${ShowoffEmoji[build.weapon.substat.type]} +${getStatLabel(build.weapon.substat.type, weaponSubstatValue)}`, true)
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