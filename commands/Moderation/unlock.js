module.exports.run = async (client, message, args, data) => {
    if(args[0]) {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find((c) => c.name.toLowerCase().includes(args[0]));

        if(!message.guild.channels.cache.get(channel?.id)) return message.channel.send('⚠️ Salon introuvable, réessayez en le mentionnant, donnant son id ou son nom.');
        if(!message.guild.me.permissionsIn(channel).has(['VIEW_CHANNEL', 'MANAGE_CHANNELS'])) return messsage.channel.send('⚠️ Je n\'ai pas les permissions nécessaires pour modifier ce salon !');

        const dataChannel = data.locked_channels?.find((ch) => ch.id === channel.id);
        if(!dataChannel) return message.channel.send('⚠️ Ce salon n\'est pas fermé !');

        channel.overwritePermissions(dataChannel.overwrites).then(async (chan) => {
            if(chan.type === 'category') {
                for (const catChannel of message.guild.channels.cache.filter((c) => c.parentID === chan.id).array()) {
                    await catChannel.lockPermissions().catch(() => {});

                    const index = data.locked_channels.findIndex((ch) => ch.id === catChannel.id);
                    if(index) {
                        data.locked_channels.splice(index, 1);

                        data.markModified('locked_channels');
                        await data.save();
                    }
                }
            }

            data.locked_channels.splice(data.locked_channels.findIndex((ch) => ch.id === chan.id), 1);

            data.markModified('locked_channels');
            await data.save();

            message.channel.send(`✅ **Le salon ${channel} a bien été réouvert${channel.type === 'category' ? ' ainsi que tous les salons de la catégorie' : ''}.**`);
        }).catch(() => {
            message.channel.send('❌ Une erreur est survenue, assurez-vous que j\'ai accès au salon et que je possède les permissions nécessaires pour le modifier.');
        });
    } else {
        if(!message.guild.me.permissionsIn(message.channel).has(['VIEW_CHANNEL', 'MANAGE_CHANNELS'])) return message.channel.send('⚠️ Je n\'ai pas les permissions nécessaires pour modifier ce salon !');

        const dataChannel = data.locked_channels?.find((ch) => ch.id === message.channel.id)
        if(!dataChannel) return message.channel.send('⚠️ Ce salon n\'est pas fermé !');

        await message.channel.overwritePermissions(dataChannel.overwrites).then(async (channel) => {
            data.locked_channels.splice(data.locked_channels.findIndex((ch) => ch.id === channel.id), 1)

            data.markModified('locked_channels');
            data.save().then(() => {
                message.channel.send(`✅ **Le salon ${message.channel} a bien été réouvert.**`);
            });
        }).catch(() => {
            message.channel.send('❌ Une erreur est survenue, assurez-vous que je possède les permissions nécessaires pour le modifier.');
        });
    }
}

module.exports.help = {
    name: 'unlock',
    aliases: ['unlock'],
    category: 'Moderation',
    description: 'Réouvrir un salon ou une catagéorie fermé(e) auparavant via la commande lock.',
    usage: '[salon]',
    cooldown: 5,
    memberPerms: ['MANAGE_CHANNELS'],
    botPerms: ['MANAGE_CHANNELS'],
    args: false
}
