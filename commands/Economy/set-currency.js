module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const newCurrency = args[0];
    if(newCurrency === data.plugins.economy.currency) return message.channel.send('⚠️ Cette devise est la même qu\'actuellement définie.');
    if(newCurrency.length > 100) return message.channel.send('⚠️ Merci de mettre une devise de 100 caractères maximum.');

    message.channel.send(`✅ La devise du serveur est désormais \`${newCurrency}\``);

    data.plugins.economy.currency = newCurrency;

    data.markModified("plugins.economy.currency");
    data.save();
}

module.exports.help = {
    name: "set-currency",
    aliases: ["set-currency", "currency", "setcurrency"],
    category: "Economy",
    description: "Modifier la devise du serveur",
    usage: "<currency>",
    cooldown: 3,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: [],
    args: true
}