require("dotenv").config();
import * as Discord from 'discord.js';
import { CharacterBuildCommand } from './characterBuild.command';
import './mongodb';

const msg = require(`../assets/${process.env.LOCALE || 'en'}.messages.json`);
const commands = [CharacterBuildCommand];
const prefix = "-showoff";
const bot = new Discord.Client({ messageCacheMaxSize: 0 });

bot.on('message', async message => {
  if (message.channel.type === 'dm' || message.author.bot) return;
  if (!message.guild.me.hasPermission("SEND_MESSAGES")) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+|\n/g);
  try {
    commands.forEach(c => c.exe(message, args));
  } catch (err) {
    console.error(err);
    return message.channel.send(`:x: | **${err.message || msg.ERROR_OCCURRED}**`);
  }
});

bot.once('ready', () => {
  console.log(`READY! Commands: ${commands.length} Guilds: ${bot.guilds.cache.size} Users: ${bot.users.cache.size}`);
});

bot.login(process.env.DISCORD_TOKEN);
