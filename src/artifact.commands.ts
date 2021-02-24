import { Message } from 'discord.js';
import { Artifact, ArtifactType, StatType } from './model';
import { format, guard, parseArgs } from './util';
const msg = require(`../assets/${process.env.LOCALE || 'en'}.messages.json`);

export const ArtifactCommands = {
  add(message: Message, args: string[]): Artifact {
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
    message.channel.send("Artifact registered"); // TODO
    return artifact;
  },
}
