const db = require("quick.db")
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");
var rslow = require('../../slow.js');
module.exports = {
    name: "prison",
    description: "Ajoute/Retire un membre de la prison",
    usage: "prison <add/remove/list> <@member>",

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,cmd.name)
        if (perm == true) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`)
            let prisonon = db.fetch(`${message.guild.id}.prison.active`)
            if (prisonon == true) {
                let prisonrole = db.fetch(`${message.guild.id}.prison.role`)
                if (prisonrole) {
                    let member = await message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(r => r.user.tag.toLowerCase() === args.join(' ').toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === args.join(' ').toLocaleLowerCase())
                    if (member && !member.user.bot) {
                        const memberPosition = member.roles.highest.position;
                        const authorPosition = message.member.roles.highest.position;
                        if (authorPosition <= memberPosition) return message.reply(":x: Vous ne pouvez pas mettre en prison un membre avec un rôle supérieur au vôtre !");
                        if (db.fetch(`${message.guild.id}.prison.members`) && db.fetch(`${message.guild.id}.prison.members`).length > 0 && db.fetch(`${message.guild.id}.prison.members`).includes(member.user.id)) {
                            db.push(`${message.guild.id}.prison.members`, member.user.id)
                        } else {
                            db.push(`${message.guild.id}.prison.members`, member.user.id)
                        }
                        member.roles.add(prisonrole.id, "Transféré en prison par " + message.author.tag).catch((e) => console.log(e));
                        message.reply(`**${member.user.username}** a été envoyé en prison !`)
                        rslow.action[message.author.id] = true;
                        setTimeout(() => {
                            rslow.action[message.author.id] = false;
                        }, db.fetch(`${message.guild.id}.actionslow`));
                        let logchannel = db.fetch(`${message.guild.id}.prison.logs`)
                        if (logchannel) {
                            logchannel = message.guild.channels.cache.get(logchannel)
                            if (logchannel) logchannel.send({
                                embeds: [new Discord.MessageEmbed()
                                    .setColor(db.fetch(`${message.guild.id}.color`))
                                    .setDescription(`${message.author} a **transféré en prison** ${member} !`)]
                            }).catch(e => { e })
                        }
                        return
                    } else {
                        message.channel.send(`:x: Utilisateur invalide !`)
                    }
                } else {
                    message.channel.send(`:x: Le rôle prisonnier n'est pas config !`)
                }
            } else {
                message.channel.send(`:x: Le système de prison est désactivé !`)
            }
        } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

    }
}


const db = require("quick.db")
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");
var rslow = require('../../slow.js');
module.exports = {
    name: "prison",
    description: "Ajoute/Retire un membre de la prison",
    usage: "prison <add/remove/list> <@member>",

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,cmd.name)
        if (perm == true) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`)
            let prisonon = db.fetch(`${message.guild.id}.prison.active`)
            if (prisonon == true) {
                let prisonrole = db.fetch(`${message.guild.id}.prison.role`)
                if (prisonrole) {
                    let member = await message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(r => r.user.tag.toLowerCase() === args.join(' ').toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === args.join(' ').toLocaleLowerCase())
                    if (member && !member.user.bot) {
                        const memberPosition = member.roles.highest.position;
                        const authorPosition = message.member.roles.highest.position;
                        if (authorPosition <= memberPosition) return message.reply(":x: Vous ne pouvez pas mettre en prison un membre avec un rôle supérieur au vôtre !");
                        if (db.fetch(`${message.guild.id}.prison.members`) && db.fetch(`${message.guild.id}.prison.members`).length > 0 && db.fetch(`${message.guild.id}.prison.members`).includes(member.user.id)) {
                            db.push(`${message.guild.id}.prison.members`, member.user.id)
                        } else {
                            db.push(`${message.guild.id}.prison.members`, member.user.id)
                        }
                        member.roles.add(prisonrole.id, "Transféré en prison par " + message.author.tag).catch((e) => console.log(e));
                        message.reply(`**${member.user.username}** a été envoyé en prison !`)
                        rslow.action[message.author.id] = true;
                        setTimeout(() => {
                            rslow.action[message.author.id] = false;
                        }, db.fetch(`${message.guild.id}.actionslow`));
                        let logchannel = db.fetch(`${message.guild.id}.prison.logs`)
                        if (logchannel) {
                            logchannel = message.guild.channels.cache.get(logchannel)
                            if (logchannel) logchannel.send({
                                embeds: [new Discord.MessageEmbed()
                                    .setColor(db.fetch(`${message.guild.id}.color`))
                                    .setDescription(`${message.author} a **transféré en prison** ${member} !`)]
                            }).catch(e => { e })
                        }
                        return
                    } else {
                        message.channel.send(`:x: Utilisateur invalide !`)
                    }
                } else {
                    message.channel.send(`:x: Le rôle prisonnier n'est pas config !`)
                }
            } else {
                message.channel.send(`:x: Le système de prison est désactivé !`)
            }
        } else if(perm === false) if(!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

    }
}


const db = require("quick.db")
const Discord = require('discord.js');
const { checkperm } = require("
