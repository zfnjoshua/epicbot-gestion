const { Command } = require('discord.js-commando');
const db = require('quick.db');
const fetch = require('node-fetch');

module.exports = class SnipeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'snipe',
      group: 'mod',
      memberName: 'snipe',
      description: 'Displays the last deleted message',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(message) {
    const snipeData = this.client.snipes.get(message.channel.id);

    if (!snipeData) {
      return message.reply(':x: There is no message to snipe!');
    }

    let content = snipeData.content;
    if (content.includes('gg/')) {
      const slashIndex = content.indexOf('/');
      content = content.replace(content.substring(slashIndex + 1), '••••••••');
    }

    const embed = new MessageEmbed()
      .setAuthor({ name: snipeData.author.username, iconURL: snipeData.author.displayAvatarURL() })
      .setDescription(content)
      .setColor(db.fetch(`${message.guild.id}.color`))
      .setTimestamp(snipeData.date);

    if (snipeData.image) embed.setImage(snipeData.image);

    return message.reply({ embeds: [embed] });
  }

  checkPerm(message, cmd) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      if (!db.fetch(`${message.guild.id}.vent`)) {
        return message.reply(`:x: You don't have permission to use the command \`${cmd.name}\`!`);
      }
    }

    return true;
  }
};
