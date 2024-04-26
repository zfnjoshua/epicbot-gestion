const db = require("quick.db")
const Discord = require('discord.js');
var rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "antiroleupdate",
    description: "Configure l'anti création/modification de rôle",
    usage: "antiroleupdate <off/on/max>",
    aliases: ["anti-roleupdate"],

    run: async (client, message, args, cmd) => {
        let b = db.fetch(`${message.guild.id}.botowner`)
        let perm = await checkperm(message, "anti")

        if (!perm && !b.includes(message.author.id)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`anti\` !`)

        if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`)

        if (!args[0]) return message.reply(`:x: Veuillez spécifier un état pour l'antiroleupdate ! (on/off/max)`)

        if (args[0] === "on") {
            if (db.fetch(`${message.guild.id}.anti.roleupdate`) === "on") return message.reply(`:x: L'antiroleupdate est déjà activé !`)
            db.set(`${message.guild.id}.anti.roleupdate`, "on")
        } else if (args[0] === "off") {
            if (db.fetch(`${message.guild.id}.anti.roleupdate`) === "off") return message.reply(`:x: L'antiroleupdate est déjà désactivé !`)
            db.delete(`${message.guild.id}.anti.roleupdate`)
        } else if (args[0] === "max") {
            if (!db.fetch(`${message.guild.id}.maxroles`)) return message.reply(`:x: Veuillez définir le nombre maximum de rôles autorisés avec \`${cmd.config.prefix}setmaxroles\` !`)
            db.set(`${message.guild.id}.anti.roleupdate`, "max")
        } else {
            return message.reply(`:x: L'argument fourni est invalide ! (on/off/max)`)
        }

        message.reply(`:shield: L'\`antiroleupdate\` est désormais sur \`${args[0]}\`${args[0] === "on" ? " (_les membres wl sont ignorés_)" : ""}`)

        rslow.action[message.author.id] = true;
        setTimeout(() => {
            rslow.action[message.author.id] = false;
        }, db.fetch(`${message.guild.id}.actionslow`)).catch(e => { e })

        let logchannel = db.fetch(`${message.guild.id}.raidlogs`)
        if (logchannel) {
            logchannel = message.guild.channels.cache.get(logchannel)
            if (logchannel) logchannel.send({
                embeds: [new Discord.MessageEmbed()
                    .setColor(db.fetch(`${message.guild.id}.color`))
                    .setDescription(`${message.author} a modifié l'antiroleupdate sur \`${args[0]}\` !`)]
            }).catch(e => { e })
        }

        if (db.fetch(`${message.guild.id}.vent`) && db.fetch(`${message.guild.id}.vent`) === true) return;

        if (args[0] === "on") {
            if (db.fetch(`${message.guild.id}.maxroles`) && db.fetch(`${message.guild.id}.maxroles`) > 0) {
                message.channel.send({
                    embeds: [new Discord.MessageEmbed()
                        .setColor("RED")
                        .setDescription(`:x: Le nombre maximum de rôles autorisés est de \`${db.fetch(`${message.guild.id}.maxroles`)}\`. Veuillez le réduire avec \`${cmd.config.prefix}setmaxroles\` !`)
                    ]
                })
                return;
            }
        }
    }
}
