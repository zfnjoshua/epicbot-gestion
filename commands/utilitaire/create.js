const db = require("quick.db");
const Discord = require("discord.js");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "create",
  description: "Créer des émojis",
  aliases: ["emojiadd", "emojisadd"],

  run: async (client, message, args, cmd) => {
    const permCheck = await checkperm(message, cmd.name);

    if (!permCheck.permission) {
      if (!db.fetch(`${message.guild.id}.vent`)) {
        return message.reply(
          `:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`
        );
      }
    } else if (!permCheck.hasPermission) {
      return message.channel.send(":x: Vous n'avez pas la permission d'utiliser cette commande !");
    }

    if (!args.length)
      return message.channel.send(":x: Merci de préciser les émojis à ajouter !");

    message.channel.send(`:recycle: Création en cours...`);

    const emojis = [];

    for (const rawEmoji of args) {
      const parsedEmoji = Discord.Util.parseEmoji(rawEmoji);

      if (parsedEmoji.id) {
        const extension = parsedEmoji.animated ? ".gif" : ".png";
        const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`;

        try {
          const createdEmoji = await message.guild.emojis.create(url, parsedEmoji.name);
          emojis.push(createdEmoji);
        } catch (error) {
          console.error(error);
          message.channel.send(`:x: Erreur lors de la création de l'émoji \`${parsedEmoji.name}\`.`);
        }
      }
    }

    message.channel.send(
      `${emojis.length} émoji${emojis.length > 1 ? "s" : ""} créé${
        emojis.length > 1 ? "s" : ""
      }${args.length - emojis.length !== 0 ? `, (je n'ai pas réussi à en créer ${args.length - emojis.length}) ` : " "}!`
    );
  },
};
