const db = require("quick.db");
const { MessageEmbed } = require('discord.js');
const { checkperm } = require("../../base/functions");
const permFile = require("../../perm.json");

module.exports = {
    name: "commands",
    description: "Displays all commands with modifiable permissions",

    run: async (client, message, args, cmd) => {
        const permCheck = await checkperm(message, cmd.name);
        if (!permCheck.hasPermission) {
            if (!db.fetch(`${message.guild.id}.vent`)) {
                return message.reply(`You don't have permission to use the command \`${cmd.name}\`!`);
            }
        } else {
            const defaultPerms = permFile.defaultperm.map(p => `\`${p.name}\``).join(" / ");
            const embed = new MessageEmbed()
                .setColor(db.fetch(`${message.guild.id}.color`))
                .setTitle('Voici toutes les commandes avec permissions modifiables')
                .setDescription(defaultPerms);

            return message.reply({ embeds: [embed] });
        }
    }
};
