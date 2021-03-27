const ms = require('ms');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(user.cooldowns.rob > Date.now()) return message.channel.send(`❌ Hey ! Vous avez déjà volé quelqu'un aujourd'hui, vous pourrez refaire cette action dans **${ms(user.cooldowns.rob - Date.now())}**`);

    let mentionnedUser = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(u => u.username.toLowerCase().includes(args[0].toLowerCase()));

    if(!mentionnedUser || !message.guild.member(mentionnedUser)) return message.channel.send('⚠️ Cet utilisateur n\'existe pas !');
    mentionnedUser = await client.findOrCreateUser(mentionnedUser);

    const lostPercentage = Math.floor(Math.random() * (30 - 40 + 1)) + 40;
    const lost = Math.floor(((user.money + user.bank) * lostPercentage) / 100);

    if(mentionnedUser?.money < 1) {
        message.channel.send(`❌ Pourquoi vous voulez voler une pauvre personne ? Vous avez perdu **${lost}${data.plugins.economy.currency}**.`);

        user.money = user.money - lost;
        user.cooldowns.rob = (Date.now() + 60 * 60 * 12 * 1000);

        user.markModified("money");
        user.markModified("cooldowns.rob");
        return user.save();
    }

    const chanceToWin = Math.floor(Math.random() * 100) + 1;

    if(chanceToWin >= 70) {
        const winnedPercentage = Math.floor(Math.random() * (60 - 70 + 1)) + 70;
        const winned = Math.floor((mentionnedUser.money * winnedPercentage) / 100);

        message.channel.send(`✅ ${message.author} a volé **${winned}${data.plugins.economy.currency}** à ${client.users.cache.get(mentionnedUser.id)} !`);

        user.money = user.money + winned;
        user.cooldowns.rob = (Date.now() + 60 * 60 * 12 * 1000); // 12h
    
        user.markModified("cooldowns.rob");
        await user.save();

        mentionnedUser.money = mentionnedUser.money - winned;
        mentionnedUser.save();
    } else {
        message.channel.send(`❌ Vous avez raté le vol, et fut attrapé tel un lâche. Vous avez perdu ${lost}${data.plugins.economy.currency}.`);

        user.money = user.money - lost;
        user.cooldowns.rob = (Date.now() + 60 * 60 * 12 * 1000);

        user.markModified("cooldowns.rob");
        user.save();
    }
}

module.exports.help = {
    name: "rob",
    aliases: ["rob"],
    category: "Economy",
    description: "Voler un autre utilisateur. A vos risques et périls !",
    usage: "<membre>",
    cooldown: 2,
    memberPerms: [],
    botPerms: [],
    args: true
}
