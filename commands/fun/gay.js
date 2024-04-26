const db = require("discord.js-commando").QuickDB;
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

module.exports = {
    name: "gay",
    description: "Calculates the percentage of homosexuality of a member",

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, cmd.name);
        if (perm === false) return message.reply(`:x: You don't have permission to use the command \`${cmd.name}\`!`);

        let member;
        try {
            member = await message.guild.members.fetch(args[0]).catch(() => {});
        } catch (e) {
            return message.channel.send(`:x: Invalid user!`);
        }

        if (!member) {
            member = message.mentions.members.first() || message.member;
            if (!member) return message.channel.send(`:x: Invalid user!`);
        }

        if (member.user.bot) return message.channel.send(`:x: Bots don't have sexuality!`);

        const randomNumber = Math.floor(Math.random() * 100) + 1;

        if (!db.fetch(`${message.guild.id}.color`) || !colorRegex.test(db.fetch(`${message.guild.id}.color`))) {
            db.set(`${message.guild.id}.color`, "#FF0000");
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`${member.user.username} is gay at ${randomNumber}% :rainbow_flag:`)
            .setColor(db.fetch(`${message.guild.id}.color`))
            .setImage(`https://i.imgur.com/MRpzCqz.gif?noredirect`)
            .setFooter({text:"⚠️ The percentage may change if the member is feeling frisky"});

        message.reply({embeds: [embed]});
    }
}
