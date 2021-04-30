const ms = require('ms');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(user.cooldowns.daily > Date.now()) return message.channel.send(`❌ Vous avez déjà récupéré votre récompense journalière, réessayez dans **${ms(user.cooldowns.daily - Date.now())}**.`);

    const winned = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;

    message.channel.send(`✅ Vous avez récupéré votre récompense journalière, **${winned}${data.plugins.economy.currency}** ont été rajoutés à votre balance.`);

    user.money = user.money + winned;
    user.cooldowns.daily = (Date.now() + 60 * 60 * 24 * 1000);

    user.markModified("cooldowns.daily");
    user.save();
}

module.exports.help = {
    name: "daily",
    aliases: ["daily"],
    category: "Economy",
    description: "Récupérer sa récompense journalière.",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: false
}
