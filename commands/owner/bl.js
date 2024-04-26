const db = require("quick.db");
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "bl",
    description: "Blacklist a member of the server",
    aliases: ["blacklist"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, cmd.name);
        if (perm == true) {
            if (!args[0] || args[0].toLowerCase() === "list") {
                message.reply("Listing members...").then(async m => {
                    let list = db.fetch(`bot.bl`);
                    if (list && list.length > 0) {
                        let urray = [];
                        for (i in list) {
                            let member = await client.users.fetch(list[i]).catch(() => null);
                            if (!member) continue;
                            let author = db.fetch(`bl.${list[i]}.author`);
                            if (author) {
                                author = await client.users.fetch(author).catch(() => null);
                            } else author = "_aucune donnée_";
                            urray.push(`${member.username}#${member.discriminator} (id: ${list[i]}) (BL by ${author})`);
                        }
                        list = urray.join("\n");
                    } else list = "No blacklisted members!";
                    m.edit({
                        embeds: [new Discord.MessageEmbed()
                            .setColor(db.fetch(`${message.guild.id}.color`))
                            .setTitle(`Blacklisted members`)
                            .setDescription(`${list}`)
                            .setFooter({ text: `These members are banned from all servers where the bot is` })]
                    });
                });
            } else {
                let member;
                if (isNaN(args[0])) {
                    member = message.mentions.users.first();
                } else {
                    member = await client.users.fetch(args[0]).catch(() => null);
                }
                if (!member) return message.reply(":x: Invalid user!");
                let b = db.fetch(`bot.owner`);
                if (b && b.includes(member.id)) return message.reply(":x: You cannot blacklist an owner!");
                let actualbl = db.fetch("bot.bl");
                if (actualbl && actualbl.includes(member.id)) return message.reply(":x: The member is already blacklisted!");
                db.push("bot.bl", member.id);
                db.set(`bl.${member.id}.author`, message.author.id);
                let m = message.guild.members.cache.get(member.id);
                if (m) {
                    m.send(`You have been blacklisted from ${message.guild.name} by ${message.author.tag}!`).catch(() => null);
                }
                try {
                    await message.guild.bans.create(member.id, {
                        "reason": `Blacklist by ${message.author.tag}`
                    });
                } catch (e) { }
                client.guilds.cache.forEach(guild => {
                    if (guild.id !== message.guild.id) {
                        try {
                            guild.bans.create(member.id, {
                                "reason": `Blacklist by ${message.author.tag}`
                            });
                        } catch (e) { }
                    }
                });
                message.reply(`${member.username} has been added to the blacklist and banned from all servers!`);
                let logchannel = db.fetch(`${message.guild.id}.raidlogs`);
                if (logchannel) {
                    try {
                        logchannel.send({
                            embeds: [new Discord.MessageEmbed()
                                .setColor(db.fetch(`${message.guild.id}.color`))
                                .setDescription(`${message.author} has **blacklisted** ${member.toString()}`)]
                        });
                    } catch (e) { }
                }
            }
        } else if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: You don't have permission to use the command \`${cmd.name}\`!`);
        }
    }
};
