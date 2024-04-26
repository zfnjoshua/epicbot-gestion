const { checkperm } = require("../../base/functions");
const db = require('quick.db')
const Discord = require('discord.js')

module.exports = {
    name: "latence",
    description: "Affiche la latence générale des bots",

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, "ping")

        if (perm === false) {
            if (db.fetch(`${message.guild.id}.vent`)) return;
            return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`ping\` !`);
        }

        const SystemPing = Math.round(client.ws.ping);

        if (typeof SystemPing !== 'number') {
            return message.reply('Une erreur est survenue lors de la récupération de la latence.');
        }

        const color = db.fetch(`${message.guild.id}.color`);

        if (color && typeof color === 'string') {
            try {
                new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`La latence globale est de \`${SystemPing}ms\``)
            } catch (e) {
                return message.reply('Une erreur est survenue lors de la création de l\'embed.');
            }
        } else {
            try {
                message.reply({
                    embeds: [new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setDescription(`La latence globale est de \`${SystemPing}ms\``)]
                });
            } catch (e) {
                return message.channel.send('Une erreur est survenue lors de l\'envoi du message.');
            }
        }
    }
}
