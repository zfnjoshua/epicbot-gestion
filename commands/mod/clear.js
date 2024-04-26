const db = require("quick.db")
const Discord = require('discord.js');
var rslow = require('../../slow.js');
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "clear",
    description: "Supprime des messages",
    aliases: ["purge", "mdelete"],

    run: async (client, message, args, cmd) => {
        let permCheck = await checkperm(message, cmd.name);
        if (!permCheck.permissions.length) {
            if (rslow.action[message.author.id] == true) return message.channel.send(`:x: Veuillez attendre avant d'effectuer une autre action !`)
            let member = message.mentions.members.first();
            if (!member) {
                member = message.guild.members.cache.get(args[0]);
                if (!member) {
                    member = message.guild.members.cache.find(r => r.user.tag.toLowerCase() === args.join(' ').toLocaleLowerCase());
                    if (!member) {
                        member = message.guild.members.cache.find(r => r.displayName.toLowerCase() === args.join(' ').toLocaleLowerCase());
                    }
                }
            }

            const deleteCount = (parseInt(args[member ? 1 : 0], 10) + 1);

            if (!deleteCount || deleteCount < 2 || deleteCount > 100) return message.reply(":x: Merci de préciser le nombre de message à supprimer (2 < 
