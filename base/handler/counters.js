const db = require("quick.db");
const { between } = require("./utils"); // Assuming between function is in utils.js

const counters = 4;

module.exports = {
  name: "ready",

  run: async (client) => {
    const interval = between(360000, 600000);

    setInterval(async () => {
      const inter = between(360000, 600000);

      try {
        await client.guilds.cache.forEach(async (guild) => {
          try {
            await guild.members.fetch();

            for (const counter of Object.values(db.all().filter((data) => data.key.startsWith(`${guild.id}.counters`)))) {
              const channelId = counter.value.channel;
              const channelType = counter.value.type;
              const channel = guild.channels.cache.get(channelId);

              if (!channel || !channelType) {
                db.delete(`${guild.id}.counters${counter.key.split(".")[2]}`);
                db.delete(`${guild.id}.counters${counter.key.split(".")[2]}.channel`);
                db.delete(`${guild.id}.counters${counter.key.split(".")[2]}.type`);
                continue;
              }

              const format = counter.value[channelType].format;

              let roleMembersCount;
              if (channelType === "rolemembers") {
                const roleId = counter.value.membersrole;
                const role = guild.roles.cache.get(roleId);

                if (!role) {
                  db.delete(`${guild.id}.counters${counter.key.split(".")[2]}`);
                  db.delete(`${guild.id}.counters${counter.key.split(".")[2]}.channel`);
                  db.delete(`${guild.id}.counters${counter.key.split(".")[2]}.type`);
                  db.delete(`${guild.id}.counters${counter.key.split(".")[2]}.membersrole`);
                  continue;
                }

                try {
                  roleMembersCount = role.members.size;
                } catch (e) {
                  console.log(`Error getting role members count: ${e}`);
                  roleMembersCount = 0;
                }
              }

              let newName = format
                .replace("<count>", channelType
                  .replace("membres", guild.memberCount)
                  .replace("online", guild.members.cache.filter(({ presence }) => presence && presence.status !== 'offline').size)
                  .replace("vocal", guild.members.cache.filter(m => m.voice.channel).size)
                  .replace("channels", guild.channels.cache.size)
                  .replace("roles", guild.roles.cache.size))
                .replace("rolemembers", roleMembersCount || 0)
                .replace("boosts", guild.premiumSubscriptionCount);

              try {
                await channel.setName(newName);
              } catch (e) {
                console.log(`Error setting channel name: ${e}`);
              }
            }
          } catch (e) {
            console.log(`Error in guild: ${guild.name}: ${e}`);
          }
        });
      } catch (e) {
        console.log(`Error fetching guild members: ${e}`);
      }

      setTimeout(() => {
        interval(inter);
      }, 1000);
    }, interval);
  },
};

function between(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
