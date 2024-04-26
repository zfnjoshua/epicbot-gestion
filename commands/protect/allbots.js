const db = require("quick.db")
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");
module.exports = {
    name: "allbots",
    description: "Envois une liste de tous les bots du serveur",
    aliases: ["bots", "botlist"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,cmd.name)
        if (perm == true) {
            let count = 0
            let member;
            try {
                member = message.guild.members.cache.filter(m => m.user.bot);
            } catch (error) {
                return message.reply(":x: Une erreur est survenue lors de la récupération des membres.");
            }

            if (!member.length) {
                return message.reply(":x: Il n'y a pas de bots dans ce serveur");
            } else {
                let embeds = {};
                let page = 0;

                const size = 10;
                let memberarray = [];

                for (let i = 0; i < member.length; i += size) {
                    const allMembers = member.slice(i, i + size);
                    memberarray.push(allMembers);
                }
                memberarray.forEach((chunk, i) => embeds[i] = chunk);

                const row = new Discord.MessageActionRow().addComponents([
                    new Discord.MessageButton()
                        .setStyle('PRIMARY')
                        .setEmoji('⬅️')
                        .setCustomId('left'),

                    new Discord.MessageButton()
                        .setStyle('PRIMARY')
                        .setEmoji('➡️')
                        .setCustomId('right'),
                ])


                let embed = new Discord.MessageEmbed()
                embed.setTitle(`${member.length > 1 ? `Voici la liste des bots du serveur (${member.length})` : `Voici le bot du serveur (1)`}`)
                embed.setColor(client.config.color)
                embed.setFooter({ text: `Page ${page + 1}/${memberarray.length}` })
                embed.setDescription(embeds[0].join('\n'));

                if (memberarray.length === 1) {
                    await message.reply({
                        embeds: [embed],
                    })
                } else {
                    try {
                        const messages = await message.reply({
                            embeds: [embed],
                            components: [row]
                        });

                        const collector = messages.createMessageComponentCollector({
                            componentType: "BUTTON",
                            time: 60000,
                        })
                        collector.on("collect", async (interaction) => {
                            if (!interaction.deferred) await interaction.deferUpdate();
                            if (interaction.user.id !== message.author.id) return interaction.reply({ content: "Vous n'avez pas la permission !", ephemeral: true }).catch(() => { })

                            if (interaction.customId === "left") {
                                if (page == parseInt(Object.keys(embeds).shift())) page = parseInt(Object.keys(embeds).pop())
                                else page--;
                                if (!embeds[page]) return interaction.reply({ content: "Erreur de page !", ephemeral: true }).catch(() => { })
                                embed.setDescription(embeds[page].join('\n'))
                                embed.setFooter({ text: `Page ${page + 1}/${memberarray.length}` })

                                interaction.editReply({
                                    embeds: [embed],
                                    components: [row]
                                }).catch(() => null)
                            }

                            if (interaction.customId === "right") {
                                if (page == parseInt(Object.keys(embeds).pop())) page = parseInt(Object.keys(embeds).shift())
                                else page++;
                                if (!embeds[page]) return interaction.reply({ content: "Erreur de page !", ephemeral: true }).catch(() => { })
                                embed.setDescription(embeds[page].join('\n'))
                                embed.setFooter({ text: `Page ${page + 1}/${memberarray.length}` })

                                interaction.editReply({
                                    embeds: [embed],
                                    components: [row]
                                }).catch(() => null)
                            }
                        });

                        collector.on("end", async () => {
                            return interaction.editReply({ content: "Expiré !", components: [] }).catch(() => { })
                        })
                    } catch (error) {
                        return message.reply(":x: Une erreur est survenue lors de l'envoi du message.");
                    }
                }
            }
        } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

    
    }
}
