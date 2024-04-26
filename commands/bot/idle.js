const { checkperm } = require("../../base/functions");
const db = require('quick.db');

module.exports = {
    name: "idle",
    description: "Modifie la présence en _inactif_",

    run: async (client, message, args, cmd) => {
        if (!client || !db || !db.set || !message || !message.guild) {
            console.error("Missing required objects or properties.");
            return;
        }

        const perm = await checkperm(message, "activity");

        if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) {
                return message.reply(":x: Vous n'avez pas la permission d'utiliser la commande `activity` !");
            }
        } else if (perm === true) {
            try {
                if (db.get(`botpres`) === "idle") {
                    return message.reply("Je suis déjà inactif !");
                }

                db.set(`botpres`, "idle");

                try {
                    client.user.setStatus('idle');
                    message.reply(`Je suis maintenant inactif !`);
                } catch (error) {
                    console.error("Error setting bot status:", error);
                    message.reply("Une erreur est survenue lors de la modification de ma présence.");
                }
            } catch (error) {
                console.error("Error setting bot presence:", error);
                message.reply("Une erreur est survenue lors de la modification de ma présence.");
            }
        }
    }
};
