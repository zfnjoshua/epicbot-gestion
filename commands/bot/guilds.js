const db = require("quick.db")
const Discord = require("discord.js");
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "guilds",
    description: "Envois la liste des serveurs où le bot est présent",
    aliases: ['add-server', "guild"],

  run: async (client, message, args, cmd) => {
    let perm = await checkperm(message,cmd.name)
    if (perm == true) {
 if (args[0] === "deny" || args[0] === "leave") {
        if (args.length < 2 || args[1].length !== 18 || isNaN(args[1])) return message.channel.send(`:x: ID Invalide`)
        let g = client.guilds.cache.get(args[1])
        if (!g) return message.channel.send(":x: Je ne suis pas sur ce serveur !")

        message.channel.send(`Serveur interdit et quitté ! (${g.name})`)
        g.leave()
          .catch(err => {
            console.log(`there was an error leaving the guild: \n ${err.message}`);
            message.channel.send(`:x: Une erreur est survenue lors de la tentative de quitter le serveur : \`${err.message}\``);
          })
          .then(() => {
            let del = db.all()
              .map(entry => entry.ID)
              .filter(id => id.startsWith(`${message.guild.id}`))

            del.forEach(id => {
              db.delete(id)
                .catch(err => {
                  console.log(`there was an error deleting the database entry: \n ${err.message}`);
                  message.channel.send(`:x: Une erreur est survenue lors de la tentative de supprimer l'entrée de la base de données : \`${err.message}\``);
                });
            });
          });
      } else {
        const bot = client;
        let i0 = 0;
        let i1 = 10;
        let page = 1;

        let description =
          `Total des serveurs - ${bot.guilds.cache.size || 0}\n\n` +
          bot.guilds.cache
            .sort((a, b) => b.memberCount - a.memberCount)
            .map(r => r)
            .map(
              (r, i) =>
                `**${i + 1}** - ${r.name} (${r.id}) | Membres: ${r.memberCount}`
            )
            .slice(0, 10)
            .join("\n\n");


        let button_next = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('next').setEmoji("▶️")
        let button_back = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('back').setEmoji("◀️")

        let button_row = new Discord.MessageActionRow().addComponents([button_back, button_next])

        let embed = new Discord.MessageEmbed()
          .setAuthor({ name: bot.user.tag, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

          .setFooter({ text: `Page - ${page}/${Math.ceil(bot.guilds.cache.size / 10) || 1}` })
          .setDescription(description);

        message.reply({
          embeds: [embed],
          components: [button_row],
          allowedMentions: { repliedUser: false }
        })
        .then(async msg => {
          const collector = message.channel.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 150000
          })
          collector.on("collect", async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Désolé, mais vous n'avez pas la permission d'utiliser ces bouttons !", ephemeral: true }).catch(() => { })
            await i.deferUpdate()

            if (i.customId === 'back') {
              i0 = i0 - 10;
              i1 = i1 - 10;
              page = page - 1;

              if (i0 + 1 < 0) {
                return msg.delete();
              }
              description =
                `Total des serveurs - ${bot.guilds.cache.size || 0}\n\n` +
                bot.guilds.cache
                  .sort((a, b) => b.memberCount - a.memberCount)
                  .map(r => r)
                  .map(
                    (r, i) =>
                      `**${i + 1}** - ${r.name} (${r.id}) | Membres: ${r.memberCount}`
                  )
                  .slice(i0, i1)
                  .join("\n\n");

              embed
                .setFooter({
                  text:
                    `Page - ${page}/${Math.round(bot.guilds.cache.size / 10 + 1) || 1}`
                })
                .setDescription(description);

              msg.edit({ embeds: [embed] })
                .catch(err => {
                  console.log(`there was an error editing the message: \n ${err.message}`);
                  message.channel.send(`:x: Une erreur est survenue lors de la tentative de modifier le message : \`${err.message}\``);
                });
            }

            if (i.customId === 'next') {
              i0 = i0 + 10;
              i1 = i1 + 10;
              page = page + 1;
              if (i1 > bot.guilds.cache.size + 10) {
                return msg.delete();
              }
              if (!i0 || !i1) {
                return msg.delete();
              }
              description =
                `Total des serveurs - ${bot.guilds.cache.size || 0}\n\n` +
                bot.guilds.cache
                  .sort((a, b) => b.memberCount - a.memberCount)
                  .map(r => r)
                  .map(
                    (r, i) =>
                      `**${i + 1}** - ${r.name} (${r.id}) | Membres: ${r.memberCount}`
                  )
                  .slice(i0, i1)
                  .join("\n\n");

              embed
                .setFooter({
                  text:
                    `Page - ${page}/${Math.round(bot.guilds.cache.size / 10 + 1) || 1}`
                })
                .setDescription(description);

              msg.edit({ embeds: [embed] })
                .catch(err => {
                  console.log(`there was an error editing the message: \n ${err.message}`);
                  message.channel.send(`:x: Une erreur est survenue lors de la tentative de modifier le message : \`${err.message}\``);
                });
            }

            await i.users.remove(message.author.id)
              .catch(err => {
                console.log(`there was an error removing the user from the reaction: \n ${err.message}`);
                message.channel.send(`:x: Une erreur est survenue lors de la tentative de supprimer l'utilisateur de la réaction : \`${err.message}\``);
              });
          });
          collector.on("end", async () => {
            button_row.components[0].setDisabled(true);
            button_row.components[1].setDisabled(true);
            return msg.edit({ embeds: [embed], components: [button_row] })
              .catch(err => {
                console.log(`there was an error editing the message: \n ${err.message}`);
                message.channel.send(`:x: Une erreur est survenue lors de la tentative de modifier le message : \`${err.message}\``);
              });
          })
        })
        .catch(err => {
          console.log(`there was an error replying to the message: \n ${err.message}`);
          message.channel.send(`:x: Une erreur est survenue lors de la tentative de répondre au message : \`${err.message}\``);
        });
      }
    } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)
  }
}
