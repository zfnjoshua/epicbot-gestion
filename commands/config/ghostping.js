const db = require("quick.db");
const { MessageEmbed } = require("discord.js");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "ghostping",
  description: "Define ghostping channels",
  aliases: ["ghost-ping", "gp"],

  run: async (client, message, args, cmd) => {
    const perm = await checkperm(message, cmd.name);
    if (!perm) {
      if (!db.fetch(`${message.guild.id}.vent`))
        return message.reply(`:x: You don't have permission to use the command \`${cmd.name}\`!`);
    } else if (perm === true) {
      const listOption = args[0]?.toLowerCase() === "list";
      if (listOption) {
        const ghostPingChannels = db.fetch(`${message.guild.id}.ghostping`);
        if (!ghostPingChannels || !ghostPingChannels.length) {
          return message.reply("No ghostping channels found.");
        }

        const channelList = ghostPingChannels.map((id) => {
          const channel = message.guild.channels.cache.get(id);
          return channel ? `<#${channel.id}>` : "";
        }).join("\n");

        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(db.fetch(`${message.guild.id}.color`))
              .setTitle("Ghostping Channels")
              .setDescription(channelList || "No ghostping channels found.\n\nUse \`ghostping\` with a channel mention to enable.")
              .setFooter({ text: "New members will be ghostpinged in these channels." })
          ]
        });
      }

      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
      if (!channel || channel.type !== "GUILD_TEXT")
        return message.reply(`:x: Invalid channel!`);

      const ghostPingChannels = db.fetch(`${message.guild.id}.ghostping`) || [];

      const index = ghostPingChannels.findIndex((id) => id === channel.id);
      if (index > -1) {
        ghostPingChannels.splice(index, 1);
        db.set(`${message.guild.id}.ghostping`, ghostPingChannels);
        return message.reply(`:balloon: <#${channel.id}> is no longer a ghostping channel!`);
      }

      ghostPingChannels.push(channel.id);
      db.set(`${message.guild.id}.ghostping`, ghostPingChannels);
      return message.reply(`:balloon: <#${channel.id}> is now a ghostping channel!\n_Use \`ghostping list\` to see all ghostping channels._`);
    }
  },
};
