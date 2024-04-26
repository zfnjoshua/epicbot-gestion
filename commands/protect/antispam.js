const db = require("quick.db");
const Discord = require('discord.js');
const rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "antispam",
    description: "Configure the anti-spam",
    usage: "antispam <off/on/max/allow/deny> <sensitivity>",
    aliases: ["anti-spam"],

    run: async (client, message, args, cmd) => {
        let b = db.fetch(`${message.guild.id}.botowner`)
        let perm = await checkperm(message, "anti")

        if (perm == true || b && b.includes(message.author.id)) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Please wait before performing another action!`)

            const validActions = ["on", "off", "max", "allow", "deny"];
            if (!args[0] || !validActions.includes(args[0])) return message.reply(`:x: Please specify a valid action. Valid actions are: \`${validActions.join("/")}\`!`)

            let sensibilite = args[1];
            let slashIndex = sensibilite ? sensibilite.indexOf("/") : -1;
            if (args[0] === "on" || args[0] === "max") {
                if (sensibilite && (slashIndex === -1 || isNaN(sensibilite.substring(0, slashIndex)) || sensibilite[slashIndex] !== "/" || isNaN(sensibilite.substring(slashIndex + 1, sensibilite.length)))) return message.reply(`:x: Please specify a valid sensitivity in the format \`number/number\`!`)
            }

            let newSetting;
            switch (args[0]) {
                case "on":
                    newSetting = { spam: "on" };
                    if (sensibilite) newSetting.spam_sensi = sensibilite;
                    break;
                case "off":
                    newSetting = { spam: "off" };
                    break;
                case "max":
                    newSetting = { spam: "max" };
                    if (sensibilite) newSetting.spam_sensi = sensibilite;
                    break;
                case "allow":
                    if (!args[1]) return message.reply(`:x: Please specify a channel to allow!`)
                    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                    if (!channel) return message.reply(`:x: Please specify a valid channel to allow!`)
                    newSetting = { spam: "on", spam_allow: [...(db.fetch(`${message.guild.id}.anti.spam_allow`) || []), channel.id] };
                    break;
                case "deny":
                    if (!args[1]) return message.reply(`:x: Please specify a channel to deny!`)
                    let channel2 = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                    if (!channel2) return message.reply(`:x: Please specify a valid channel to deny!`)
                    let channels = db.fetch(`${message.guild.id}.anti.spam_allow`) || [];
                    channels = channels.filter(e => e !== channel2.id);
                    newSetting = { spam: "on", spam_allow: channels };
                    break;
            }

            Object.keys(newSetting).forEach(key => {
                db.set(`${message.guild.id}.anti.${key}`, newSetting[key]);
            });

            message.reply(`:shield: The \`antispam\` is now set to \`${args[0]}\`${sensibilite ? " - \`" + sensibilite + "\"": ""}${args[0] === "on" ? " (_ignoring bot owner messages_)" : ""} `)

            rslow.action[message.author.id] = true;
            setTimeout(() => {
                rslow.action[message.author.id] = false;
            }, db.fetch(`${message.guild.id}.actionslow`));
            let logchannel = db.fetch(`${message.guild.id}.raidlogs`)
            logchannel = message.guild.channels.cache.get(logchannel)
            if (logchannel) logchannel.send({
                embeds: [new Discord.MessageEmbed()
                    .setColor(db.fetch(`${message.guild.id}.color`))
                    .setDescription(`${message.author} has changed the antispam to \`${args[0]}\`!`)]
            }).catch(e => { e })
        } else if (perm === false) if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: You don't have permission to use the \
