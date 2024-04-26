const db = require("quick.db")
const { checkperm } = require("../../base/functions");

module.exports = {
    name: "raidlogs",
    description: "Define the raid logs channel",
    aliases: ['raidlog'],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, "logs")
        if (perm == true) {
            if (!message.guild) return;
            let m = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
            if (!m || !m.type || m.type !== "GUILD_TEXT") return message.reply(`:x: Invalid channel!`);
            let actual = await db.fetch(`${message.guild.id}.raidlogs`).catch(() => null);
            if (actual === m.id) {
                await db.delete(`${message.guild.id}.raidlogs`).catch(() => {});
                return message.reply(`:clipboard: Raid logs are now disabled!`);
            }
            await db.set(`${message.guild.id}.raidlogs`, m.id).catch(() => {});
            return message.reply(`:clipboard: Raid logs will now be sent to <#${m.id}>!`);

        } else if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: You don't have permission to use the \`logs\` command!`);
        }
    }
}
