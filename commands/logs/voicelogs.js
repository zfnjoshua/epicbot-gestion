const db = require("quick.db");
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "voicelogs",
    description: "Défini les logs vocal",
    aliases: ['voicelog', "voclog"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, "logs");

        if (!perm) {
            if (!db.fetch(`${message.guild.id}.vent`)) {
                return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`logs\` !`);
            }
        }

        let m = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!m || m.type !== "GUILD_TEXT") {
            return message.reply(`:x: Veuillez mentionner un salon texte valide !`);
        }

        let actual = await db.fetch(`${message.guild.id}.voicelogs`);

        if (actual === m.id) {
            await db.delete(`${message.guild.id}.voicelogs`);
            return message.reply(`:clipboard: Les logs vocal sont désactivés !`);
        }

        await db.set(`${message.guild.id}.voicelogs`, m.id);
        return message.reply(`:clipboard: Les logs vocal seront maintenant envoyés dans <#${m.id}> !`);
    }
};
