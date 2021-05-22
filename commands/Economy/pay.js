module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    let mentionnedUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => {});
    if(!mentionnedUser) return message.channel.send('⚠️ Ce membre n\'existe pas !');
    if(mentionnedUser.user.bot) return message.channel.send('⚠️ Vous ne pouvez pas donner de l\'argent a un bot !');
    if(mentionnedUser.id === message.author.id) return message.channel.send('⚠️ Vous ne pouvez pas donner de l\'argent à vous même (?)');

    mentionnedUser = await client.findOrCreateUser(mentionnedUser);
    if(!mentionnedUser) return message.channel.send('⚠️ Ce membre n\'avait pas de compte en banque, veuillez réessayer.');

    const user = await client.findOrCreateUser(message.author);

    const toGive = Math.floor(args[1]);
    if(!toGive || isNaN(toGive) || toGive < 1) return message.channel.send('⚠️ Merci de spécifier un montant valide !');
    if(toGive > user?.money) return message.channel.send('⚠️ Vous ne pouvez pas donner plus que ce que vous avez dans votre balance !');

    user.money -= toGive;
    mentionnedUser.money += toGive;
    user.save().then(async () => {
        await mentionnedUser.save();
    });

    message.channel.send(`✅ **${message.author.tag}** a donné **${toGive}${data.plugins.economy.currency}** à <@${mentionnedUser.id}> !`);
}

module.exports.help = {
    name: "pay",
    aliases: ["pay"],
    category: "Economy",
    description: "Donner de l'argent à un membre.",
    usage: "<membre> <argent>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}
