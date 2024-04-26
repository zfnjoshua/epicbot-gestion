const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { checkperm } = require('../../base/functions');

module.exports = {
    name: 'checkperm',
    description: 'Verifie les permissions du serveur',
    aliases: ['cp'],

    run: async (client, message, args, cmd) => {
        const permCheck = await checkperm(message, cmd.name);
        if (!permCheck) return message.reply(`:x: Vous n'avez pas la permission d'utiliser la commande \`${cmd.name}\` !`);

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Vérifier une permission')
                    .addOptions([
                        {
                            label: 'Permission Administrateur',
                            value: 'ADMINISTRATOR',
                            emoji: '👑'
                        },
                        {
                            label: 'Permission Rôle',
                            value: 'MANAGE_ROLES',
                            emoji: '🔧'
                        },
                        {
                            label: 'Permission Modifier Serveur',
                            value: 'MANAGE_GUILD',
                            emoji: '☄️'
                        },
                        {
                            label: 'Permission Salons',
                            value: 'MANAGE_CHANNELS',
                            emoji: '📕'
                        },
                        {
                            label: 'Permission Ban',
                            value: 'BAN_MEMBERS',
                            emoji: '🔨'
                        },
                        {
                            label: 'Permission Kick',
                            value: 'KICK_MEMBERS',
                            emoji: '💥'
                        },
                    ])
            );

        const embed = new MessageEmbed()
            .setColor(client.db.fetch(`${message.guild.id}.color`))
            .setDescription('Choisissez la permission à vérifier !');

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: 1800000
        });

        collector.on('collect', async (select) => {
            if (select.user.id !== message.author.id) return select.reply({ content: 'Vous n\'avez pas la permission !', ephemeral: true }).catch(() => { });
            const value = select.values[0];
            await select.deferUpdate();
            permission(value);
        });

        collector.on('end', async () => {
            return msg.edit({ content: 'Collector expiré !', components: [] }).catch(() => { });
        });

        function permission(perm) {
            const adminslist = message.guild.members.cache.filter(m => m.permissions.has(perm) && !m.user.bot);
            const page = Math.ceil(adminslist.size / 10);

            for (let i = 1; i < page + 1; i++) {
                const embeddd = new MessageEmbed()
                    .setDescription(`*Ces membres ont la permission ${perm}*\n\n\n` + list((i - 1) * 10, i * 10))
                    .setColor(client.db.fetch(`${message.guild.id}.color`))
                    .setFooter({ text: `Page ${i} / ${page}` });

                message.channel.send({ embeds: [embeddd] });
            }

            function list(min, max) {
                return adminslist
                    .map((m, i) => i + 1 + ' - ' + m.user.tag + ' (id: ' + m.user.id + ')')
                    .slice(min, max)
                    .join('\n');
            }
        }
    }
};
