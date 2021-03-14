const ms = require('ms');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(user.cooldowns.work > Date.now()) return message.channel.send(`❌ Hey ! Vous avez déjà travaillé aujourd'hui, vous pourrez travailler à nouveau dans **${ms(user.cooldowns.work - Date.now())}**`);

    const winned = Math.floor(Math.random() * (4000 - 300 + 1)) + 300;

    message.channel.send(`✅ Vous avez bien travaillé aujourd'hui, **${winned}${data.plugins.economy.currency}** ont été rajoutés à votre balance.`);

    user.money = user.money + winned;
    user.cooldowns.work = (Date.now() + 60 * 60 * 4 * 1000); // 4h

    user.markModified("cooldowns.work");
    user.save();
}

module.exports.help = {
    name: "work",
    aliases: ["work"],
    category: "Economy",
    description: "Travailler et gagner une somme d'argent aléatoire entre 300 et 4 000",
    usage: "",
    cooldown: 2,
    memberPerms: [],
    botPerms: [],
    args: false
}