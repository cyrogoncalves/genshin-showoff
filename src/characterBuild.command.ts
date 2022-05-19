import * as Discord from "discord.js";
import * as ShowoffEmoji from "../assets/discordEmotes.json";
import * as WEAPONS from "../assets/weapons.json";
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
  weaponLevelValues,
  WeaponType
} from "./model";
import {
  calculateStats,
  calculateWeaponStats,
  createDefault,
  createDefaultArtifact,
  getCharacter,
  getMainStatValue
} from "./characterBuild.service";
import { estimateSubstatRolls } from "./artifact.service";
import { capitalize, includes, match } from "./util";
import { getUsername } from "./discord-util";
import { db } from "./mongodb";

const ascensionLevelMap: WeaponLevel[][] =
    [[1, 5, 10, 15, 20], [20, 25, 30, 35, 40], [40, 45, 50], [50, 55, 60], [60, 65, 70], [70, 75, 80], [80, 85, 90]];

const parseBuildToken = (arg: string, updates: CharacterBuild) => {
  if (arg.match(/C\d/)) {
    const constellation = Number(arg.slice(1));
    if (constellation < 0 || constellation > 6)
      throw Error("Invalid constellation");
    updates.constellation = constellation;
  } else if (arg.startsWith("level=")) {
    const level = Number(arg.slice(6));
    if (!includes(levelValues, level))
      throw Error("Invalid level");
    updates.level = level;
    if (!ascensionLevelMap[updates.ascension].includes(updates.level))
      updates.ascension = ascensionLevelMap.findIndex(a => updates.level in a);
  } else if (arg.startsWith("ascension=")) {
    const ascension = Number(arg.slice(10));
    if (ascension < 0 || ascension > 6)
      throw Error("Invalid ascension");
    updates.ascension = ascension;
    if (!ascensionLevelMap[updates.ascension].includes(updates.level))
      updates.level = ascensionLevelMap[updates.ascension][0] as Level;
  } else if (arg.startsWith("talents=")) {
    const match = arg.match(/talents=(?<normalAttack>\d+),(?<elementalSkill>\d+),(?<elementalBurst>\d+)/);
    if (!match)
      throw Error("Invalid talents (must be like 'talents=7,7,8')");
    updates.talentLevels = match.groups as any;
  }
};

const parseWeaponToken = (arg: string, weapon: Weapon, weaponType: WeaponType) => {
  if (arg.startsWith("level=")) {
    const level = Number(arg.slice(6));
    if (!includes(weaponLevelValues, level))
      throw Error(`Invalid weapon level '${level}'`);
    weapon.level = level;
    if (!ascensionLevelMap[weapon.ascension].includes(weapon.level))
      weapon.ascension = ascensionLevelMap.findIndex(a => weapon.level in a);
  } else if (arg.startsWith("ascension=")) {
    const ascension = Number(arg.slice(10));
    if (ascension < 0 || ascension > 6)
      throw Error("Invalid weapon ascension");
    weapon.ascension = ascension;
    if (!(weapon.level in ascensionLevelMap[weapon.ascension]))
      weapon.level = ascensionLevelMap[weapon.ascension][0] as WeaponLevel;
  } else if (arg.match(/R\d/)) {
    const refinement = Number(arg.slice(1));
    if (refinement < 1 || refinement > 5)
      throw Error("Invalid weapon refinement");
    weapon.refinement = refinement;
  } else { // name
    const weapons = WEAPONS.models.filter(w => w.type === weaponType);
    const modelName = match(arg, weapons.map(w => w.name));
    if (!modelName)
      throw Error(`Invalid weapon name: ${arg}`);
    weapon.name = modelName;
  }
};

const parseArtifactToken = (arg: string, artifact: Artifact) => {
  const mainStat = match(arg, mainStatNames);
  const setName = match(arg, Object.keys(ARTIFACTS.sets));
  if (mainStat) {
    artifact.mainStat = mainStat;
  } else if (setName) {
    artifact.set = setName;
  } else if (arg.startsWith("level=")) {
    const level = Number(arg.slice(6));
    if (level < 0 || level > 20)
      throw Error(`Invalid ${artifact.type} level`);
    artifact.level = level;
  } else if (arg.startsWith("rarity=")) {
    const rarity = Number(arg.slice(7));
    if (rarity < 0 || rarity > 5)
      throw Error(`Invalid ${artifact.type} rarity`);
    artifact.rarity = rarity;
  } else { // subStat
    const [subStat, value] = arg.split("=");
    const subStatName = match(subStat, subStatNames);
    if (!subStatName || isNaN(value as any))
      throw Error(`Invalid ${artifact.type} subStat ${arg}`);
    artifact.subStats[subStatName] = Number(value);
  }
};

export const parseBuild = (args: string[], build: CharacterBuild
): { mode: "Build" | "Weapon" | ArtifactType, updates: CharacterBuild } => {
  let mode: "Build" | "Weapon" | ArtifactType = "Build";
  let updates: CharacterBuild;
  let art: Artifact;
  args.slice(1).forEach(arg => {
    if (["Weapon", ...artifactTypeNames].includes(capitalize(arg)))
      mode = capitalize(arg) as "Weapon" | ArtifactType;
    else {
      updates = updates || { ...build };
      if (mode === "Build") {
        parseBuildToken(arg, updates);
      } else if (mode === "Weapon") {
        const character = getCharacter(updates.characterName);
        parseWeaponToken(arg, updates.weapon, character.weaponType);
      } else {
        if (art?.type !== mode)
          art = updates.artifacts[artifactTypeNames.indexOf(mode)] = createDefaultArtifact(mode);
        parseArtifactToken(arg, art);
      }
    }
  })
  return { updates, mode };
};

export const exe = async (message: Discord.Message, args: string[]) => {
  const characterName = match(args[0], CHARACTERS.map(c => c.name));
  const character = getCharacter(characterName);
  if (!character) return message.channel.send("Command should start with caracter name.");

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
        .setAuthor({ name: getUsername(message), iconURL: message.author.avatarURL() })
        .setThumbnail("https://static.wikia.nocookie.net/gensin-impact/images/0/0c/Item_Gladiator%27s_Longing.png/revision/latest?cb=20201120063332") // TODO thumbnail
        .setColor(rarityColors[art.rarity - 1])
        .setTitle(`${art.set}`)
        .setDescription(`${art.rarity}★ LV${art.level} ${art.mainStat}: ${getMainStatValue(art)}`)
        .addField("Substats:", getSubstatsDisplay(art), true)
    return message.channel.send({ embeds: [embed] })
  }

  const name = character.name.replace(/\s/, "").toLowerCase();
  try {
    const embed = createEmbed(build || updates)
        .setColor(rarityColors[character.rarity - 1])
        .setAuthor({ name: getUsername(message), iconURL: message.author.avatarURL() })
        .setImage(`https://genshin.honeyhunterworld.com/img/char/${name}_side_70.png`); // TODO traveler (Ex.: traveler_girl_geo)
    return message.reply({ embeds: [embed] })
        // .then(() => message.channel.send(createArtifactsEmbed(build.artifacts).setColor(color)));
  } catch (err) {
    return message.reply(err.message);
  }
}

const statLabelMap = {
  "Pyro DMG": "pyro", "Hydro DMG": "hydro", "Electro DMG": "electro", "Cryo DMG": "cryo",
  "Anemo DMG": "anemo", "Geo DMG": "geo", "Physical DMG": "ATK", "Healing": "HP",
  "ATK%": "ATK", "HP%": "HP", "DEF%": "DEF"
};

const rarityColors = [
  "#9c9c9c",
  "#00993f",
  "#1e6eb6",
  "#7c1f89",
  "#b68f1c"
] as const;

const getStatDisplayValue = (statType: StatType, value: number) =>
    ["HP", "DEF", "ATK", "EM"].includes(statType) ? Math.round(value) : `${Math.round(value * 10 || 0) / 10}%`;

const getEmote = (type: StatType): string => ShowoffEmoji[statLabelMap[type] || type] || "";

const getRolls = (art: Artifact, statType: StatType, value: number): string =>
    estimateSubstatRolls(statType, value, art.rarity)
        .map(i => ShowoffEmoji[`roll${i + 1}`]).reverse().join("");

const getSubstatsDisplay = (art: Artifact): string =>
    Object.entries(art.subStats).map(([k, v]) =>
        `${getEmote(k)} +${getStatDisplayValue(k, v)} ${getRolls(art, k, v)}`
    ).join("\n");

export const createEmbed = (build: CharacterBuild): Discord.MessageEmbed => {
  const character = getCharacter(build.characterName);

  const embed = new Discord.MessageEmbed().setTitle([
    getEmote(character.element.toLowerCase()),
    character.name,
    `C${build.constellation}`,
    "★".repeat(character.rarity)
  ].join(" "))

  const buildStats = Object.entries(calculateStats(build))
      .map(([k, v]) => `${getEmote(k)} **${k}:** ${getStatDisplayValue(k, v)}`);
  embed.addField(`LV${build.level} ${"✦".repeat(build.ascension).padEnd(6, "✧")}`, buildStats.slice(0, 4).join("\n"), true)
      .addField(`\u200B`, buildStats.slice(4).join("\n"), true)

  embed.addField("Talents", Object.entries(build.talentLevels).map(([talent, value]) => [
    `\`${`${capitalize(talent.replace(/([A-Z])/g, " $1"))}:`.padEnd(16)}\``,
    `${"▰".repeat(value)}${build.constellation >= character.talentConstellation[talent] ? "▱▱▱" : ""}`,
    build.constellation >= character.talentConstellation[talent] ? value + 3 : value,
    value === 10 ? " :crown:" : ""
  ].join(" ")).join("\n"))

  const weaponStats = calculateWeaponStats(build.weapon);
  embed.addField(`${ShowoffEmoji[character.weaponType.toLowerCase()]} ${build.weapon.name} R${build.weapon.refinement}`, [
    `LV${build.weapon.level} ${"✦".repeat(build.weapon.ascension).padEnd(6, "✧")}`,
    `**${ShowoffEmoji["ATK"]} ${weaponStats.atk}**`,
    `${getEmote(weaponStats.substat.type)} +${getStatDisplayValue(weaponStats.substat.type, weaponStats.substat.value)}`
  ].join("\n"), true)

  // artifacts.forEach(art => embed.addField(getArtifactTitle(art), getSubstatsDisplay(art), true));
  // embed.addField("\u200B", "\u200B", true) // hack!!
  embed.addFields(build.artifacts.map(art => ({
    name: `**${ShowoffEmoji[art.type]} ${art.set}\n${art.rarity}★ LV${art.level} ${art.mainStat}: ${getMainStatValue(art)}**`,
    value: getSubstatsDisplay(art),
    inline: true
  })));

  return embed;
};
