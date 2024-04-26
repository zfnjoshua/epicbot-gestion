const { stripIndents } = require("common-tags");
const { MessageButton, MessageActionRow } = require('discord.js');
const db = require("quick.db");
const { checkperm } = require("../../base/functions");

module.exports = {
  name: "help",
  description: "Affiche les commandes du bot",
  aliases: ["aide"],

  run: async (client, message, args, cmd) => {
    const perm = await checkperm(message, "help");
    if (!perm) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`help\` !`);

    const prefix = await db.get(`prefix.${message.guild.id}`) || client.config.prefix;
    let color = db.fetch(`${message.guild.id}.color`) || client.config.color;

    if (!args[0]) {
      const button_next = new MessageButton().setStyle('PRIMARY').setCustomId('next').setEmoji("▶️");
      const button_back = new MessageButton().setStyle('PRIMARY').setCustomId('back').setEmoji("◀️");
      const button_row = new MessageActionRow().addComponents([button_back, button_next]);

      const subFolders = fs.readdirSync('././commands');

      const page0 = embed(`:bust_in_silhouette: **• ${client.user.username}**`, `Prefix du serveur: \`${prefix}\`\n\n**Ce bot à pour objectif de gérer facilement votre serveur ainsi que ses permissions.**\n\n[\`Support du bot\`](https://discord.gg/DEyr5YYEQ2)  |  [\`Lien pour m'ajouter\`](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=24)\n\n_Appuyez sur les flèches ci-dessous pour changer de page !_`, undefined, `https://cdn.discordapp.com/attachments/1001147082125606983/1001912671429472316/unknown.png`);
      const page1 = embed(':scales: **• Modération**', undefined, subFolders[5]);
      const page2 = embed('🛡️ **• Protection**', undefined, subFolders[10]);
      const page3 = embed('💎 **• Configuration**', undefined, subFolders[1]);
      const page10 = embed('🎓 **• Gestion Permissions**', undefined, subFolders[8]);
      const page5 = embed('👤 **• Utilitaire**', undefined, subFolders[11]);
      const musik = embed('🎶 **• Musique**', undefined, subFolders[6]);
      const gw = embed('🎉 **• Giveaway**', undefined, subFolders[3]);
      const page7 = embed('📍 **• Owner**', undefined, subFolders[7]);
      const bot = embed('⚙️ **• Bot**', undefined, subFolders[0]);
      const page8 = embed('📃 **• Logs**', undefined, subFolders[4]);
      const page6 = embed('🎭 **• Fun**', undefined, subFolders[2]);
      const page9 = embed('🔪 **• Prison**', undefined, subFolders[9]);

      const pages = [page0, page1, page2, page8, page10, page5, gw, musik, page3, page6, page7, bot, page9];

      let currentPage = 0;
      pages[currentPage].setFooter({ text: `©️ E-Gestion | By Millenium is here#4444` });

      const msg = await message.reply({
        embeds: [pages[currentPage]],
        components: [button_row],
        allowedMentions: { repliedUser: false }
      });

      const collector = msg.createMessageComponentCollector({
        componentType: "BUTTON",
        time: 150000
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== message.author.id) return i.reply({ content: "Désolé, mais vous n'avez pas la permission d'utiliser ces boutons !", ephemeral: true }).catch(() => { });
        await i.deferUpdate();

        if (i.customId === 'next') {
          currentPage = (currentPage + 1) % pages.length;
          pages[currentPage].setFooter({ text: `Page ${currentPage + 1}/${pages.length} | By Millenium is here#4444`, iconURL: client.user.displayAvatarURL() });
          msg.edit({ embeds: [pages[currentPage]] });
        }

        if (i.customId === 'back') {
          currentPage = (currentPage - 1 + pages.length) % pages.length;
          pages[currentPage].setFooter({ text: `Page ${currentPage + 1}/${pages.length} | By Millenium is here#4444`, iconURL: client.user.displayAvatarURL() });
          msg.edit({ embeds: [pages[currentPage]] });
        }
      });

      collector.on("end", async () => {
        button_row.components.forEach(b => b.setDisabled(true));
        return msg.edit({ embeds: [pages[currentPage]], components: [button_row] }).catch(() => { });
      });
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({ name: "Page d'aide de la commande " + args[0], iconURL: "https://cdn.discordapp.com/attachments/851876715835293736/852647593020620877/746614051601252373.png" });

      let command;
      if (client.commands.has(args[0].toLowerCase())) {
        command = client.commands.get(args[0].toLowerCase());
      } else if (client.aliases.has(args[0].toLowerCase())) {
        command = client.commands.get(client.aliases.get(args[0].toLowerCase()));
      }

      if (!command) return message.channel.send(":x: Commande innexistante !");

      embed.setDescription(stripIndents`
          ** Commande -** [    \`${command.name.slice(0, 1).toUpperCase() + command.name.slice(1)}\`   ]\n
          ** Description -** [    \`${command.description || "Pas de description renseignée."}\`   ]\n
          ** Usage -** [   \`${command.usage ? `\`${command.usage}\`` : "Pas d'utilisation conseillée"}\`   ]\n
          ** Aliases -** [   \`${command.aliases ? command.aliases.join(" , ") : "Aucun"}\`   ]`);
      embed.setFooter({ text: `©️ E-Gestion | By Millenium is here#4444` });

      return message.channel.send({ embeds: [embed] });
    }
  }
};

function embed(title, description, category, image) {
  const array = [];
  if (category) {
    const commandsFiles = fs.readdirSync(`././commands/${category}`).filter(file => file.endsWith('.js'));
    for (const commandFile of commandsFiles) {
      const command = require(`../../commands/${category}/${commandFile}`);
      array.push(`\`${prefix}${command.name}\`\n${command.description}`);
    }
  }
  return new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(title ? title : "Aucun auteur pour l'embed !")
    .setImage(image ? image : "")
    .setDescription(description ? description : category && array.length > 0 ? array.join("\n\n") : "Pas de description précisée");
}
