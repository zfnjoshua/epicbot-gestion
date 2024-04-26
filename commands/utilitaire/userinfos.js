const db = require("quick.db");
const Discord = require('discord.js');
const { checkperm } = require("../../base/functions");
const { promisify } = require('util');

module.exports = {
    name: "userinfos",
    description: "Affiche les informations d'un membre",
    aliases: ["userinfo", "ui"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message,"info")
        if (perm == true) {
            const mentionedMember = message.mentions.members.first();
            const memberId = args[0];
            let user;
            if (mentionedMember) {
                user = mentionedMember;
            } else if (memberId) {
                user = message.guild.members.cache.get(memberId);
                if (!user) {
                    try {
                        user = await message.guild.members.fetch(memberId);
                    } catch (error) {
                        return message.channel.send(`:x: Utilisateur invalide !`);
                    }
                }
            } else {
                user = message.member;
            }
            if (!user || user.user.bot) return message.channel.send(`:x: Utilisateur invalide !`);

            const nickname = user.nickname || user.user.username;
            const bannable = user.bannable;
            const kickable = user.kickable;

            const joinDate = new Date(user.joinedAt);
            const joinMonth = [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
            ][joinDate.getMonth()];
            const joinDay = joinDate.getUTCDate();
            const joinYear = joinDate.getFullYear();
            const joinedAt = `${joinDay} ${joinMonth} ${joinYear}`;

            const createDate = new Date(user.user.createdAt);
            const createMonth = [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
            ][createDate.getMonth()];
            const createDay = createDate.getUTCDate();
            const createYear = createDate.getFullYear();
            const createdAt = `${createDay} ${createMonth} ${createYear}`;

            const roles = Array.from(user.roles.cache.values())
                .filter(r => r.id !== message.guild.id)
                .map(r => `> ${r.name}`)
                .slice(0, 10)
                .join("\n");

            const permissions = user.permissions.toArray()
                .filter(p => !["CREATE_INSTANT_INVITE", "CONNECT", "SPEAK"].includes(p))
                .slice(0, 10)
                .join(", ");

            const banner = await promisify(user.user.fetch)().then(user => user.bannerURL({ format: "png", dynamic: true, size: 4096 }));

            const userinfo = new Discord.MessageEmbed()
                .setColor(db.fetch(`${message.guild.id}.color`))
                .setThumbnail(user.user.avatarURL({ dynamic: true }))
                .setTitle(`Informations sur ${nickname}`)
                .addFields(
                    { name: 'Informations basiques', value: `
                        > **Pseudo** : \`${user.user.username}\`
                        > **Discriminator** : \`#${user.user.discriminator}\`
                        > **Avatar** : [Lien de son avatar](${mentionned.avatarURL({ dynamic: true })})
                        > **Id** : \`${user.user.id}\`
                        > **Status** : \`${user.presence.status}\`
                        > **Activité** : \` ${user.presence && user.presence.activities[0] && user.presence.activities[0].state ? user.presence.activities[0].state : "Aucun"} \`
                        > **A rejoint le serveur le** : \` ${joinedAt} \`
                        > **Compte créé le** : \` ${createdAt} \`
                    ` },
                    { name: 'Informations avancées', value: `
                        > **Bannable** : \`${bannable ? "Oui" : "Non"}\`
                        > **Kickable** : \`${kickable ? "Oui" : "Non"}\`
                    ` },
                    { name: 'Roles', value: roles, inline: true },
                )
                .setImage(banner);

            message.reply({ embeds: [userinfo] });

        } else if (perm === false) {
            if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`info\` !`);
        }
    }
};
