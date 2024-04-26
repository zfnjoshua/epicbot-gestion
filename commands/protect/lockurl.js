const db = require("quick.db");
const Discord = require("discord.js");
const rslow = require("../../slow.js");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "lockurl",
  description: "Lock the server's vanity URL",
  usage: "antibot <on/off/max>",
  aliases: ["anti-bot"],

  run: async (client, message, args, cmd) => {
    const perm = await checkperm(message, cmd.name);

    if (perm === false) {
      if (!db.fetch(`${message.guild.id}.vent`))
        return message.reply(
          `:x: You don't have permission to use the command \`${cmd.name}\`!`
        );
    }

    if (rslow.action[message.author.id] === true)
      return message.channel.send(
        `:x: Please wait before performing another action!`
      );

    const isVanityUrlEnabled =
      message.guild.features.includes("VANITY_URL") ||
      message.guild.vanityURLCode;

    if (isVanityUrlEnabled) {
      if (args[0] === "on" || args[0] === "max") {
        db.set(`${message.guild.id}.anti.url`, "on");
        db.set(`${message.guild.id}.lockedurl`, message.guild.vanityURLCode);

        message.reply(
          `:shield: The URL is now locked on \`${message.guild.vanityURLCode}\`\n** :pushpin: Use \`lockurl off\` to modify the URL again**`
        );

        const logChannelId = db.fetch(`${message.guild.id}.raidlogs`);
        const logChannel =
          logChannelId && message.guild.channels.cache.get(logChannelId);

        if (logChannel)
          logChannel.send({
            embeds: [
              new Discord.MessageEmbed()
                .setColor(db.fetch(`${message.guild.id}.color`))
                .setDescription(
                  `${message.author} has locked the URL on \`${message.guild.vanityURLCode}\`!`
                ),
            ],
          });
      } else if (args[0] === "off") {
        db.delete(`${message.guild.id}.anti.url`);

        message.reply(
          `:shield: The URL can now be modified!`
        );

        const logChannelId = db.fetch(`${message.guild.id}.raidlogs`);
        const logChannel =
          logChannelId && message.guild.channels.cache.get(logChannelId);

        if (logChannel)
          logChannel.send({
            embeds: [
              new Discord.MessageEmbed()
                .setColor(db.fetch(`${message.guild.id}.color`))
                .setDescription(`${message.author} has unlocked the URL!`),
            ],
          });

        rslow.action[message.author.id] = true;
        setTimeout(() => {
          rslow.action[message.author.id] = false;
        }, db.fetch(`${message.guild.id}.actionslow`));
      } else {
        const isLocked = db.fetch(`${message.guild.id}.anti.url`);
        const lockedUrl = db.fetch(`${message.guild.id}.lockedurl`);

        message.reply(
          `Lock URL is ${
            isLocked ? `activated and locks the URL \`${lockedUrl || "not set"}\`` : `disabled`
          }!`
        );
      }
    } else {
      message.reply(`:x: You don't have a vanity URL!`);
    }
  },
};
