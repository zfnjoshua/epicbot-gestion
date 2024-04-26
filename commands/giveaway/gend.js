const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require('discord.js');
const quickDB = require('quick.db');
const { checkperm } = require('../../base/functions');

module.exports = {
  name: 'gend',
  description: 'Arrête un giveaway',
  aliases: ['gstop', 'g-end'],

  run: async (client, message, args) => {
    const perm = await checkperm(message, this.name);
    if (perm === false) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${this.name}\` !`);

    const giveawayId = args[0] || quickDB.get(`${message.guild.id}.last-giveaway.${message.channel.id}`);
    const giveawayData = quickDB.get(`${message.guild.id}.giveaway.${giveawayId}`);

    if (!giveawayData) return message.reply(`:x: Je ne trouve pas ce giveaway !`);

    quickDB.delete(`${message.guild.id}.giveaway.${giveawayId}`);

    const channel = message.guild.channels.cache.get(giveawayData.channelId);
    if (!channel) return message.reply(`:x: Je ne trouve pas ce salon !`);

    const msg = await channel.messages.fetch(giveawayData.messageId).catch(() => null);
    if (!msg) return message.reply(`:x: Je ne trouve pas le message du giveaway !`);

    await msg.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`:tada: Giveaway: ${giveawayData.prize}`)
          .setDescription(`Giveaway Terminé`)
          .setColor(quickDB.get(`${message.guild.id}.color`) || '#FF0000')
      ],
      components: []
    });

    const participants = quickDB.get(`${message.guild.id}.participants-giveaway.${giveawayId}`);
    quickDB.delete(`${message.guild.id}.participants-giveaway.${giveawayId}`);

    const winnersCount = giveawayData.winners || 1;
    if (!participants || participants.length < winnersCount) return channel.send(`Il n'y a pas assez de participants !`);

    const winners = [];
    for (let i = 0; i < winnersCount; i++) {
      const winner = participants[Math.floor(Math.random() * participants.length)];
      if (!winner) continue;

      winners.push(winner);
      participants.splice(participants.indexOf(winner), 1);
    }

    channel.send(`:tada: Félicitations à ${winners.map(id => `<@${id}>`).join(', ')} qui ${winners.length > 1 ? 'viennent' : 'vient'} de gagner \`${giveawayData.prize}\` !`);
    message.channel.send('Giveaway terminé !');
  }
};
