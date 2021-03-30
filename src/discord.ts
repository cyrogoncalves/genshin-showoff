import * as Discord from 'discord.js';
import { ArtifactCommands } from './artifact.commands';
import { CharacterBuildCommand } from './characterBuild.command';
import { build } from "./mock/mock";

require("dotenv").config();

const msg = require(`../assets/${process.env.LOCALE || 'en'}.messages.json`);

const commands: {
  metadata: {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
  }
  permissions?: string[];
  exe: (message: Discord.Message, args: string[]) => void;
}[] = [
  {
    metadata: msg.commands.ADD_ARTIFACT,
    exe: ArtifactCommands.add
  }
];

const getUsername = (message: Discord.Message) => {
  return (message.channel as Discord.TextChannel).guild.members
      .cache.get(message.author.id).nickname || message.author.username;
}

const prefix = "-showoff";
const cooldownTime = 8000;
const cooldownMaxStack = 4;
const cooldowns: {
  [propName: string]: {
    count: number;
    readonly timeout: NodeJS.Timeout;
  };
} = {};

const bot = new Discord.Client({ messageCacheMaxSize: 0 });

bot.on('message', async message => {
  if (message.channel.type === 'dm' || message.author.bot) return;
  if (!message.guild.me.hasPermission("SEND_MESSAGES")) return;
  if (!message.content.startsWith(prefix)) return;

  if (!cooldowns[message.author.id]) {
    const timeout = setTimeout(() => delete cooldowns[message.author.id], cooldownTime);
    cooldowns[message.author.id] = { count: 1, timeout: timeout };
  } else {
    if (++cooldowns[message.author.id].count === cooldownMaxStack)
      return message.channel.send(`> 🥶 ${message.author}, ${msg.MUTE_NOTICE}`);
    if (cooldowns[message.author.id].count > cooldownMaxStack)
      return; // muted
  }

  // const args = message.content.slice(prefix.length).trim().split(/\s+/);
  // const cmdName = args.shift().toLowerCase();
  // const command = commands.find(cmd => cmd.metadata.name === cmdName || cmd.metadata.aliases?.some(a => a === cmdName));
  // if (!command) return;
  try {
    // command.exe(message, args);
    const embed = CharacterBuildCommand.createEmbed(build);
    embed.setAuthor(getUsername(message), message.author.avatarURL())
        .setThumbnail("attachment://char.png")
    await message.channel.send({
      embed,
      files: [{
        attachment:'assets/noelle-avatar.png',
        name:'char.png'
      }]
    });
  } catch (err) {
    console.error(err);
    return message.channel.send(`:x: | **${err.message || msg.ERROR_OCCURRED}**`);
  }
});

bot.on('ready', () => {
  console.log(`READY!\n\nCommands: ${commands.length}\nGuilds: ${bot.guilds.cache.size}\nUsers: ${bot.users.cache.size}`);
});

bot.login(process.env.DISCORD_TOKEN);