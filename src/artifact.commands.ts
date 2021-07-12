import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Artifact, ArtifactType, StatType } from './model';
import { format, guard, parseArgs } from './util';
const msg = require(`../assets/${process.env.LOCALE || 'en'}.messages.json`);

const createEmbed = () => {
  return new MessageEmbed()
      .setTitle("Witch's Flower of Blaze")
      .setColor('#ffd500')
      .setDescription("Flower of Life :star: :star: :star: :star: :star:")
      .setThumbnail("https://static.wikia.nocookie.net/gensin-impact/images/0/0c/Item_Gladiator%27s_Longing.png/revision/latest?cb=20201120063332")
      .addField("ATK", "**311**", true)
      .addField("Crit Rate", "+15.6%", true)
      .addField("Crit DMG", "+23.4%", true)
      .addField("Level", "+20", true)
      .addField("ATK%", "+5.8%", true)
      .addField("ER", "+6.5%", true)
}

const add = (message: Message, args: string[]): Artifact => {
  const { set, type, substats, rarity = 5, level = 20, mainStat } = parseArgs(args);
  const subStats = substats.split('|').reduce((obj, arg: string) => {
    const [substat, value] = arg.split(':');
    if (obj[substat]) console.warn(format(msg.DUPLICATE_SUBSTAT, { substat }));
    obj[substat] = Number(value);
    return obj;
  }, {});

  const validTypes = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'];
  if (!guard<ArtifactType>(validTypes, type))
    throw new Error(format(msg.DUPLICATE_SUBSTAT, { type, validTypes }));

  if (!mainStat && type !== 'Flower' && type !== 'Plume')
    throw new Error(msg.MAIN_STAT_NOT_PROVIDED);

  const artifact = {
    set,
    type,
    subStats,
    rarity: Number(rarity),
    level: Number(level),
    mainStat: type === 'Flower' ? 'HP' : type === 'Plume' ? 'ATK' : mainStat as StatType
  };
  // message.channel.send("Artifact registered"); // TODO

  const embed = createEmbed();
  message.channel.send(embed);

  return artifact;
}

export const ArtifactCommands = {
  createEmbed,
  add,
}
