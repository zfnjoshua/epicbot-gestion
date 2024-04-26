const { MessageEmbed } = require('discord.js');
const { checkperm } = require('../../base/functions');

module.exports = {
    name: 'channelinfos',
    description: 'Displays information about a channel',
    aliases: ['ci', 'channelinfo'],

    run: async (client, message, args, cmd) => {
        const permCheck = await checkperm(message, 'info');
        if (!permCheck) return message.reply(`You don't have permission to use the \`info\` command!`);

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        if (!channel) return message.channel.send(`:x: Please mention a valid channel`);

        const embed = new MessageEmbed()
            .setColor(client.db.fetch(`${message.guild.id}.color`) || '#000001')
            .setTitle(`${channel.name}`)
            .setURL(message.guild.iconURL({ dynamic: true }))
            .setTimestamp(channel.createdAt)
            .setFooter({ text: 'Created at' });

        if (channel.type === 'GUILD_TEXT' || channel.type === 'GUILD_STORE' || channel.type === 'GUILD_NEWS') {
            embed.addFields(
                {
                    name: 'Description',
                    value: channel.topic ? `${channel.topic}` : 'None',
                    inline: false,
                },
                {
                    name: 'Mention',
                    value: `${channel}`,
                    inline: true,
                },
                {
                    name: 'ID',
                    value: `${channel.id}`,
                    inline: true,
                },
                {
                    name: 'Channel Type',
                    value: `${channel.type}`,
                    inline: true,
                },
                {
                    name: 'NSFW',
                    value: channel.nsfw ? 'Yes' : 'No',
                    inline: true,
              
