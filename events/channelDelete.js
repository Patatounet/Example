const PrivateChannel = require('../models/PrivateChannel');

module.exports = async (client, channel) => {
    if(channel.type == "dm") return;

    const data = await client.getGuild(channel.guild);
    if(!data) return;

    if(await PrivateChannel.findOne({ channelID: channel.id })) {
        await PrivateChannel.findOneAndDelete({ channelID: channel.id });
    }

    if(data.plugins.logs.enabled) {
        if(data.plugins.logs.channel) {
            if(!channel.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            let cType = channel.type;
            switch (cType) {
                case "text": cType = "Textuel"; break;
                case "voice": cType = "Vocal"; break;
                case "category": cType = "Catégorie"; break;
                case "news": cType = "Annonce"; break;
                case "store": cType = "Magasin"; break;
            }

            const fetchGuildAuditLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: 'CHANNEL_DELETE'
            })

            const latestChannelDeleted = fetchGuildAuditLogs.entries.first();
            const { executor } = latestChannelDeleted;

            if(channel.guild.channels.cache.get(data.plugins.logs.channel)) {
                channel.guild.channels.cache.get(data.plugins.logs.channel).send({
                    embed: {
                        color: 'RED',
                        author: { name: `${executor.username} a supprimé un salon`, icon_url: executor.displayAvatarURL({ dynamic: true }) },
                        fields: [
                            { name: 'Nom', value: channel.name, inline: true },
                            { name: 'Type', value: cType, inline: true },
                        ],
                        footer: { text: 'ID ' + channel.id },
                        timestamp: new Date()
                    }
                });
            }
        }
    }
}
