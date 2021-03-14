module.exports.run = async (client, message, args, data) => {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

    if(!data.plugins.protection.antispam?.enabled) return message.channel.send(`⚠️ L'anti spam n'est pas activé, faites \`${data.prefix}antispam\` pour l'activer`);

    if(args[0] === "add") {
        if(!channel) return message.channel.send(`⚠️ Merci de spécifier un salon à ignorer, essayez en donnant une ID ou en mentionnant le salon`);

        data.plugins.protection.antispam.ignored_channels.push(channel.id);

        data.markModified("plugins.protection.antispam");
        data.save();

        message.channel.send(`✅ Le salon ${channel} est désormais ignoré par l'anti spam.`);
    } else if(args[0] === "remove") {
        if(!channel) return message.channel.send(`⚠️ Merci de spécifier un salon à ignorer, essayez en donnant une ID ou en mentionnant le salon`);

        data.plugins.protection.antispam.ignored_channels = data.plugins.protection.antispam.ignored_channels.filter(c => c !== channel.id);

        data.markModified("plugins.protection.antispam");
        data.save();

        message.channel.send(`✅ Le salon ${channel} n'est désormais plus ignoré par l'antispam`);
    } else return message.channel.send(`⚠️ Vous n'utilisez pas la commande correctement.\nFaites \`${data.prefix}ignore-channel add <salon>\` pour rajouter un salon, et \`${data.prefix}ignore-channel remove <salon>\` pour en retirer un.`);
}

module.exports.help = {
    name: "ignore-channel",
    aliases: ["ignore-channel", "ignorechannel"],
    category: 'Protection',
    description: "Ignorer un salon par l'antispam",
    usage: "<add | remove> <channel>",
    cooldown: 5,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: ["MANAGE_GUILD"],
    args: true
}