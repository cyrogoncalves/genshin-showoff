require("dotenv").config();
import * as Discord from 'discord.js';
import { CharacterBuildCommand } from './characterBuild.command';
import './mongodb';

const msg = require(`../assets/${process.env.LOCALE || 'en'}.messages.json`);
const commands = [CharacterBuildCommand];
const prefix = "-showoff";
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });

client.on("messageCreate", message => {
  if (message.channel.type === 'DM' || message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+|\n/g);
  try {
    commands.forEach(c => c.exe(message, args));
  } catch (err) {
    console.error(err);
    message.channel.send(`:x: | **${err.message || msg.ERROR_OCCURRED}**`);
  }
});

client.once('ready', () => {
  console.log(`READY! Commands: ${commands.length} Guilds: ${client.guilds.cache.size} Users: ${client.users.cache.size}`);
});

client.login(process.env.DISCORD_TOKEN);
