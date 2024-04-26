const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const db = require("quick.db");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "antijoin",
  description: "Configure l'antijoin dans un salon",
  aliases: ["aj-config", "anti-join"],

  run: async (client, message, args, cmd) => {
    let perm = await checkperm(message, cmd.name);
    if (perm === false)
      return message.reply(
        `:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`
      );

    const channel = message.member.voice.channel;
    if (!channel)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor(db.fetch(`${message.guild.id}.color`))
            .setTitle(`Voici les commandes anti-join`)
            .setDescription(
              `\`antijoin on\` : Active l'anti-join dans le salon actuel\n\`antijoin off\` : Désactive l'anti-join dans le salon actuel\n\`antijoin add <@member>\` : Autorise un membre à rejoindre votre salon antijoin\n\`antijoin remove <@member>\` : Retire la permission à un membre pouvant rejoindre`
            )
            .setFooter({ text: `Pour un anti-join de longue durée utiliser le bot VoiceManager` }),
        ],
      }).catch((e) => e);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("on")
        .setLabel("Activer")
        .setStyle("SUCCESS"),
      new MessageButton()
        .setCustomId("off")
        .setLabel("Désactiver")
        .setStyle("DANGER"),
      new MessageButton()
        .setCustomId("add")
        .setLabel("Ajouter membre")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("remove")
        .setLabel("Retirer membre")
        .setStyle("SECONDARY")
    );

    const embed = new MessageEmbed()
      .setColor(db.fetch(`${message.guild.id}.color`))
      .setTitle(`Antijoin dans ${channel.name}`)
      .setDescription(
        `Cliquez sur le bouton ci-dessous pour configurer l'anti-join dans ce salon.`
      )
      .setFooter({ text: `Pour un anti-join de longue durée utiliser le bot VoiceManager` });

    const msg = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const filter = (button) => button.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on("collect", async (button) => {
      if (button.customId === "on") {
        if (db.fetch(`${message.guild.id}.antijoin_${channel.id}`))
          return button.reply({
            content: "Ce salon est déjà configuré comme anti-join !",
            ephemeral: true,
          });

        db.push(`${message.guild.id}.antijoin_${channel.id}`, message.author.id);
        db.set(
          `${message.guild.id}.antijoinowner_${channel.id}`,
          message.author.id
        );

        button.reply({
          content: `L'antijoin a bien été activé dans votre salon !\n_Pour le désactiver faites \`antijoin off\` ou quittez simplement le vocal_`,
          ephemeral: true,
        });
      } else if (button.customId === "off") {
        if (!db.fetch(`${message.guild.id}.antijoin_${channel.id}`))
          return button.reply({
            content: "Ce salon n'est pas configuré comme anti-join !",
            ephemeral: true,
          });

        let check = db.fetch(`${message.guild.id}.antijoin_${channel.id}`);
        if (!check.includes(message.author.id))
          return button.reply({
            content: "Ce n'est pas votre salon",
            ephemeral: true,
          });

        db.delete(`${message.guild.id}.antijoin_${channel.id}`);

        button.reply({
          content: `L'antijoin a bien été désactivé de votre salon !`,
          ephemeral: true,
        });
      } else if (button.customId === "add") {
        if (!db.fetch(`${message.guild.id}.antijoin_${channel.id}`))
          return button.reply({
            content: "Ce salon n'est pas configuré comme anti-join !\n_Utilisez \`antijoin on\` !_",
            ephemeral: true,
          });

        let check = db.fetch(`${message.guild.id}.antijoinowner_${channel.id}`);
        if (check && check !== message.author.id)
          return button.reply({
            content: "Vous n'êtes pas propriétaire du salon",
            ephemeral: true,
          });

        const member =
          message.mentions.members.first() ||
          message.guild.members.cache.get(args[1]);
        if (!member)
          return button.reply({
            content: "Utilisateur invalide !",
            ephemeral: true,
          });

        db.push(`${message.guild.id}.antijoin_${channel.id}`, member.id);

        button.reply({
          content: `**${member.user.username}** peut désormais rejoindre votre salon !`,
          ephemeral: true,
        });
      } else if (button.customId === "remove") {
        if (!db.fetch(`${message.guild.id}.antijoin_${channel.id}`))
          return button.reply({
            content: "Ce salon n'est pas configuré comme anti-join !\n_Utilisez \`antijoin on\` !_",
            ephemeral: true,
          });

        let check = db.fetch(`${message.guild.id}.antijoinowner_${channel.id}`);
        if (check && check !== message.author.id)
          return button.reply({
            content: "Vous n'êtes pas propriétaire du salon",
            ephemeral: true,
          });

        const member =
          message.mentions.members.first() ||
          message.guild.members.cache.get(args[1]);
        if (!member)
          return button.reply({
            content: "Utilisateur invalide !",
            ephemeral: true,
          });

        let members = db.fetch(`${message.guild.id}.antijoin_${channel.id}`);
        if (!members.includes(member.id))
          return button.reply({
            content: "Le membre n'avait pas accès à votre salon",
            ephemeral: true,
          });

        const filtered = members.filter((e) => e !== member.id);
        db.set(`${message.guild.id}.antijoin_${channel.id}`, filtered);

        button.reply({
          content: `**${member.user.username}** ne peut plus rejoindre votre vocal !`,
          ephemeral: true,
        });

        if (member.voice)
          member.voice.setChannel(null, "Anti-Join by " + message.author.tag);
      }

      collector.stop();
    });

    collector.on("end", (button) => {
      msg.edit({
        embeds: [embed],
        components: [],
      });
    });
  },
};
