const db = require("quick.db")
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "adminlogs",
  description: "Defines the logs alert when an admin permission is added",
  aliases: ['adminlog'],

  run: async (client, message, args, cmd) => {
    let perm = await checkperm(message, "logs")

    if (!perm) {
      if (db.fetch(`${message.guild.id}.vent`)) return;
      return message.reply(`:x: You don't have permission to use the \`logs\` command!`);
    }

    let m = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

    if (!m || m.type !== "GUILD_TEXT") {
      return message.reply(`:x: Invalid channel mentioned or ID provided!`);
    }

    let actual = await db.fetch(`${message.guild.id}.adminlogs`);

    if (actual === m.id) {
      await db.delete(`${message.guild.id}.adminlogs`);
      return message.reply(`:clipboard: Admin permission logs are now disabled!`);
    }

    await db.set(`${message.guild.id}.adminlogs`, m.id);
    return message.reply(`:clipboard: Admin permission logs will now be sent in <#${m.id}>!`);
  }
};
