const db = require('quick.db');
const Discord = require('discord.js')
const config = require('../config');

module.exports = {
  async checkperm(message, cmd) {
    let check = false;
    let o = db.fetch(`${message.guild.id}.perm.${cmd}`);

    try {
      await message.member.roles.cache.forEach(r => {
        if (o && o.includes(r.id)) return check = true;
      });
    } catch (e) {
      console.error(e);
    }

    let cmdperm = db.fetch(`${message.guild.id}.change.${cmd}`);

    if (check !== true) {
      if (!cmdperm && cmdperm !== 0) { cmdperm = 6 }
      let authorperm = [];

      if (cmdperm === 0) check = true;

      for (let i = cmdperm; i < config.permsize + 1; i++) {
        let tet = db.fetch(`${message.guild.id}.permission${i}`);

        if (!tet) continue;

        for (let size in tet) {
          authorperm.push(tet[size]);
        }
      }

      try {
        await message.member.roles.cache.forEach(r => {
          if (authorperm && authorperm.includes(r.id)) return check = true;
        });
      } catch (e) {
        console.error(e);
      }
    }

    let array = db.fetch(`${message.guild.id}.ventall`);
    if (array && cmdperm === 0) check = undefined;

    let forbiden = db.fetch(`${message.guild.id}.channelventall`);
    if (forbiden && forbiden.includes(message.channel.id)) check = undefined;

    let b = db.fetch(`bot.owner`);
    if (b && b.includes(message.author.id) && cmdperm !== "buyer") check = true;

    const founder = config.owners;
    if (founder.includes(message.author.id)) check = true;

    return check;
  },
  ownersend(client, m) {
    let owners = db.get('bot.owner');

    if (!owners || !Array.isArray(owners)) return;

    owners.forEach(id => {
      let user = client.users.cache.get(id);

      if (!user) return;

      user.send(m).catch(e => { });
    });
  },
  sanction(member, guild, sanction, reason) {
    if (!sanction) return;

    sanction = sanction.toLowerCase();

    if (sanction === "kick") {
      if (!guild.me.permissions.has("KICK_MEMBERS")) return;

      member.kick({
        reason: reason
      }).catch(e => {
        console.error(e);
      });
    } else if (sanction === "ban") {
      if (!guild.me.permissions.has("BAN_MEMBERS")) return;

      guild.bans.create(member, {
        reason: reason
      }).catch(e => {
        console.error(e);
      });
    } else if (sanction === "derank") {
      if (member.roles.highest.position >= guild.me.roles.highest.position || !guild.me.permissions.has("MANAGE_ROLES")) return;

      member.roles.cache.forEach(r => {
        if (r.id === guild.roles.everyone.id) return;
        member.roles.remove(r.id).catch(e => {
          console.error(e);
        });
      });
    } else if (sanction === "mute") {
      if (!guild.me.permissions.has("MODERATE_MEMBERS")) return;

      member.voice.setMute(true).catch(e => {
        console.error(e);
      });
    } else if (sanction === "unmute") {
      if (!guild.me.permissions.has("MODERATE_MEMBERS")) return;

      member.voice.setMute(false).catch(e => {
        console.error(e);
      });
    } else if (!isNaN(sanction)) {
      if (!guild.me.permissions.has("MODERATE_MEMBERS")) return;

      member.timeout(sanction * 1000, reason).catch(e => {
        console.error(e);
      });
    } else {
      return;
    }
  },
  between(min, max) {
    if (min > max) return;

    return Math.floor(
      Math.random() * (max - min + 1) + min
    );
  },
  msToTime(duration) {
    let seconds = parseInt((duration / 1000) % 60);
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    if (hours > 24) return;
    if (minutes > 60) minutes = minutes % 60;
    if (seconds > 60) seconds = seconds % 60;

    return `${hours ? `${hours} heure(s), ` : ""}${hours || minutes ? `${minutes} minute(s) et ` : ""}${hours || minutes || seconds ? `${seconds} seconde(s)`: ""}`;
  }
};
