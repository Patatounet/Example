module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.protection.antimaj) {
        data.plugins.protection.antimaj = true;

        data.markModified("plugins.protection");
        data.save();

        message.channel.send('✅ **Anti maj activé avec succès**');
    } else if(data.plugins.protection.antimaj === true) {
        data.plugins.protection.antimaj = false;

        data.markModified("plugins.protection");
        data.save();

        message.channel.send('✅ **Anti maj désactivé avec succès**');
    }
}

module.exports.help = {
    name: "antimaj",
    aliases: ["antimaj", "anti-maj", "anti-caps", "anticaps"],
    category: 'Protection',
    description: "Activer/Désactiver l'anti maj sur le serveur",
    usage: "",
    cooldown: 5,
    memberPerms: ["MANAGE_MESSAGES"],
    botPerms: ["MANAGE_MESSAGES"],
    args: false
}