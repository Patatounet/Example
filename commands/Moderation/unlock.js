module.exports.run = async (client, message, args) => {
    if(!message.guild.me.permissionsIn(message.channel).has("MANAGE_CHANNELS")) return message.channel.send('⚠️ Je n\'ai pas les permissions de gérer ce salon.');

    await message.channel.overwritePermissions([
        {
            id: message.guild.roles.everyone.id,
            allow: ["SEND_MESSAGES"]
        }
    ]).then(() => {
        message.channel.send(`✅ Le salon ${message.channel} a bien été réouvert.`);  
    }).catch(err => {
        message.channel.send('Une erreur est survenue, veuillez réessayer. \n```' + err + '\n```');
    });
}

module.exports.help = {
    name: "unlock",
    aliases: ["unlock"],
    category: 'Moderation',
    description: "Rouvrir un salon",
    usage: "",
    cooldown: 5,
    memberPerms: ["MANAGE_CHANNELS"],
    botPerms: ["MANAGES_CHANNELS"],
    args: false
}