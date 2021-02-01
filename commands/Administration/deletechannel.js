module.exports.run = async (client, message, args) => {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || args[0].toLowerCase();
    if(!channel) return message.channel.send('⚠️ Veuillez spécifier un salon a supprimer.');

    if(channel.type === "text" || channel.type === "voice" || channel.type === "news") {
        if(!message.member.permissionsIn(channel).has("MANAGE_CHANNELS")) return message.channel.send('⚠️ Vous n\'avez pas les permissions de supprimer ce salon.');

        if(!channel.deletable || channel.deleted) return message.channel.send('⚠️ Je ne peux pas supprimer ce salon, vérifiez que j\'ai la permission Gérer les salons pour le supprimer, et réessayez.');

        await channel.delete().then(() => {
            message.channel.send(`✅ Le salon **#${channel.name}** a été supprimé.`).catch(() => {});
        }).catch(err => {
            console.log(err);
            message.channel.send(`Une erreur est survenue, veuillez réessayer. \n\`\`\`js\n${err}\n\`\`\``);
        })
    } else {
        return message.channel.send('⚠️ Veuillez indiquer un salon valide en le mentionnant ou en donnant son id.');
    }
}

module.exports.help = {
    name: "deletechannel",
    aliases: ["deletechannel", "delete-channel", "channeldelete", "channel-delete"],
    category: 'Administration',
    description: "Supprimer un salon textuel ou vocal",
    usage: "<salon>",
    cooldown: 15,
    memberPerms: ["MANAGE_CHANNELS"],
    botPerms: ["MANAGE_CHANNELS"],
    args: true
}
