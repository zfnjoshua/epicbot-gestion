const db = require("quick.db");
const Discord = require('discord.js');
const rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "antichannel",
    description: "Configure the anti-channel",
    usage: "antichannel <off/on/max>",
    aliases: ["anti-channel"],

    run: async (client, message, args, cmd) => {
        const botOwner = db.fetch(`${message.guild.id}.botowner`);
        const perm = await checkperm(message, "anti");

        if (!(perm || botOwner && botOwner.includes(message.author.id))) {
            if (!db.fetch(`${message.guild.id}.vent`)) {
                return message.reply(`:x: You don't have permission to use the \`anti\` command!`);
            }
        }

        if (rslow.action[message.author.id]) {
            return message.channel.send(`:x: Please wait before performing another action!`);
        }

        const validOptions = ["on", "off", "max"];
        if (!validOptions.includes(args[0])) {
            return message.reply(`L'antichannel est sur \`${db.fetch(`${message.guild.id}.anti.channel`) || "off"}\` !`);
        }

        db.set(`${message.guild.id}.anti.channel`, args[0]);

        message.reply(`:shield: L'\`antichannel\` est désormais sur \`${args[0]}\`${args[0] === "on" ? " (_les membres wl sont ignorés_)" : ""}`);

        rslow.action[message.author.id] = true;
        setTimeout(() => {
            rslow.action[message.author.id] = false;
        }, db.fetch(`${message.guild.id}.actionslow`));

        const logChannel = db.fetch(`${message.guild.id}.raidlogs`);
        const logChannelObj = message.guild.channels.cache.get(logChannel);

        if (logChannelObj) {
            logChannelObj.send({
                embeds: [new Discord.MessageEmbed()
                    .setColor(db.fetch(`${message.guild.id}.color`))
                    .setDescription(`${message.author} has modified the antichannel to \`${args[0]}\`!`)
                ]
            }).catch(e => {
                console.error(e);
            });
        }
    }
};
