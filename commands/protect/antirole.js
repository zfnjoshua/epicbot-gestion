const db = require("quick.db")
const Discord = require('discord.js');
var rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");
module.exports = {
    name: "antirole",
    description: "Configure l'anti ajout rôle",
    usage: "antirole <off/on/max>",
    aliases: ["anti-role"],

    run: async (client, message, args, cmd) => {
        let b = db.fetch(`${message.guild.id}.botowner`)
        let perm = await checkperm(message, "anti")
        if (perm == true || b && b.includes(message.author.id)) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`).catch(e => { console.error(e) })
            if (args.length < 1) return message.reply(`:x: Merci de préciser un état pour l'antirole !`).catch(e => { console.error(e) })
            let antiRole = db.fetch(`${message.guild.id}.anti.role`)
            if (!['on', 'off', 'max'].includes(args[0])) return message.reply(`:x: L'état fourni est invalide ! Merci d'utiliser "on", "off" ou "max".`).catch(e => { console.error(e) })
            try {
                if (args[0] === "on") { db.set(`${message.guild.id}.anti.role`, "on") } else
                    if (args[0] === "off") { db.delete(`${message.guild.id}.anti.role`) } else
                        if (args[0] === "max") { db.set(`${message.guild.id}.anti.role`, "max") }
            } catch (e) {
                console.error(e)
                return message.reply(`:x: Une erreur est survenue lors de la modification de l'antirole !`).catch(e => { console.error(e) })
            }
            try {
                message.reply(`:shield: L'\`antirole\` est désormais sur \`${args[0]}\`${args[0] === "on" ? " (_les membres wl sont ignorés_)" : ""}`).catch(e => { console.error(e) })
            } catch (e) {
                console.error(e)
            }

            rslow.action[message.author.id] = true;
            try {
                setTimeout(() => {
                    rslow.action[message.author.id] = false;
                }, db.fetch(`${message.guild.id}.actionslow`));
            } catch (e) {
                console.error(e)
            }
            let logchannel = db.fetch(`${message.guild.id}.raidlogs`)
            try {
                logchannel = message.guild.channels.cache.get(logchannel)
            } catch (e) {
                console.error(e)
                return
            }
            if (logchannel) try {
                logchannel.send({
                    embeds: [new Discord.MessageEmbed()
                        .setColor(db.fetch(`${message.guild.id}.color`))
                        .setDescription(`${message.author} a modifié l'antirole sur \`${args[0]}\` !`)]
                }).catch(e => { console.error(e) })
            } catch (e) {
                console.error(e)
            }
        } else if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`anti\` !`).catch(e => { console.error(e) })
        }
    }
}
