module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    const bet = parseInt(args[0]);
    const played = parseInt(args[1]);

    if(isNaN(bet) || !bet) return message.channel.send('❌ Merci de spécifier de l\'argent à parier.');
    if(bet > user.money || bet < 1) return message.channel.send('⚠️ Vous ne pouvez miser plus que ce vous avez dans votre balance !');

    if(isNaN(played) || !played || played < 2 || played > 12) return message.channel.send('❌ Merci de parier sur un nombre entre 2 et 12!');

    user.money = user.money - bet;
    user.markModified("money");
    user.save();

    const MSG = await message.channel.send(`${require('../../emojis').chargement} **Lancement des dés...**`);

    const firstResult = Math.floor(Math.random() * 6) + 1;
    const secondResult = Math.floor(Math.random() * 6) + 1;

    let won;

    if(played === firstResult + secondResult) won = true;
    else won = false;

    let text = `🎲 Premier dé : ${firstResult}`

    message.channel.send(text).then(async (msg) => {    
        setTimeout(() => {
            msg.edit(text += `\n🎲 Deuxième dé : ${secondResult}`);

            setTimeout(async () => {
                msg.edit(text += `\n\nRésultat final : ${firstResult + secondResult}\n${won ? `🎉 Tu as gagné ! **${bet * 4}${data.plugins.economy.currency}** ont été rajoutés à votre balance.` : 'Vous avez perdu, retentez votre chance !'}`);

                await MSG.delete().catch(() => {});

                if(won) {
                    user.money = user.money + bet * 4;
                    user.markModified("money");
                    user.save();
                }
            }, 2000);
        }, 4000);
    });
}

module.exports.help = {
    name: "dice",
    aliases: ["dice"],
    category: "Economy",
    description: "Jouer aux dés !",
    usage: "<argent à parier> <numéro parié>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}