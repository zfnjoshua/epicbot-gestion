const db = require("quick.db")
const Discord = require('discord.js');
const ms = require("ms")
const { checkperm, msToTime } = require("../../base/functions");
module.exports = {
    name: "join-settings",
    description: "Configure les actions lorsqu'un membre rejoint le serveur",
    aliases: ["joinsettings", "jset"],

    run: async (client, message, args, cmd) => {
        let perm = await checkperm(message, cmd.name)
        if (perm == true) {

            const embed = new Discord.MessageEmbed()
                .setColor(db.fetch(`${message.guild.id}.color`))
                .setTitle("Chargement...")
            message.reply({ embeds: [embed] }).then(async mm => {
                await update(mm)
                const collector = mm.createMessageComponentCollector({
                    componentType: "SELECT_MENU",
                    time: 1800000
                })
                const filter = m => message.author.id === m.author.id;
                collector.on("collect", async (select) => {
                    if(select.message.id !== mm.id) return
                    if (select.user.id !== message.author.id) return select.reply({ content: "Vous n'avez pas la permission !", ephemeral: true }).catch(() => { })
                    let value = select.values[0]
                    if (value === "role") {
                        await select.reply(`📝 Veuillez mentionner le rôle qui sera ajouté aux nouveaux membres:\nEnvoyer \`off\` pour désactiver`).then(question => {
                            message.channel.awaitMessages({ filter: filter, max: 1, time: 600000, errors: ['time'] })
                                .then(async cld => {
                                    var msg = cld.first();
                                    if (msg.content.toLowerCase() === "off") { db.delete(`${message.guild.id}.join.role`); update(mm) } else {
                                        let newrole = msg.mentions.roles.first() || msg.guild.roles.cache.get(msg.content) || msg.guild.roles.cache.find(r => r.name.toLowerCase() === msg.content.toLocaleLowerCase())
                                        if (!newrole) { message.channel.send(`:x: Rôle invalide`); return update(mm)}
                                        const memberPosition = message.member.roles.highest.position;
                                        const authorPosition = newrole.position;
                                        if (authorPosition >= memberPosition) {message.reply(":x: Vous ne pouvez pas ajouter un rôle supérieur au votre !");return update(mm)}
                                        db.set(`${message.guild.id}.join.role`, newrole.id)

                                        msg.delete().catch(e => { })
                                        select.deleteReply().catch(e => { })
                                    }
                                    await update(mm)
                                })
                        })
                    }
                    if (value === "channel") {
                        await select.reply(`🏷️ Veuillez mentionner le salon de bienvenue:\nEnvoyer \`off\` pour désactiver`).then(question => {
                            message.channel.awaitMessages({ filter: filter, max: 1, time: 600000, errors: ['time'] })
                                .then(cld => {
                                    var msg = cld.first();
                                    if (msg.content.toLowerCase() === "off") { db.delete(`${message.guild.id}.join.wchannel`) } else {
                                        let m = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content)
                                        if (!m || m.type !== "GUILD_TEXT"){ return message.reply(`:x: Salon invalide !`);update(mm)}
                                        db.set(`${message.guild.id}.join.wchannel`, m.id)
                                    }
                                    msg.delete().catch(e => { })
                                    select.deleteReply().catch(e => { })
                                    update(mm)
                                })
                        })
                    }
                    if (value === "dmsg") {
                        await select.reply(`🔴 Veuillez envoyer la durée avant la suppression du message (\`s\` pour secondes, \`m\` pour minutes, \`h\` pour heures):\nEnvoyer \`off\` pour désactiver`).catch().then(question => {
                            message.channel.awaitMessages({ filter: filter, max: 1, time: 600000, errors: ['time'] })
                                .then(cld => {
                                    var msg = cld.first();
                                    if (msg.content.toLowerCase() === "off") { db.delete(`${message.guild.id}.join.wdelete`) } else {
                                        if (!ms(msg.content)) { return message.channel.send(`:x: Durée incorrecte`); update(mm)}
                                        if(ms(msg.content) < 4000 || ms(msg.content) > 86400000){ return message.channel.send(`:x: la durée doit être comprise entre 3 secondes et 1 jour !\n_Pour les ghostping utilisez la commande \`ghostping\` !_`);update(mm)}
                                        db.set(`${message.guild.id}.join.wdelete`, ms(msg.content))
                                    }
                                    msg.delete().catch(e => { })
                                    select.deleteReply().catch(e => { })
                                    update(mm)
                                })
                        })
                    }
                    if (value === "wmsg") {
                        await select.reply(`💬 Veuillez envoyer le nouveau message de bienvenue:\nVoici les variables _bienvenue_: \`{user}\`,\`{username}\`,\`{usertag}\`,\`{membercount}\`,\`{guildname}\``).then(question => {
                            message.channel.awaitMessages({ filter: filter, max: 1, time: 600000, errors: ['time'] })
                                .then(cld => {
                                    var msg = cld.first();
                                    if (msg.attachments.size > 0 || msg.content.length > 1500){ return message.reply(":x: Message invalide !");update(mm)}

                                    db.set(`${message.guild.id}.join.wmsg`, msg.content)
                                    msg.delete().catch(e => { })
                                    select.deleteReply().catch(e => { })
                                    update(mm)
                                })
                        })
                    }
                    if (value === "mpmsg") {
                        await select.reply(`🔑 Veuillez envoyer le nouveau message en mp:\nEnvoyer \`off\` pour désactiver\nVoici les variables _bienvenue_: \`{user}\`,\`{username}\`,\`{usertag}\`,\`{membercount}\`,\`{guildname}\``).then(question => {
                            message.channel.awaitMessages({ filter: filter, max: 1, time: 600000, errors: ['time'] })
                                .then(cld => {
                                    var msg = cld.first();
                                    if (msg.content.toLowerCase() === "off") { db.delete(`${message.guild.id}.join.mpmsg`) } else {
                                        if (msg.attachments.size > 0 || msg.content.length > 1500){ return message.reply(":x: Message invalide !");update(mm)}

                                        db.set(`${message.guild.id}.join.mpmsg`, msg.content)
                                    }
                                    msg.delete().catch(e => { })
                                    select.deleteReply().catch(e => { })
                                    update(mm)
                                })
                        })
                    }

                })
                collector.on("end", async () => {
                    return mm.edit({ content: "Expiré !", components: [] }).catch(() => { })
                })
            })

        } else if (perm === false) if (!db.fetch(`${message.guild.id}.vent`)) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`)

        
    }
}

async function update(mm) {
    const role = db.fetch(`${mm.guild.id}.join.role`)
    const wmsg = db.fetch(`${mm.guild.id}.join.wmsg`)
    const channel = db.fetch(`${mm.guild.id}.join.wchannel`)
    const mpmsg = db.fetch(`${mm.guild.id}.join.mpmsg`)
    const joindelete = db.fetch(`${mm.guild.id}.join.wdelete`)
    if (!role) db.set(`${mm.guild.id}.join.role`, undefined)
    if (!wmsg) db.set(`${mm.guild.id}.join.wmsg`, `**{username}** vient de rejoindre le serveur ! Nous sommes maintenant {membercount} membres !`)
    if (!channel) db.set(`${mm.guild.id}.join.wchannel`, undefined)
    if (!mpmsg) db.set(`${mm.guild.id}.join.mpmsg`, undefined)
    if (!joindelete) db.set(`${mm.guild.id}.join.wdelete`, 0)
    const roww = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
                .setCustomId('config')
                .setPlaceholder('Modifier un paramètre')
                .addOptions([
                    {
                        label: 'Changer le rôle membre',
                        value: 'role',
                        emoji: "📝"
                    },
                    {
                        label: 'Salon de bienvenue',
                        value: 'channel',
                        emoji: "🏷️"
                    },
                    {
                        label: 'Changer le message de bienvenue',
                        value: 'wmsg',
                        emoji: "💬"
                    },
                    {
                        label: 'Supprimer le message de bienvenue',
                        value: 'dmsg',
                        emoji: "🔴"
                    },
                    {
                        label: 'Changer le message en mp',
                        value: 'mpmsg',
                        emoji: "🔑"
                    }
                ])
        )
    const msgembed = new Discord.MessageEmbed()
        .setTitle(`👋 Join Settings ${mm.guild.name}`)
        .setColor(db.fetch(`${mm.guild.id}.color`))
        .addFields(
            { name: "`👥` Rôle membre", value: role ? `${role}` : "Aucun", inline: true },
            { name: "`🏷️` Salon de bienvenue", value: channel ? `${channel}` : "Aucun", inline: true },
            { name: "`💬` Message de bienvenue", value: wmsg ? `${wmsg}` : "Aucun", inline: true },
            { name: "`🔴` Supprimer le message de bienvenue", value: joindelete ? `\`${msToTime(joindelete)}\`` : "Aucun", inline: true },
            { name: "`🔑` Message en mp", value: mpmsg ? `\`${mpmsg}\`` : "Aucun", inline: true },
        )
    await mm.edit({ embeds: [msgembed], components: [roww] })
}
