module.exports.run = async (client, message, args) => {
    if(!message.guild.me.permissionsIn(message.channel).has("MANAGE_CHANNELS")) return message.channel.send('⚠️ Je n\'ai pas les permissions de gérer ce salon.');

    await message.channel.overwritePermissions([
        {
            id: message.guild.roles.everyone.id,
            deny: ["SEND_MESSAGES", "ADD_REACTIONS"]
        }
    ]).then(() => {
        message.channel.send(`✅ Le salon ${message.channel} a bien été fermé.`);  
    }).catch(err => {
        message.channel.send('Une erreur est survenue, veuillez réessayer. \n```' + err + '\n```');
    });
}

module.exports.help = {
    name: "lock",
    aliases: ["lock"],
    category: 'Moderation',
    description: "Fermer un salon",
    usage: "",
    cooldown: 5,
    memberPerms: ["MANAGE_CHANNELS"],
    botPerms: ["MANAGES_CHANNELS"],
    args: false
}