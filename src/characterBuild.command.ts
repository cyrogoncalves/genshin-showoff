import * as Discord from 'discord.js';
import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as WEAPONS from '../assets/weapons.json';
import * as ARTIFACTS from "../assets/artifacts.json";
import * as CHARACTERS from "../assets/characters.json";
import {
  Artifact,
  ArtifactType,
  artifactTypeNames,
  CharacterBuild,
  Level,
  levelValues,
  mainStatNames,
  StatType,
  subStatNames,
  Weapon,
  WeaponLevel,
  weaponLevelValues
} from './model';
import {
  calculateStats,
  calculateWeaponStats,
  createDefault,
  getCharacter,
  getMainStatValue
} from './characterBuild.service';
import { ArtifactService } from './artifact.service';
import { capitalize, guard, match } from './util';
import { getUsername } from './discord-util';
import { db } from './mongodb';

const ascensionLevelMap = [
  [1, 5, 10, 15, 20],
  [20, 25, 30, 35, 40],
  [40, 45, 50],
  [50, 55, 60],
  [60, 65, 70],
  [70, 75, 80],
  [80, 85, 90]
];

const normalizeAscension = (o: CharacterBuild | Weapon) => {
  if (!ascensionLevelMap[o.ascension].includes(o.level))
    o.ascension = ascensionLevelMap.findIndex(a => a.includes(o.level));
}

const normalizeLevel = (o: CharacterBuild | Weapon) => {
  if (!ascensionLevelMap[o.ascension].includes(o.level))
    o.level = ascensionLevelMap[o.ascension][0] as WeaponLevel;
}

const parseBuild = (
    args: string[], build: CharacterBuild, mode = "Build"
): { mode: string; updates: CharacterBuild } => {
  let updates: CharacterBuild = { ...build };
  let art: Artifact;
  for (let arg of args.slice(1)) {
    if (arg.toLowerCase() === "weapon") { mode = "Weapon"; continue; }
    if (guard<ArtifactType>(artifactTypeNames, capitalize(arg))) {
      mode = capitalize(arg);
      const artIdx = artifactTypeNames.indexOf(mode as ArtifactType);
      const mainStat = mode === 'Flower' ? "HP" : mode === "Plume" ? "ATK" : null;
      updates.artifacts[artIdx] = { set: null, level: 20, rarity: 5, type: mode as ArtifactType, subStats: {}, mainStat };
      art = updates.artifacts[artIdx];
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
          if (!guard<Level>(levelValues, level, "number"))
            throw Error("Invalid level");
          updates.level = level;
          normalizeAscension(updates);
        } else if (arg.startsWith("ascension=")) {
          const ascension = Number(arg.slice(10));
          if (ascension < 0 || ascension > 6)
            throw Error("Invalid ascension");
          updates.ascension = ascension;
          normalizeLevel(updates);
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
          if (!guard<WeaponLevel>(weaponLevelValues, level, "number"))
            throw Error(`Invalid weapon level '${level}'`);
          updates.weapon.level = level;
          normalizeAscension(updates.weapon);
        } else if (arg.startsWith("ascension=")) {
          const ascension = Number(arg.slice(10));
          if (ascension < 0 || ascension > 6)
            throw Error("Invalid weapon ascension");
          updates.weapon.ascension = ascension;
          normalizeLevel(updates.weapon);
        } else if (arg.match(/R\d/)) {
          const refinement = Number(arg.slice(1));
          if (refinement < 1 || refinement > 5)
            throw Error("Invalid weapon refinement");
          updates.weapon.refinement = refinement;
        } else { // name
          const character = getCharacter(updates.characterName);
          const weapons = WEAPONS.models.filter(w => w.type === character.weaponType);
          const modelName = match(arg, weapons.map(w => w.name));
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
  const character = getCharacter(characterName);
  if (!character) return; // TODO usage

  const playerId = message.author.id;
  const collection = db.collection<CharacterBuild>("builds");
  const build = await collection.findOne({playerId, characterName});

  const { mode, updates } = parseBuild(args, build || createDefault(character, playerId));

  if (updates) {
    await (!build ? collection.insertOne(updates) :
        collection.updateOne({playerId, characterName}, {$set: updates}));
  } else if (!build) {
    return message.channel.send(`:exclamation: **Build not found.**`);
  }

  const art = build?.artifacts.find(a => a.type === mode);
  if (!updates && art) {
    const embed = new Discord.MessageEmbed()
        .setAuthor(getUsername(message), message.author.avatarURL())
        .setThumbnail("https://static.wikia.nocookie.net/gensin-impact/images/0/0c/Item_Gladiator%27s_Longing.png/revision/latest?cb=20201120063332") // TODO thumbnail
        .setColor(rarityColors[art.rarity])
        .setTitle(`${art.set}`)
        .setDescription(`${art.rarity}★ LV${art.level} ${art.mainStat}: ${getMainStatValue(art)}`)
        .addField("Substats:", getSubstatsDisplay(art), true)
    return message.channel.send(embed)
  }

  const name = character.name.replace(/\s/, "").toLowerCase();
  const color = rarityColors[character.rarity];
  const embed = createEmbed(build || updates).setColor(color)
      .setAuthor(getUsername(message), message.author.avatarURL())
      .setImage(`https://genshin.honeyhunterworld.com/img/char/${name}_side_70.png`); // TODO traveler (Ex.: traveler_girl_geo)
  return message.channel.send(embed)
      // .then(() => message.channel.send(createArtifactsEmbed(build.artifacts).setColor(color)));
}

const statLabelMap = {
  'Pyro DMG': "pyro", 'Hydro DMG': "hydro", 'Electro DMG': "electro", 'Cryo DMG': "cryo",
  'Anemo DMG': "anemo", 'Geo DMG': "geo", 'Physical DMG': "ATK", 'Healing': "HP",
  "ATK%": "ATK", "HP%": "HP", "DEF%": "DEF"
};

const rarityColors = {
  1: "#9c9c9c",
  2: "#00993f",
  3: "#1e6eb6",
  4: "#7c1f89",
  5: "#b68f1c"
};

const getStatDisplayValue = (statType: StatType, value: number) =>
    ['HP', 'DEF', 'ATK', 'EM'].includes(statType) ? Math.round(value) : `${Math.round(value * 10 || 0) / 10}%`;

const getEmote = (type: StatType): string => ShowoffEmoji[statLabelMap[type] || type] || "";

const getStatDisplay = (type: StatType, value: number): string =>
  `${getEmote(type)} **${type}:** ${getStatDisplayValue(type, value)}`;

const getSubstatsDisplay = (art: Artifact): string => {
  return Object.entries(art.subStats).map(([statType, value]) => {
    const rolls = ArtifactService.estimateSubstatRolls(statType, value, art.rarity);
    const rollsStr = rolls.map(i => ShowoffEmoji[`roll${i + 1}`]).reverse().join("");
    return `${getEmote(statType)} +${getStatDisplayValue(statType, value)} ${rollsStr}`;
  }).join("\n");
}

const createEmbed = (build: CharacterBuild): Discord.MessageEmbed => {
  const character = getCharacter(build.characterName);
  const weaponStats = calculateWeaponStats(build.weapon);
  const stats = calculateStats(build);
  const buildStats = Object.entries(stats).map(([k, v]) => getStatDisplay(k, v));
  const { normalAttack: n, elementalSkill: e, elementalBurst: q } = build.talentLevels;
  // const artifacts = build.artifacts;

  return new Discord.MessageEmbed()
      .setTitle(`${ShowoffEmoji[character.element.toLowerCase()] || ""} ${character.name} C${build.constellation} ${"★".repeat(character.rarity)}`)
      // .setDescription()
      .addField(`LV${build.level} ${"✦".repeat(build.ascension).padEnd(6, "✧")}`,
          `${buildStats.slice(0, 4).join("\n")}`, true)
      .addField(`\u200B`, `${buildStats.slice(4).join("\n")}`, true)
      // .addFields(buildStats.map(([k, v]) =>
      //     ({ name: `${k.replace("CD","Crit DMG").replace("CR", "Crit Rate")}:`, value: `${getStatDisplayValue(k, v)}`, inline: true })))
      .addField("Talents", [
        `\`Normal:\` ${"▰".repeat(n)} ${n}${n === 10 ? " :crown:" : ""}`,
        `\`Skill: \` ${"▰".repeat(e)}${build.constellation >= character.skillTalentConstellation ? "▱▱▱" : ""} ${e}${e === 10 ? " :crown:" : ""}`,
        `\`Burst: \` ${"▰".repeat(q)}${build.constellation >= character.burstTalentConstellation ? "▱▱▱" : ""} ${q}${q === 10 ? " :crown:" : ""}`,
      ])
      .addField(`${ShowoffEmoji[character.weaponType.toLowerCase()]} ${build.weapon.name} R${build.weapon.refinement}`, [
        `LV${build.weapon.level} ${"✦".repeat(build.weapon.ascension).padEnd(6, "✧")}`,
        `**${ShowoffEmoji["ATK"]} ${weaponStats.atk}**`,
        `${getEmote(weaponStats.substat.type)} +${weaponStats.substat.value}`
      ].join("\n"), true)
      .addFields(build.artifacts.map(art => ({
        name: getArtifactTitle(art),
        value: getSubstatsDisplay(art),
        inline: true
      })))
    //   .addField(`${ShowoffEmoji[character.weaponType.toLowerCase()]} ${build.weapon.name} R${build.weapon.refinement}`, [
    //     `LV${build.weapon.level} ${"✦".repeat(build.weapon.ascension).padEnd(6, "✧")}`,
    //     `**:crossed_swords: ${weaponStats.atk}** ${getEmote(weaponStats.substat.type)} +${weaponStats.substat.value}`,
    //     "",
    //     getArtifactTitle(artifacts[0]),
    //     getSubstatsDisplay(artifacts[0]),
    //     "",
    //     getArtifactTitle(artifacts[1]),
    //     getSubstatsDisplay(artifacts[1]),
    //   ].join("\n"), true)
    // .addField(getArtifactTitle(artifacts[2]), [
    //   getSubstatsDisplay(artifacts[2]),
    //   "",
    //   getArtifactTitle(artifacts[3]),
    //   getSubstatsDisplay(artifacts[3]),
    //   "",
    //   getArtifactTitle(artifacts[4]),
    //   getSubstatsDisplay(artifacts[4])
    // ].join("\n"), true);
  // artifacts.forEach(art => embed.addField(getArtifactTitle(art), getSubstatsDisplay(art), true));
  // embed.addField("\u200B", "\u200B", true) // hack!!
};

const getArtifactTitle = (art: Artifact): string => `**${ShowoffEmoji[art.type]} ${art.set}
${art.rarity}★ LV${art.level} ${art.mainStat}: ${getMainStatValue(art)}**`;

export const CharacterBuildCommand = {
  createEmbed,
  parseBuild,
  exe
}