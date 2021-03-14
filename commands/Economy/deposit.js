module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const toDeposit = args[0];

    const user = await client.findOrCreateUser(message.author);
    if(!user || user?.money <= 0) return message.channel.send('⚠️ Vous n\'avez pas d\'argent à déposer dans votre banque.');

    if(toDeposit === "all") {
        message.channel.send(`✅ **${user.money}${data.plugins.economy.currency}** ont été déposés dans votre banque.`);

        user.bank = user.bank + user.money;
        user.money = 0;

        user.markModified("money");
        user.save();
    } else {
        if(toDeposit <= 0 || isNaN(toDeposit) || toDeposit > user.money) return message.channel.send('⚠️ Vous ne pouvez pas déposer un nombre nul ou négatif ou plus de ce que vous avez.');

        message.channel.send(`✅ **${parseInt(toDeposit)}${data.plugins.economy.currency}** ont été déposés dans votre banque.`);

        user.bank = user.bank + parseInt(toDeposit);
        user.money = user.money - parseInt(toDeposit);

        user.markModified("money");
        user.save();
    }
}

module.exports.help = {
    name: "deposit",
    aliases: ["deposit", "dep", "dp"],
    category: "Economy",
    description: "Déposer l'argent de votre balance dans banque",
    usage: "<money | all>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}