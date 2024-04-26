const db = require("quick.db");
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "tempvoc",
    description: "Configure les vocaux temporaire",
    aliases: ["temp-voc"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, cmd.name);
        if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) {
                return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`);
            }
        }

        let dureefiltrer = m => message.author.id === m.author.id;

        message.channel.send(`Chargement en cours...`).then(async m => {
            await update(m);
            const collector = m.createMessageComponentCollector({
                componentType: "SELECT_MENU",
                time: 1800000
            });

            collector.on("collect", async (select) => {
                if (select.user.id !== message.author.id) return select.reply({ content: "Vous n'avez pas la permission !", ephemeral: true }).catch(() => { });
                let value = select.values[0];

                if (value === "auto") {
                    message.channel.send(` ✨ Création de la catégorie des salons personnalisé en cours..`).then(msg => {
                        m.guild.channels.create('Salon temporaire', {
                            type: 'GUILD_CATEGORY',
                            permissionsOverwrites: [{
                                id: message.guild.id,
                                allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
                            }]
                        }).then(async (c) => {
                            db.set(`${message.guild.id}.tempvoc.category`, c.id);
                            try {
                                await c.guild.channels.create('➕ Crée ton salon', {
                                    type: 'GUILD_VOICE',
                                    parent: c.id,
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.id,
                                            allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
                                        },
                                    ],
                                });
                            } catch (err) {
                                console.error(err);
                                return msg.edit(`✨ Création de la catégorie des salons personnalisé effectué avec succès !`).catch(() => { });
                            }
                            db.set(`${message.guild.id}.tempvoc.channel`, c.id);
                            db.set(`${message.guild.id}.tempvoc.emoji`, "🕙");
                            update(m);
                            msg.edit(`✨ Création de la catégorie des salons personnalisé effectué avec succès !`).catch(() => { });
                        }).catch((err) => {
                            console.error(err);
                            msg.edit(`✨ Création de la catégorie des salons personnalisé effectué avec succès !`).catch(() => { });
                        });
                    });
                } else if (value === "catego") {
                    message.channel.send(`📖 Veuillez entrée l'ID de la catégorie:`).then(mp => {
                        mp.channel.awaitMessages({ filter: dureefiltrer, max: 1, time: 30000, errors: ['time'] })
                            .then(cld => {
                                const msg = cld.first();
                                const categoryId = msg.content;
                                const category = message.guild.channels.cache.get(categoryId);

                                if (!category) return message.channel.send(` 📖 Catégorie incorrect !`);
                                if (category.type !== "GUILD_CATEGORY") return message.channel.send(` 📖 Ce n'est pas une catégorie !`);

                                db.set(`${message.guild.id}.tempvoc.category`, categoryId);
                                message.channel.send(`📖 Vous avez changé le salon de la catégorie à \`${category.name}\``).catch(() => { });
                                update(m);
                                mp.delete();
                            })
                            .catch((err) => {
                                console.error(err);
                                mp.delete();
                            });
                    });
                } else if (value === "channel") {
                    message.channel.send(`🏷️ Veuillez envoyer le salon vocal à rejoindre:`).then(mp => {
                        mp.channel.awaitMessages({ filter: dureefiltrer, max: 1, time: 30000, errors: ['time'] })
                            .then(cld => {
                                const msg = cld.first();
                                const channelId = msg.mentions.channels.first()?.id || msg.content;
                                const channel = message.guild.channels.cache.get(channelId);

                                if (!channel) return message.channel.send(`🏷️ Salon incorrect.`);
                                if (channel.type !== "GUILD_VOICE" && channel.type !== "GUILD_STAGE") return message.channel.send(`🏷️ Ce n'est pas un salon vocal !`);

                                db.set(`${message.guild.id}.tempvoc.channel`, channelId);
                                message.channel.send(`🏷️ Vous avez changé le salon de création à \`${channel.name}\``).catch(() => { });
                                update(m);
                                mp.delete();
                            })
                            .catch((err) => {
                                console.error(err);
                                mp.delete();
                            });
                    });
                } else if (value === "emoji") {
                    message.channel.send(`🎗️ Veuillez envoyer l'emoji/prefix du salon que vous souhaitez:`).then(mp => {
                        mp.channel.awaitMessages({ filter: dureefiltrer, max: 1, time: 30000, errors: ['time'] })
                            .then(cld => {
                                const msg = cld.first();
                                const emoji = msg.content;

                                db.set(`${message.guild.id}.tempvoc.emoji`, emoji);
                                message.channel.send(` 🎗️ Vous avez modifié l'emoji à \`${emoji}\` !`).catch(() => { });
                                update(m);
                                mp.delete();
                            })
                            .catch((err) => {
                                console.error(err);
                                mp.delete();
                            });
                    });
                } else if (value === "active") {
                    let actual = db.fetch(`${message.guild.id}.tempvoc.active`);
                    if (!actual) {
                        db.set(`${message.guild.id}.tempvoc.active`, true);
                    } else {
                        db.delete(`${message.guild.id}.tempvoc.active`);
                    }
                    update(m);
                }
            });

            collector.on("end", async () => {
                return m.edit({ content: "Expiré !", components: [] }).catch(() => { });
            });
        });

        async function update(m) {
            const categoryId = db.fetch(`${message.guild.id}.tempvoc.category`);
            const category = categoryId ? message.guild.channels.cache.get(categoryId) : null;

            const channelId = db.fetch(`${message.guild.id}.tempvoc.channel`);
            const channel = channelId ? message.guild.channels.cache.get(channelId) : null;

            const emoji = db.fetch(`${message.guild.id}.tempvoc.emoji`);

            const actual = db.fetch(`${message.guild.id}.tempvoc.active`);

            const msgembed = new Discord.MessageEmbed()
                .setTitle(`🕙 Modification des salons temporaires de ${message.guild.name}`)
                .setColor(db.fetch(`${message.guild.id}.color`))
                .addField("`📩` Activé", actual ? ":white_check_mark:" : ":x:", true)
                .addField("`📖` Catégorie", category ? category.name : ":x:", true)
                .addField("`🏷️` Salon", channel ? `<#${channel.id}>` : ":x:", true)
                .addField("`🎗️` Emoji", emoji ? emoji : ":x:", true);

            const roww = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageSelectMenu()
                        .setCustomId('config')
                        .setPlaceholder('Modifier un paramètre')
                        .addOptions([
                            {
                                label: 'Activer/Désactiver le module',
                                value: 'active',
                                emoji: "📩"
                            },
                            {
                                label: 'Créer automatiquement',
                                value: 'auto',
                                emoji: "✨"
                            },
                            {
                                label: 'Modifier la catégorie',
                                value: 'catego',
                                emoji: "📖"
                            },
                            {
                                label: 'Modifier le salon',
                                value: 'channel',
                                emoji: "🏷️"
                            },
                            {
                                label: 'Modifier l\'emoji',
                                value: 'emoji',
                                emoji: "🎗️"
                            }
                        ])
                );

            m.edit({ content: " ", embeds: [msgembed], components: [roww] }).catch((err) => {
                console.error(err);
            });
        }
    }
};
