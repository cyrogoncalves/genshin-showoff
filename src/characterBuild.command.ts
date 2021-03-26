import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as Discord from 'discord.js';
import * as WEAPONS from '../assets/weapons.json';
import { CharacterBuild, StatType, subStatNames, WeaponModel } from './model';
import { CharacterBuildService } from './characterBuild.service';
import { WeaponService } from './weapon.service';
import { ArtifactService } from './artifact.service';

const ascensionMaxLevels = [20, 40, 50, 60, 70, 80, 90];

const statLabelMap = { 'Pyro DMG': "pyro", 'Hydro DMG': "hydro", 'Electro DMG': "electro", 'Cryo DMG': "cryo",
  'Anemo DMG': "anemo", 'Geo DMG': "geo", 'Physical DMG': "ATK", 'Healing': "HP",
  "ATK%": "ATK", "HP%": "HP", "DEF%": "DEF" };

const getAscensionEmotes = (ascension: number): string => {
  return [
    ascension === 0 ? ShowoffEmoji.ascension00 : ascension === 1 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 3 ? ShowoffEmoji.ascension00 : ascension < 4 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 5 ? ShowoffEmoji.ascension00 : ascension < 6 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
  ].join("");
}

const getStatDisplay = (statType: StatType, value: number, showName = false): string => {
  const displayValue = Math.floor(value || 0);
  const displayValue2 = ['HP', 'DEF', 'ATK', 'EM'].includes(statType) ? displayValue : `${displayValue}%`
  return `${ShowoffEmoji[statLabelMap[statType]]} ${showName ? `**${statType}:**` : ""} ${displayValue2}`;
}

const getUsername = (message: Discord.Message) => {
  return (message.channel as Discord.TextChannel).guild.members
      .cache.get(message.author.id).nickname || message.author.username;
}

const createEmbed = (message: Discord.Message, build: CharacterBuild): Discord.MessageEmbed => {
  const character = CharacterBuildService.getCharacter(build.characterName);
  const embed = new Discord.MessageEmbed().setColor('#ffbf00')
      .setAuthor(getUsername(message), message.author.avatarURL())
      .setThumbnail("attachment://char.png")
      .setTitle(`${ShowoffEmoji[character.element.toLowerCase()] || ""} ${character.name} C${build.constellation}`);

  const buildStats = CharacterBuildService.calculateStats(build);
  const extraStatKeys = Object.entries(buildStats).filter(([k]) => !subStatNames.includes(k));
  embed.addField(`Stats:`, ["HP", "ATK", "DEF", "EM"].map(s =>
      getStatDisplay(s, buildStats[s], true)).join("\n"), true)
      .addField(`(level ${build.level} ${getAscensionEmotes(build.ascension)})`, [
        `${ShowoffEmoji.ER} **ER:** ${Math.floor(buildStats["ER"])}%`,
        `${ShowoffEmoji.CR} **Crit Rate:** ${Math.floor(buildStats["CR"])}%`,
        `${ShowoffEmoji.CD} **Crit DMG:** ${Math.floor(buildStats["CD"])}%`,
        ...extraStatKeys.map(([k, v]) => getStatDisplay(k, v, true))
      ].join("\n"), true);

  const weaponModel = WEAPONS.find(w => w.name === build.weapon.name) as WeaponModel;
  const weaponStats = WeaponService.calculateStats(build.weapon);
  const weaponLevel = `${build.weapon.level}/${ascensionMaxLevels[build.weapon.ascension - 1]}`;
  const ascension = getAscensionEmotes(build.weapon.ascension);
  const weaponAtk = `${ShowoffEmoji.ATK} ${weaponStats["ATK"]}`;
  const substat = Object.entries(weaponStats).filter(([k]) => k !== "ATK")
      .map(([k, v]) => getStatDisplay(k, v)).join("\n");
  embed.addField(`${ShowoffEmoji[weaponModel.type]} ${weaponModel.name} R${build.weapon.refinement}`,
          `(level ${weaponLevel} ${ascension})\n${weaponAtk} ${substat}`, true);

  embed.addField("Talents:", [
    `Normal attack: ${build.talentLevels.normalAttack}`,
    `Elemental skill: ${build.talentLevels.elementalSkill}`,
    `Elemental burst: ${build.talentLevels.elementalBurst}`
  ].join("\n"), true);

  build.artifacts.forEach(art => {
    const title = `${ShowoffEmoji[art.type]} ${art.set}`;
    const desc = `**+${art.level} ${ShowoffEmoji[art.mainStat]} 311**`
    const substats = Object.entries(art.subStats).map(([k, v]) => {
      const rolls = ArtifactService.estimateSubstatRolls(k, v, art.rarity).map(i => ShowoffEmoji[`roll${i+1}`])
      return `${getStatDisplay(k, v)} ${rolls}`;
    }).join('\n');
    embed.addField(title, `${desc}\n${substats}`, true);
  });

  return embed;
};

export const CharacterBuildCommand = {
  createEmbed
}