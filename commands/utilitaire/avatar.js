const { Command } = require('discord.js-commando');
const { checkPerms } = require('../../utils/functions');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      group: 'misc',
      memberName: 'avatar',
      description: 'Displays the avatar of the mentioned user.',
      aliases: ['pp', 'pic'],
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Please mention a user or provide a user ID.',
          type: 'member'
        }
      ]
    });
  }

  run(message, { member }) {
    const perm = checkPerms(message.member, this.name);

    if (!perm.allowed) {
      if (!perm.silent) message.reply(perm.msg);
      return;
    }

    const avatarEmbed = new Discord.MessageEmbed()
      .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor(message.guild.me.displayHexColor)
      .setTitle(`Avatar of ${member.user.username}`)
      .setFooter(`Requested by ${message.author.tag}`)
      .setDescription(`[Avatar Link](${member.user.displayAvatarURL({ dynamic: true, size: 512 })})`);

    message.embed(avatarEmbed);
  }
};
