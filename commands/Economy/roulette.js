module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    const bet = args[0];
    if(bet > user.money || bet < 1) return message.channel.send('⚠️ Vous ne pouvez miser plus que ce vous avez dans votre balance !');

    let played = args[1];

    if(played === "black" || played === "noir") played = "n";
    if(played === "red" || played === "rouge") played = "r";
    if(played === "green" || played === "vert" || played == 0) played = "v";

    if(!(played === "v" || played === "r" || played === "n") && (played < 0 || played > 36 || isNaN(played)) || isNaN(bet)) return message.channel.send('⚠️ Merci de parier un élément valide. \n**Exemples**: \n`roulette 100 rouge`\n`roulette 100 vert`\n`roulette 100 black`\n`roulette 100 34`');

    user.money = user.money - bet;
    user.save();

    const msg = await message.channel.send(`${require('../../emojis').chargement} Lancement de la roulette...`);

    setTimeout(() => {
        msg.delete();

        const result = Math.floor(Math.random() * 36);

        if(result === 0 && (played === "v" || played === 0)) {
            user.money = user.money + bet * 15;

            user.markModified("money");
            user.save();

            message.channel.send(`🎉 Félicitations ! La roulette est tombée sur le chiffre **0**, vous remportez **${bet * 15}${data.plugins.economy.currency}** !`);
        } else if(result === 0) {
            message.channel.send('La roulette est tombée sur le 0, tu ne gagnes rien.');
        } else if((result % 2 === 0) && played === "n") {
            user.money = user.money + bet * 2;

            user.markModified("money");
            user.save();

            message.channel.send(`La roulette est tombée sur le **${result}**, donc sur le **noir**, tu gagnes **${bet * 2}${data.plugins.economy.currency}**`);
        } else if((result % 2 === 1) && played === "r") {
            user.money = user.money + bet * 2;

            user.markModified("money");
            user.save();

            message.channel.send(`La roulette est tombée sur le **${result}**, donc sur le **rouge**, tu gagnes **${bet * 2}${data.plugins.economy.currency}**`);
        } else if(result == parseInt(played)) {
            user.money = user.money + bet * 15;

            user.markModified("money");
            user.save();

            message.channel.send(`🎉 Félicitations ! La roulette est tombée sur le chiffre **${result}**, vous remportez **${bet * 15}${data.plugins.economy.currency}** !`);
        } else {
            message.channel.send(`La roulette est tombée sur le **${result} ${(result % 2 === 0) ? "noir" : "rouge"}**, vous ne gagnez rien.`);
        }
    }, 10 * 1000);
}

module.exports.help = {
    name: "roulette",
    aliases: ["roulette"],
    category: "Economy",
    description: "Jouer à la roulette russe !",
    usage: "<argent à parier> <numéro parié>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}
