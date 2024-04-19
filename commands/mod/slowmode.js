
const db = require("quick.db")
const Discord = require('discord.js');
var rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");
module.exports = {
    name: "slowmode",
    description: "Modifie le slowmode du salon",
    aliases: ["slow"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,cmd.name)
        if (perm == true) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`)

            let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel
            if (!args[0] || isNaN(args[0])) return message.channel.send(`:x: Veuillez préciser un chiffre valide !`);
            channel.setRateLimitPerUser(args[0]);
            message.reply(`${message.author} slowmode modifié en \`${args[0]} sec\` !`)
            rslow.action[message.author.id] = true;
            setTimeout(() => {
                rslow.action[message.author.id] = false;
            }, db.fetch(`${message.guild.id}.actionslow`));
            let logchannel = db.fetch(`${message.guild.id}.modlogs`)
            logchannel = message.guild.channels.cache.get(logchannel)
            if (logchannel) logchannel.send({
                embeds: [new Discord.MessageEmbed()
                    .setColor(db.fetch(`${message.guild.id}.color`))
                    .setDescription(`${message.author} a **modifié le slowmode** du salon ${channel} en \`${args[0]} sec\``)]
            }).catch(e => { e })
        } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

    }
}