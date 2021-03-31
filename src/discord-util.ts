import Discord from 'discord.js';

export const getUsername = (message: Discord.Message) => {
  return (message.channel as Discord.TextChannel).guild.members
      .cache.get(message.author.id).nickname || message.author.username;
}
