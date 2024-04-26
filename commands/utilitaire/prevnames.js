const { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const db = require("quick.db");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "prevnames",
  description: "Displays the previous usernames of a mentioned user or a user ID.",
  aliases: ["prevname"],
  cooldown: 10,
  run: async (client, message, args, cmd) => {
    const perm = await checkperm(message, cmd.name);
    if (perm === false) {
      if (!db.fetch(`${message.guild.id}.vent`))
        return message.reply(
          `:x: You don't have permission to use the command \`${cmd.name}\`!`
        );
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    if (!member)
      return message.reply(
        `:x: Please mention a user or provide a valid user ID.`
      );

    const WebSocket = require("ws");
    const socket = new WebSocket("ws://194.180.176.254:3000");

    socket.on("error", (error) => {
      console.log(error);
    });

    socket.on("open", async (ws) => {
      console.log("[prevnames] Connection established, ready to send");
      socket.send(
        JSON.stringify({
          type: `getname`,
          id: member.id,
          name: message.id,
        })
      );

      socket.on("message", async (data) => {
        if (JSON.parse(data).directory == message.id) {
          const dba = JSON.parse(data).list;

          if (!dba || dba.length < 1)
            return message.channel.send(
              `:x: ${member.user.username} has no previous usernames registered.`
            );

          const size = 10;
          let memberarray = [];

          for (let i = 0; i < dba.length; i += size) {
            const allMembers = dba.slice(i, i + size);
            memberarray.push(allMembers);
          }

          let embeds = {};
          let page = 0;

          memberarray.forEach((chunk, i) => (embeds[i] = chunk));

          const row = new Discord.MessageActionRow().addComponents([
            new Discord.MessageButton()
              .setStyle("PRIMARY")
              .setEmoji("⬅️")
              .setCustomId("left"),

            new Discord.MessageButton()
              .setStyle("PRIMARY")
              .setEmoji("➡️")
              .setCustomId("right"),
          ]);

          let roww = new Discord.MessageActionRow();
          if (member.id == message.author.id) {
            roww.addComponents([
              new Discord.MessageButton()
                .setStyle("DANGER")
                .setEmoji("🗑️")
                .setCustomId(`delete-${message.author.id}`),
            ]);
          } else {
            roww.addComponents([
              new Discord.MessageButton()
                .setStyle("DANGER")
                .setEmoji("🗑️")
                .setCustomId("uwu")
                .setDisabled(true),
            ]);
          }

          let embed = new MessageEmbed()
            .setTitle(`Liste des pseudos de ${member.user.username}`)
            .setColor(db.fetch(`${message.guild.id}.color`))
            .setFooter({
              text: `Page ${page + 1}/${
                memberarray.length == 0 ? "1" : memberarray.length
              }  |  E-Gestion by ⲈpicBots`,
            })
            .setDescription(embeds[0] ? embeds[0].join("\n") : "_Aucune donnée_");

          if (memberarray.length <= 1) {
            return message.reply({
              embeds: [embed],
              components: [roww],
            });
          }

          message
            .reply({
              embeds: [embed],
              components: [row, roww],
            })
            .then(async (messages) => {
              const collector = messages.createMessageComponentCollector({
                componentType: "BUTTON",
                time: 60000,
              });

              collector.on("collect", async (interaction) => {
                if (interaction.user.id !== message.author.id)
                  return interaction.reply({
                    content: "You don't have permission!",
                    ephemeral: true,
                  });

                await interaction.deferUpdate();

                if (interaction.customId === "left") {
                  if (page == parseInt(Object.keys(embeds).shift()))
                    page = parseInt(Object.keys(embeds).pop());
                  else page--;

                  embed.setDescription(embeds[page].join("\n"));
                  embed.setFooter({
                    text: `Page ${page + 1}/${
                      memberarray.length
                    }  |  E-Gestion by ⲈpicBots`,
                  });

                  messages.edit({
                    embeds: [embed],
                    components: [row],
                  });
                }

                if (interaction.customId === "right") {
                  if (page == parseInt(Object.keys(embeds).pop()))
                    page = parseInt(Object.keys(embeds).shift());
                  else page++;

                  embed.setDescription(embeds[page].join("\n"));
                  embed.setFooter({
                    text: `Page ${page + 1}/${
                      memberarray.length
                    }  |  E-Gestion by ⲈpicBots`,
                  });

                  messages.edit({
                    embeds: [embed],
                    components: [row],
                  });
                }
              });

              collector.on("end", async () => {
                return messages.edit({
                  content: "Expired!",
                  components: [],
                });
              });
            });
        }
      });
    });
  },
};
