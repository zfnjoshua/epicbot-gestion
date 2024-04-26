const { Permissions } = require("discord.js");
const { checkperm, defaultperm } = require("../../base/functions");
const commandPerms = require("../../perm.json");
const quickDB = require("quick.db");

module.exports = {
    name: "change",
    description: `Permets de configurer une commande sur un/des rôle(s)`,
    usage: "change <command> <perm>",
    aliases: ["changes"],

    run: async (client, message, args, cmd) => {
        // Check if the user has permission to run the command
        const hasPermission = await checkperm(message, cmd.name);
        if (!hasPermission) {
            if (!quickDB.fetch(`${message.guild.id}.vent`))
                return message.reply(
                    `:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`
                );
            return;
        }

        const commandName = args[0];
        const command = commandPerms.find(
            (cmd) => cmd.name.toLowerCase() === commandName.toLowerCase()
        );

        if (!command) {
            return message.reply(`:x: Commande invalide`);
        }

        const newPermission = args[1];

        if (!newPermission) {
            return message.reply(`:x: Veuillez préciser le numéro de nouvelle permission`);
        }

        if (
            newPermission.toLowerCase() === "owner" ||
            newPermission.toLowerCase() === "buyer"
        ) {
            quickDB.set(`${message.guild.id}.change.${commandName}`, newPermission.toLowerCase());
            return message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                        .setColor(quickDB.fetch(`${message.guild.id}.color`))
                        .setDescription(
                            `📖 la commande \`${commandName}\` est désormais accessible dès la permission \`${newPermission.toLowerCase()}\` !`
                        ),
                ],
            });
        }

        const permissionValue = parseInt(newPermission);
        if (isNaN(permissionValue)) {
            return message.reply(`:x: La permission spécifiée n'est pas valide`);
        }

        if (permissionValue < 0 || permissionValue > commandPerms.length) {
            return message.reply(`:x: Permission invalide (1 < ${commandPerms.length})`);
        }

        quickDB.set(`${message.guild.id}.change.${commandName}`, permissionValue);
        return message.reply({
            embeds: [
                new Discord.MessageEmbed()
                    .setColor(quickDB.fetch(`${message.guild.id}.color`))
                    .setDescription(
                        `📖 la commande \`${commandName}\` est désormais accessible dès la permission \`${newPermission}\` !`
                    ),
            ],
        });
    },
};
