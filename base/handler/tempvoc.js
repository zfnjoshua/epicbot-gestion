const { QuickDB } = require("quick.db");
const { Client, VoiceState } = require("discord.js");

const db = new QuickDB();

module.exports = {
    name: "voiceStateUpdate",

    async run(client, oldState, newState) {
        const guildId = newState?.guild?.id || oldState?.guild?.id;

        if (!guildId) return;

        const tempVoiceChannelId = db.fetch(`${guildId}.tempvoc.channel`);

        if (db.get(`${guildId}.tempvoc.active`) !== true) return;

        const category = newState?.guild?.channels.cache.get(db.fetch(`${guildId}.tempvoc.category`));

        if (!category) return;

        const isJoiningTempVoiceChannel =
            !oldState?.channel && newState?.channel?.id === tempVoiceChannelId;

        const isLeavingTempVoiceChannel =
            oldState?.channel?.id === tempVoiceChannelId && !newState?.channel;

        const isMovingToAnotherChannel =
            oldState?.channel?.parentId === db.fetch(`${guildId}.tempvoc.category`) &&
            oldState?.channel?.id !== tempVoiceChannelId &&
            newState?.channel?.id === tempVoiceChannelId;

        const isMovingFromTempVoiceChannel =
            oldState?.channel?.id === tempVoiceChannelId &&
            newState?.channel?.parentId !== db.fetch(`${guildId}.tempvoc.category`);

        if (isJoiningTempVoiceChannel) {
            await newState.member.voice.setChannel(tempVoiceChannelId);

            const newTempVoiceChannel = await newState.guild.channels.create(
                `${db.fetch(`${guildId}.tempvoc.emoji`)} ${newState.member.user.username}`,
                {
                    type: "GUILD_VOICE",
                    userLimit: 5,
                    parent: category,
                    reason: "Salon temporaire - Création d'un nouveau salon",
                }
            );

            newTempVoiceChannel.permissionOverwrites.create(newState.member, {
                MANAGE_CHANNELS: true,
                MANAGE_ROLES: false,
            });

            newState.member.voice.setChannel(newTempVoiceChannel);
        } else if (isLeavingTempVoiceChannel) {
            if (oldState.channel.members.size === 0) {
                oldState.channel.delete({
                    reason: "Salon temporaire - Plus personne dans le salon",
                });
            }
        } else if (isMovingToAnotherChannel) {
            if (oldState.channel.members.size === 0) {
                oldState.channel.delete({
                    reason: "Salon temporaire - Plus personne dans le salon",
                });
            }

            const newTempVoiceChannel = await newState.guild.channels.create(
                `${db.fetch(`${guildId}.tempvoc.emoji`)} ${newState.member.user.username}`,
                {
                    type: "GUILD_VOICE",
                    parent: category,
                    reason: "Salon temporaire - Création d'un nouveau salon",
                }
            );

            newTempVoiceChannel.permissionOverwrites.create(newState.member, {
                MANAGE_CHANNELS: true,
                MANAGE_ROLES: false,
            });

            newState.member.voice.setChannel(newTempVoiceChannel);
        } else if (isMovingFromTempVoiceChannel) {
            if (oldState.channel.members.size === 0) {
                oldState.channel.delete({
                    reason: "Salon temporaire - Plus personne dans le salon",
                });
            }
        }
    },
};
