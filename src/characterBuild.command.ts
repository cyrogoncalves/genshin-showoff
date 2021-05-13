import * as Discord from 'discord.js';
import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as WEAPONS from '../assets/weapons.json';
import * as ARTIFACTS from "../assets/artifacts.json";
import {
  CharacterBuild,
  Level,
  levelValues, mainStatNames,
  StatType,
  subStatNames,
  WeaponLevel,
  weaponLevelValues,
  WeaponModel
} from './model';
import { CharacterBuildService } from './characterBuild.service';
import { WeaponService } from './weapon.service';
import { ArtifactService } from './artifact.service';
import { capitalize, guard, match } from './util';
import { getUsername } from './discord-util';
import { db } from './mongodb';

const statLabelMap = {
  'Pyro DMG': "pyro", 'Hydro DMG': "hydro", 'Electro DMG': "electro", 'Cryo DMG': "cryo",
  'Anemo DMG': "anemo", 'Geo DMG': "geo", 'Physical DMG': "ATK", 'Healing': "HP",
  "ATK%": "ATK", "HP%": "HP", "DEF%": "DEF"
};

const getAscensionEmotes = (ascension: number): string => {
  return [
    ascension === 0 ? ShowoffEmoji.ascension00 : ascension === 1 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 3 ? ShowoffEmoji.ascension00 : ascension < 4 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
    ascension < 5 ? ShowoffEmoji.ascension00 : ascension < 6 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
  ].join("");
}

const getStatDisplay = (statType: StatType, value: number, showName = false): string => {
  const displayValue2 = ['HP', 'DEF', 'ATK', 'EM'].includes(statType)
      ? Math.round(value) : `${Math.round(value * 10 || 0) / 10}%`;
  const emote = ShowoffEmoji[statLabelMap[statType] || statType] || statType;
  return `${emote} ${showName ? `**${statType}:**` : ""} ${displayValue2}`;
}

const parseBuild = (args: string[], mode = "Build"): Partial<CharacterBuild> => {
  const modes = ["weapon", "flower", "plume", "sands", "goblet", "circlet"];
  const updates: Partial<CharacterBuild> = {};
  for (let arg of args.slice(1)) {
    if (modes.includes(arg.toLowerCase())) {
      mode = capitalize(arg);
      continue;
    }

    switch (mode) {
      case "Build":
        if (arg.match(/C\d/)) {
          const constellation = Number(arg.slice(1));
          if (constellation < 0 || constellation > 6)
            throw Error("Invalid constellation");
          updates.constellation = constellation;
        } else if (arg.startsWith("level=")) {
          const level = Number(arg.slice(6));
          if (!guard<Level>(levelValues, level))
            throw Error("Invalid level");
          updates.level = level;
        } else if (arg.startsWith("ascension=")) {
          const ascension = Number(arg.slice(10));
          if (ascension < 0 || ascension > 6)
            throw Error("Invalid ascension");
          updates.weapon.ascension = ascension;
        } else if (arg.startsWith("talents=")) {
          if (!arg.match(/^talents=\d+,\d+,\d+$/))
            throw Error("Invalid talents (must be like 'talents=7,7,8')");
          const talents = arg.slice(8).split(",").map(s => Number(s));
          updates.talentLevels = {
            normalAttack: talents[0],
            elementalSkill: talents[1],
            elementalBurst: talents[2]
          };
        }
        break;
      case "Weapon":
        if (!updates.weapon) {
          updates.weapon = {name: null, level:90, ascension:6, refinement:1};
        }

        if (arg.startsWith("level=")) {
          const level = Number(arg.slice(6));
          if (!guard<WeaponLevel>(weaponLevelValues, level))
            throw Error("Invalid weapon level");
          updates.weapon.level = level;
        } else if (arg.startsWith("ascension=")) {
          const ascension = Number(arg.slice(10));
          if (ascension < 0 || ascension > 6)
            throw Error("Invalid weapon ascension");
          updates.weapon.ascension = ascension;
        } else if (arg.match(/R\d/)) {
          const refinement = Number(arg.slice(1));
          if (refinement < 1 || refinement > 5)
            throw Error("Invalid weapon refinement");
          updates.weapon.refinement = refinement;
        } else { // name
          const modelName = match(arg, WEAPONS.map(w => w.name));
          if (!modelName)
            throw Error(`Invalid weapon name: ${arg}`);
          updates.weapon.name = modelName;
        }
        break;
      case "Flower":
      case "Plume":
      case "Sands":
      case "Goblet":
      case "Circlet":
        if (!updates.artifacts) {
          updates.artifacts = [];
        }

        let art = updates.artifacts.find(a => a.type === mode);
        if (!art) {
          art = {set:null, level:20, rarity:5, type: mode, subStats:{},
            mainStat: mode === 'Flower' ? "HP" : mode === "Plume" ? "ATK" : null};
          updates.artifacts.push(art);
        }
        const mainStat = match(arg, mainStatNames);
        const setName = match(arg, Object.keys(ARTIFACTS.sets));
        if (mainStat) {
          art.mainStat = mainStat;
        } else if (setName) {
          art.set = setName;
        } else if (arg.startsWith("level=")) {
          const level = Number(arg.slice(6));
          if (level < 0 || level > 20)
            throw Error(`Invalid ${mode} level`);
          art.level = level;
        } else if (arg.startsWith("rarity=")) {
          const rarity = Number(arg.slice(7));
          if (rarity < 0 || rarity > 5)
            throw Error(`Invalid ${mode} rarity`);
          art.rarity = rarity;
        } else { // subStat
          const [subStat, value] = arg.split("=");
          const subStatName = match(subStat, subStatNames);
          if (!subStatName || isNaN(value as any))
            throw Error(`Invalid ${mode} subStat ${arg}`);
          art.subStats[subStatName] = Number(value);
        }
        break;
    }

    // TODO validations (level-ascension)
  }
  return updates;
}

const exe = async (message: Discord.Message, args: string[]) => {
  const characterName = capitalize(args[0]?.replace("_", ""));
  if (!CharacterBuildService.getCharacter(characterName)) return;

  const playerId = message.author.id;
  const collection = db.collection<CharacterBuild>("builds");
  let build = await collection.findOne({playerId, characterName});
  // TODO if doesn't exist create it with default values
  const updates = parseBuild(args);
  if (Object.keys(updates).length) { // edit
    await collection.updateOne({playerId, characterName}, {$set: updates});
  }

  const embed = createEmbed(build);
  embed.setAuthor(getUsername(message), message.author.avatarURL())
      .setThumbnail("attachment://char.png")
  await message.channel.send({
    embed,
    files: [{
      attachment:'assets/noelle-avatar.png', // TODO
      name:'char.png'
    }]
  });
}

const createEmbed = (build: CharacterBuild): Discord.MessageEmbed => {
  const character = CharacterBuildService.getCharacter(build.characterName);
  const embed = new Discord.MessageEmbed().setColor('#ffbf00')
      .setTitle(`${ShowoffEmoji[character.element.toLowerCase()] || ""} ${character.name} C${build.constellation}`);

  const buildStats = CharacterBuildService.calculateStats(build);
  const extraStatKeys = Object.entries(buildStats).filter(([k]) => !subStatNames.includes(k));
  embed.addField(`(level ${build.level} ${getAscensionEmotes(build.ascension)})`,
      ["HP", "ATK", "DEF", "EM"].map(s => getStatDisplay(s, buildStats[s], true)).join("\n"), true);
  embed.addField("\u200B", [
    `${ShowoffEmoji.ER} **ER:** ${Math.round(buildStats["ER"] * 10 || 0) / 10}%`,
    `${ShowoffEmoji.CR} **Crit Rate:** ${Math.round(buildStats["CR"] * 10 || 0) / 10}%`,
    `${ShowoffEmoji.CD} **Crit DMG:** ${Math.round(buildStats["CD"] * 10 || 0) / 10}%`,
    ...extraStatKeys.map(([k, v]) => getStatDisplay(k, v, true))
  ].join("\n"), true)
  embed.addField("Talents:", [
    `Normal attack: ${build.talentLevels.normalAttack}`,
    `Elemental skill: ${build.talentLevels.elementalSkill}`,
    `Elemental burst: ${build.talentLevels.elementalBurst}`
  ].join("\n"), true);

  const weaponModel = WEAPONS.find(w => w.name === build.weapon.name) as WeaponModel;
  const weaponTypeEmote = ShowoffEmoji[weaponModel.type.toLowerCase()];
  const weaponStats = WeaponService.calculateStats(build.weapon);
  const ascension = getAscensionEmotes(build.weapon.ascension);
  const weaponAtk = `${ShowoffEmoji.ATK} **ATK:** ${weaponStats["ATK"]}`;
  const substat = Object.entries(weaponStats).filter(([k]) => k !== "ATK")
      .map(([k, v]) => getStatDisplay(k, v, true)).join("\n");
  embed.addField(`${weaponTypeEmote} ${weaponModel.name} R${build.weapon.refinement}`,
      `(level ${build.weapon.level} ${ascension})\n${weaponAtk}\n${substat}`, true);

  build.artifacts.forEach(art => {
    const title = `${ShowoffEmoji[art.type]} ${art.set}`;
    const desc = `**+${art.level} ${getStatDisplay(art.mainStat, ArtifactService.getMainStatValue(art))}**`
    const substats = Object.entries(art.subStats).map(([k, v]) => {
      const rolls = ArtifactService.estimateSubstatRolls(k, v, art.rarity).map(i => ShowoffEmoji[`roll${i+1}`])
      return `${getStatDisplay(k, v)} ${rolls.reverse().join("")}`;
    }).join('\n');
    embed.addField(title, `${desc}\n${substats}`, true);
  });

  return embed;
};

export const CharacterBuildCommand = {
  createEmbed,
  parseBuild,
  exe
}