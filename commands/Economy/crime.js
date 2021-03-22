const ms = require('ms');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(user.cooldowns.crime > Date.now()) return message.channel.send(`❌ Hey ! Vous avez déjà commis un crime aujourd'hui, vous pourrez en refaire un dans **${ms(user.cooldowns.crime - Date.now())}**`);

    if((user.money + user.bank) < 1) return message.channel.send('❌ Vous ne pouvez pas utiliser la commande `crime` lorsque votre total est négatif ou nul !');

    const chanceToWin = Math.floor(Math.random() * 100) + 1;

    if(chanceToWin >= 60) {
        const winnedPercentage = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
        const winned = Math.floor(((user.money + user.bank) * winnedPercentage) / 100);

        message.channel.send(`✅ Vous avez réussi votre crime ! **${winned}${data.plugins.economy.currency}** ont été rajoutés à votre balance.`);
    
        user.money = user.money + winned;
        user.cooldowns.crime = (Date.now() + 60 * 60 * 8 * 1000); // 8h
    
        user.markModified("cooldowns.crime");
        user.save();
    } else {
        const lost = Math.floor(((user.money + user.bank) * 10) / 100);

        message.channel.send(`❌ Vous avez été remarqué avant même d'avoir commis le crime, la police vous a attrapée à temps. Vous avez perdu **${lost}${data.plugins.economy.currency}**.`);

        user.money = user.money - lost;
        user.cooldowns.crime = (Date.now() + 60 * 60 * 8 * 1000);

        user.markModified("cooldowns.crime");
        user.save();
    }
}

module.exports.help = {
    name: "crime",
    aliases: ["crime"],
    category: "Economy",
    description: "Commettre un crime et avoir une chance de gagner de l'argent ou d'en perdre",
    usage: "",
    cooldown: 2,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}
