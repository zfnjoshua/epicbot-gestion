const { checkperm } = require("../../base/functions");
const db = require('quick.db')

module.exports = {
    name: "stream",
    description: "Modifie le statut en _stream_",

    run: async (client, message, args, cmd) => {
        try {
            let perm = await checkperm(message, "activity")
            if (perm === false) {
                if (!db.fetch(`${message.guild.id}.vent`)) return message.channel.send(`:x: Vous n'avez pas la permission d'utiliser la commande \`activity\` !`);
            } else if (perm == true) {
                if (args.length < 1) return message.channel.send("Veuillez préciser le contenu du statut !");
                let content = args.join(" ");
                if (!content) return message.channel.send("Veuillez préciser le contenu du statut !");
                try {
                    db.set(`bottype`, "STREAMING");
                    db.set(`botactivity`, content);
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Une erreur est survenue lors de la modification du statut !");
                }
                try {
                    if (client.user && client.user.presence && client.user.presence.activities && client.user.presence.activities[0]) {
                        client.user.presence.activities[0].type = "STREAMING";
                        client.user.presence.activities[0].name = content;
                        client.user.presence.activities[0].url = "https://www.twitch.tv/coinsbot";
                    } else {
                        client.user.setPresence({
                            status: 'online',
                            activities: [{
                                name: content,
                                type: 'STREAMING',
                                url: 'https://www.twitch.tv/coinsbot'
                            }]
                        });
                    }
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Une erreur est survenue lors de la modification du statut !");
                }
                message.channel.send(`Je stream maintenant \`${content}\` !`);
            }
        } catch (err) {
            console.error(err);
            message.channel.send("Une erreur est survenue lors de l'exécution de la commande !");
        }
    }
}
