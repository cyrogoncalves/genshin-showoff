import * as Discord from 'discord.js';
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
import {
  calculateStats,
  calculateWeaponStats,
  createDefault,
  getCharacter,
  normalizeAscension,
  normalizeLevel,
} from './characterBuild.service';
import { ArtifactService } from './artifact.service';
import { capitalize, guard, match } from './util';
import { getUsername } from './discord-util';
import { db } from './mongodb';

const parseBuild = (
    args: string[], build: CharacterBuild, mode = "Build"
): { mode: string; updates: CharacterBuild } => {
  const modes = ["weapon", "flower", "plume", "sands", "goblet", "circlet"];
  let updates: CharacterBuild;
  for (let arg of args.slice(1)) {
    if (modes.includes(arg.toLowerCase())) {
      mode = capitalize(arg);
      continue;
    }

    updates = updates || {...build};

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
        .setThumbnail("https://static.wikia.nocookie.net/gensin-impact/images/0/0f/Item_Witch%27s_Flower_of_Blaze.png/revision/latest/scale-to-width-down/60?cb=20201120065356") // TODO thumbnail
        .setColor(rarityColors[art.rarity])
        .setTitle(`${art.set} +${art.level}`)
        .setDescription(`(${art.rarity} :star:) ${art.mainStat}: ${ArtifactService.getMainStatValue(art)}`)
        .addField("Substats:", getSubstatsDisplay(art), true)
    return message.channel.send(embed)
  }

  const name = character.name.replace(/\s/, "").toLowerCase();
  const color = rarityColors[character.rarity];
  const embed = createEmbed(build || updates).setColor(color)
      .setAuthor(getUsername(message), message.author.avatarURL())
      .setThumbnail(`https://genshin.honeyhunterworld.com/img/char/${name}_side_70.png`); // TODO traveler (Ex.: traveler_girl_geo)
  return message.channel.send(embed).then(() => message.channel
      .send(createArtifactsEmbed(build.artifacts).setColor(color)));
}

const statLabelMap = {
  'Pyro DMG': "pyro", 'Hydro DMG': "hydro", 'Electro DMG': "electro", 'Cryo DMG': "cryo",
  'Anemo DMG': "anemo", 'Geo DMG': "geo", 'Physical DMG': "ATK", 'Healing': "HP",
  "ATK%": "ATK", "HP%": "HP", "DEF%": "DEF"
};

const rarityColors = {
  1: "#9c9c9c",
  2: "#00993f",
  3: "#006ece",
  4: "#af00ce",
  5: "#ffbf00"
};

const getAscensionEmotes = (ascension: number): string => [
  ascension === 0 ? ShowoffEmoji.ascension00 : ascension === 1 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
  ascension < 3 ? ShowoffEmoji.ascension00 : ascension < 4 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
  ascension < 5 ? ShowoffEmoji.ascension00 : ascension < 6 ? ShowoffEmoji.ascension10 : ShowoffEmoji.ascension11,
].join("");

const getStatDisplayValue = (statType: StatType, value: number) =>
    ['HP', 'DEF', 'ATK', 'EM'].includes(statType) ? Math.round(value) : `${Math.round(value * 10 || 0) / 10}%`;

const getStatDisplay = (statType: StatType, value: number): string => {
  const emote = ShowoffEmoji[statLabelMap[statType] || statType] || "";
  return `**${statType}** ${getStatDisplayValue(statType, value)}`;
}

const getSubstatsDisplay = (art: Artifact): string => {
  return Object.entries(art.subStats).map(([statType, value]) => {
    const rolls = ArtifactService.estimateSubstatRolls(statType, value, art.rarity);
    const rollsStr = rolls.map(i => ShowoffEmoji[`roll${i + 1}`]).reverse().join("");
    return `**${statType}** +${getStatDisplayValue(statType, value)} ${rollsStr}`;
  }).join("\n");
}

const createEmbed = (build: CharacterBuild): Discord.MessageEmbed => {
  const character = getCharacter(build.characterName);
  const buildStats = calculateStats(build);
  const weaponModel = WEAPONS.models.find(w => w.name === build.weapon.name) as WeaponModel;
  const weaponStats = calculateWeaponStats(build.weapon);
  const statNames = subStatNames.reverse();

  return new Discord.MessageEmbed()
      .setTitle(`${ShowoffEmoji[character.element.toLowerCase()] || ""} ${character.name} C${build.constellation}`)
      .addField(`(level ${build.level} ${getAscensionEmotes(build.ascension)})`,
          Object.entries(buildStats).filter(s => !s.includes("%")) // HP%, AKT%, DEF%
            .sort(([k1], [k2]) => statNames.indexOf(k2) - statNames.indexOf(k1))
            .map(([k, v]) => getStatDisplay(k, v))
      .join("\n"), true)
      .addField("Talents:", [
        `Normal attack: ${build.talentLevels.normalAttack}${build.talentLevels.normalAttack === 10 ? " :crown:" : ""}`,
        `Elemental skill: ${String(build.talentLevels.elementalSkill)
            + (build.constellation >= character.skillTalentConstellation ? " (+3)" : "")
            + (build.talentLevels.elementalSkill === 10 ? " :crown:" : "")}`,
        `Elemental burst: ${String(build.talentLevels.elementalBurst)
            + (build.constellation >= character.burstTalentConstellation ? " (+3)" : "")
            + (build.talentLevels.elementalBurst === 10 ? " :crown:" : "")}`,
        "",
        `**${ShowoffEmoji[weaponModel.type.toLowerCase()]} ${weaponModel.name} R${build.weapon.refinement}**`,
        `(level ${build.weapon.level} ${getAscensionEmotes(build.weapon.ascension)})`,
        ...Object.entries(weaponStats).map(([k, v]) => getStatDisplay(k, v))
      ].join("\n"), true);
};

const getArtifactTitle = (art: Artifact): string => `**${ShowoffEmoji[art.type]} ${art.set} +${art.level}
(${art.rarity} :star:) ${art.mainStat}: ${ArtifactService.getMainStatValue(art)}**`;

const createArtifactsEmbed = (artifacts: Artifact[]): Discord.MessageEmbed => {
  const embed = new Discord.MessageEmbed();
  embed.addField(getArtifactTitle(artifacts[0]), [
    getSubstatsDisplay(artifacts[0]),
    "",
    getArtifactTitle(artifacts[1]),
    getSubstatsDisplay(artifacts[1]),
    "",
    getArtifactTitle(artifacts[2]),
    getSubstatsDisplay(artifacts[2])
  ].join("\n"), true);
  embed.addField(getArtifactTitle(artifacts[3]), [
    getSubstatsDisplay(artifacts[3]),
    "",
    getArtifactTitle(artifacts[4]),
    getSubstatsDisplay(artifacts[4])
  ].join("\n"), true);
  // artifacts.forEach(art => embed.addField(getArtifactTitle(art), getSubstatsDisplay(art), true));
  // embed.addField("\u200B", "\u200B", true) // hack!!
  return embed;
}

export const CharacterBuildCommand = {
  createEmbed,
  parseBuild,
  exe
}