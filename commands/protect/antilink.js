const db = require("quick.db");
const Discord = require("discord.js");
const rslow = require("../../slow.js");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "antilink",
  description: "Configure the anti-link",
  usage: "antilink <off/on/max/allow/deny>",
  aliases: ["anti-link"],

  run: async (client, message, args, cmd) => {
    const botOwnerPerm = db.fetch(`${message.guild.id}.botowner`);
    const hasPermission = await checkperm(message, "anti");

    if (!(hasPermission || botOwnerPerm && botOwnerPerm.includes(message.author.id))) {
      if (!db.fetch(`${message.guild.id}.vent`))
        return message.reply(
          ":x: You do not have permission to use the `anti` command!"
        );
    }

    if (rslow.action[message.author.id])
      return message.channel.send(
        ":x: Please wait before performing another action!"
      );

    const newStatus = args[0] ? args[0].toLowerCase() : "";
    const currentStatus =
      db.fetch(`${message.guild.id}.anti.link`) || "off";

    if (newStatus === "on") {
      db.set(`${message.guild.id}.anti.link`, "on");
      message.reply(
        `:shield: The antilink is now on${
          currentStatus === "on" ? " (ignoring bot messages)" : ""
        }`
      );
    } else if (newStatus === "off") {
      db.delete(`${message.guild.id}.anti.link`);
      message.reply(`:shield: The antilink is now off`);
    } else if (newStatus === "max") {
      db.set(`${message.guild.id}.anti.link`, "max");
      message.reply(`:shield: The antilink is now set to max`);
    } else if (newStatus === "allow") {
      if (!args[1])
        return message.reply(
          `:x: Please mention a channel or provide a channel ID`
        );

      const channel = message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);

      if (!channel)
        return message.reply(
          `:x: I couldn't find the provided channel`
        );

      const allowedChannels = db.fetch(`${message.guild.id}.anti.link_allow`) || [];
      const index = allowedChannels.indexOf(channel.id);

      if (index === -1) {
        allowedChannels.push(channel.id);
        db.set(`${message.guild.id}.anti.link_allow`, allowedChannels);
        message.reply(
          `:shield: The channel \`${channel.name}\` is now ignored by the antilink`
        );
      } else {
        message.reply(`:x: The channel \`${channel.name}\` is already ignored by the antilink`);
      }
    } else if (newStatus === "deny") {
      if (!args[1])
        return message.reply(
          `:x: Please mention a channel or provide a channel ID`
        );

      const channel = message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);

      if (!channel)
        return message.reply(
          `:x: I couldn't find the provided channel`
        );

      const allowedChannels = db.fetch(`${message.guild.id}.anti.link_allow`) || [];
      const filteredChannels = allowedChannels.filter(
        (e) => e !== channel.id
      );

      db.set(`${message.guild.id}.anti.link_allow`, filteredChannels);
      message.reply(
        `:shield: The channel \`${channel.name}\` is no longer ignored by the antilink`
      );
    } else {
      message.reply(
        `The antilink is currently on \`${currentStatus}\`!`
      );
    }

    rslow.action[message.author.id] = true;
    setTimeout(() => {
      rslow.action[message.author.id] = false;
    }, db.fetch(`${message.guild.id}.actionslow`));

    const logChannel = db.fetch(`${message.guild.id}.raidlogs`);
    const logChannelObj = message.guild.channels.cache.get(logChannel);

    if (logChannelObj)
      logChannelObj.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor(db.fetch(`${message.guild.id}.color`))
            .setDescription(
              `${message.author} changed the antilink to \`${newStatus}\``
            ),
        ],
      }).catch((e) => {
        console.error(e);
      });
  },
};
