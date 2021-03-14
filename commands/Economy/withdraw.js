module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const toWithdraw = args[0];

    let user = await client.findOrCreateUser(message.author);
    if(!user || user?.bank <= 0) return message.channel.send('⚠️ Vous n\'avez pas d\'argent à récupérer de votre banque.');

    if(toWithdraw === "all") {
        message.channel.send(`✅ **${user.bank}${data.plugins.economy.currency}** ont été ajoutés à votre balance.`);

        user.money = user.bank + user.money;
        user.bank = 0;

        user.markModified("money");
        user.save();
    } else {
        if(toWithdraw <= 0 || isNaN(toWithdraw) || toWithdraw > user.bank) return message.channel.send('⚠️ Vous ne pouvez pas récupérer un nombre nul ou négatif ou plus de ce que vous avez.');

        message.channel.send(`✅ **${parseInt(toWithdraw)}${data.plugins.economy.currency}** ont été ajoutés à votre balance.`);

        user.money = user.money + parseInt(toWithdraw);
        user.bank = user.bank - parseInt(toWithdraw);

        user.markModified("money");
        user.save();
    }
}

module.exports.help = {
    name: "withdraw",
    aliases: ["withdraw", "with"],
    category: "Economy",
    description: "Déposer l'argent de votre balance dans votre banque",
    usage: "<money | all>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}