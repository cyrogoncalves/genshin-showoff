import * as Discord from 'discord.js';
import { MessageEmbed } from 'discord.js';
import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as WEAPONS from '../assets/weapons.json';
import * as ARTIFACTS from "../assets/artifacts.json";
import * as CHARACTERS from "../assets/characters.json";
import {
  Artifact,
  artifactTypeNames,
  CharacterBuild,
  Level,
  levelValues,
  mainStatNames,
  StatType,
  subStatNames,
  Weapon,
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

const getStatDisplay = (statType: StatType, value: number): string => {
  const displayValue = ['HP', 'DEF', 'ATK', 'EM'].includes(statType)
      ? Math.round(value) : `${Math.round(value * 10 || 0) / 10}%`;
  const emote = ShowoffEmoji[statLabelMap[statType] || statType] || statType;
  return `${emote} **${statType}:** ${displayValue}`;
}

const parseBuild = (args: string[], build: CharacterBuild, mode = "Build"):
    { mode: string; updates: CharacterBuild } => {
  const modes = ["weapon", "flower", "plume", "sands", "goblet", "circlet"];
  let updates: CharacterBuild;
  for (let arg of args.slice(1)) {
    if (modes.includes(arg.toLowerCase())) {
      mode = capitalize(arg);
      continue;
    }

    updates = updates || build;

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
        const idx = artifactTypeNames.indexOf(mode);
        if (!updates.artifacts[idx])
          updates.artifacts[idx] = { set: null, level: 20, rarity: 5, type: mode, subStats: {},
            mainStat: mode === 'Flower' ? "HP" : mode === "Plume" ? "ATK" : null };
        const art = updates.artifacts[idx];

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
  }
  return { updates, mode };
}

const exe = async (message: Discord.Message, args: string[]) => {
  const characterName = match(args[0], CHARACTERS.map(c => c.name));
  const character = CharacterBuildService.getCharacter(characterName);
  if (!character) return;

  const playerId = message.author.id;
  const collection = db.collection<CharacterBuild>("builds");
  const build = await collection.findOne({playerId, characterName});

  const { mode, updates } = parseBuild(args, build || CharacterBuildService.createDefault(character, playerId));

  if (updates) {
    // TODO validations (level-ascension)

    if (build) {
      await collection.updateOne({playerId, characterName}, {$set: updates});
    } else {
      await collection.insertOne(updates);
    }
  } else if (!build) {
    return message.channel.send(`**:exclamation: | Build not found.**`);
  }

  const embed = createEmbed(build || updates)
      .setAuthor(getUsername(message), message.author.avatarURL())
      .setThumbnail("attachment://char.png")
  await message.channel.send({
    embed,
    files: [{
      attachment:'assets/noelle-avatar.png', // TODO
      name:'char.png'
    }]
  }).then(() => message.channel.send(createArtifactsEmbed(build.artifacts)));
}

const createEmbed = (build: CharacterBuild): Discord.MessageEmbed => {
  const character = CharacterBuildService.getCharacter(build.characterName);
  const buildStats = CharacterBuildService.calculateStats(build);
  const extraStatKeys = Object.entries(buildStats).filter(([k]) => !subStatNames.includes(k));
  const weaponModel = WEAPONS.find(w => w.name === build.weapon.name) as WeaponModel;
  const weaponStats = WeaponService.calculateStats(build.weapon);

  return new Discord.MessageEmbed().setColor('#ffbf00')
      .setTitle(`${ShowoffEmoji[character.element.toLowerCase()] || ""} ${character.name} C${build.constellation}`)
      .addField(`(level ${build.level} ${getAscensionEmotes(build.ascension)})`, [
        ...["HP", "ATK", "DEF", "EM"].map(s => getStatDisplay(s, buildStats[s])),
        `${ShowoffEmoji.ER} **ER:** ${Math.round(buildStats["ER"] * 10 || 0) / 10}%`,
        `${ShowoffEmoji.CR} **Crit Rate:** ${Math.round(buildStats["CR"] * 10 || 0) / 10}%`,
        `${ShowoffEmoji.CD} **Crit DMG:** ${Math.round(buildStats["CD"] * 10 || 0) / 10}%`,
        ...extraStatKeys.map(([k, v]) => getStatDisplay(k, v))
      ].join("\n"), true)
      .addField("Talents:", [
        `Normal attack: ${build.talentLevels.normalAttack}`,
        `Elemental skill: ${build.talentLevels.elementalSkill}`,
        `Elemental burst: ${build.talentLevels.elementalBurst}`,  // TODO crowns
        "",
        `**${ShowoffEmoji[weaponModel.type.toLowerCase()]} ${weaponModel.name} R${build.weapon.refinement}**`,
        `(level ${build.weapon.level} ${(getAscensionEmotes(build.weapon.ascension))})`,
        `${ShowoffEmoji.ATK} **ATK:** ${weaponStats["ATK"]}`,
        ...Object.entries(weaponStats).filter(([k]) => k !== "ATK")
            .map(([k, v]) => getStatDisplay(k, v))
      ].join("\n"), true);
};

const createArtifactsEmbed = (artifacts: Artifact[]): Discord.MessageEmbed => {
  const embed = new MessageEmbed()
      .setTitle("Artifacts")
      .setColor('#ffbf00') // TODO by rarity
  artifacts.forEach(art => {
    embed.addField(`${ShowoffEmoji[art.type]} ${art.set} +${art.level}\n(${art.rarity} :star:) **${art.mainStat}: ${ArtifactService.getMainStatValue(art)}**`,
          Object.entries(art.subStats).map(([statType, value]) => {
    const rolls = ArtifactService.estimateSubstatRolls(statType, value, art.rarity);
    const rollsStr = rolls.map(i => ShowoffEmoji[`roll${i+1}`]).reverse().join("");
    return `${getStatDisplay(statType, value)} ${rollsStr}`;
  }).join("\n"), true)});
  embed.addField("\u200B", "\u200B", true) // hack!!
  return embed;
}

export const CharacterBuildCommand = {
  createEmbed,
  parseBuild,
  exe
}