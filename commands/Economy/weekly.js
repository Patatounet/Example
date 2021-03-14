const ms = require('ms');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(user.cooldowns.weekly > Date.now()) return message.channel.send(`❌ Vous avez déjà récupéré votre récompense hebdomadaire, réessayez dans **${ms(user.cooldowns.weekly - Date.now())}**.`);

    const winned = Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000;

    message.channel.send(`✅ Vous avez récupéré votre récompense hebdomaire, **${winned}${data.plugins.economy.currency}** ont été rajoutés à votre balance.`);

    user.money = user.money + winned;
    user.cooldowns.weekly = (Date.now() + 60 * 60 * 24 * 7 * 1000);

    user.markModified("cooldowns.weekly");
    user.save();
}

module.exports.help = {
    name: "weekly",
    aliases: ["weekly"],
    category: "Economy",
    description: "Récupérer sa récompense hebdomadaire",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: false
}