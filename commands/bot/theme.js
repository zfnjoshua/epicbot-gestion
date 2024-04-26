const db = require("quick.db")
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "theme",
    description: "Change the color of the bot's embeds",
    aliases: ["embedcolor", "thème"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,cmd.name)
        if (perm == true) {
            if (!args[0]) return message.reply(":x: You did not specify a color!")

            // Check if the argument is a valid hex color code
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(args[0])) {
                return message.reply(":x: The color must be a valid hex color code!")
            }

            let embed = new Discord.MessageEmbed()
                .setTitle("Les embeds seront désormais de cette couleur")
                .setDescription(`L'embed n'a pas de couleur ? C'est ta faute, pas la nôtre :/\nCliques [ici](https://htmlcolorcodes.com/fr/) pour voir toutes les couleurs !`)
                .setColor(args[0])

            let button_next = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('cancel').setEmoji("❌")
            let button_reset = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('reset').setEmoji("♻️")
            let button_back = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('valid').setEmoji("✔️")
            let button_row = new Discord.MessageActionRow().addComponents([button_back, button_reset, button_next])

            // Ensure the author's message is not being reacted to
            message.reply({ embeds: [embed], components: [button_row] }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({
                    componentType: "BUTTON",
                    time: 60000
                })

                collector.on("collect", async (i) => {
                    // Ensure the message being reacted to is the one sent by the bot
                    if (i.message.author.id !== client.user.id) return

                    // Ensure the user reacting is the author of the command
                    if (i.user.id !== message.author.id) return i.reply({ content: "Désolé, mais vous n'avez pas la permission d'utiliser ces boutons !", ephemeral: true }).catch(() => { })

                    await i.deferUpdate()

                    // Check if the customId matches the expected values
                    if (i.customId === 'valid') {
                        message.channel.send(`:white_check_mark: La couleur des embed a bien été modifiée !`)
                        try {
                            await db.set(`${message.guild.id}.color`, args[0])
                        } catch (err) {
                            console.error(err)
                            message.channel.send(`:x: Une erreur est survenue lors de la modification de la couleur des embeds !`)
                        }
                    }
                    if (i.customId === 'reset') {
                        message.channel.send(`♻️ La couleur des embed a bien été reset !`)
                        try {
                            await db.set(`${message.guild.id}.color`, client.config.color)
                        } catch (err) {
                            console.error(err)
                            message.channel.send(`:x: Une erreur est survenue lors du reset de la couleur des embeds !`)
                        }
                    }
                    if (i.customId === 'cancel') {
                        message.channel.send(`:white_check_mark: Action annulée !`)
                    }
                })

                collector.on("end", async () => {
                    // Ensure the collector has ended before editing the message
                    if (collector.ended) {
                        msg.edit({ components: [] }).catch(() => { })
                    }
                })
            })

        } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

    }
}
