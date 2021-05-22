module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    const bet = parseInt(args[0]);
    if(isNaN(bet) || bet < 1) return message.channel.send('⚠️ Merci de spécifier une somme valide!');
    if(bet > user.money) return message.channel.send('⚠️ Vous ne pouvez pas miser plus que ce que vous avez dans votre balance !');

    user.money -= bet;
    await user.save();
    

    const slots = ['🍀', '💯', '🍒', '💎', '🍊'];
    const results = [[], [], []];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            results[i].push(slots[Math.floor(Math.random() * slots.length)]);
        }
    }

    let text = '```';
    for (let i = 0; i < 3; i++) {
        text += '\n';

        for (let j = 0; j < 3; j++) {
            if(i === 1 && j === 2) text += (results[i][j] + ' <-');
            else if(i === 1 && j === 0) text += (' -> ' + results[i][j])
            else if(j === 0) text += ('\t' + results[i][j]);
            else text += results[i][j];
        }
    }

    if(results[1].every((a) => results[1][0] === a)) {
        text += `\`\`\`\n\n**nWow ! Vous avez gagné, vous remportez ${bet * 3}${data.plugins.economy.currency}** !`;

        user.money *= 3;
        await user.save();
    } else {
        text += '```\n\n**Oh non, vous avez perdu, retentez votre chance !**';
    }

    return message.channel.send({
        embed: {
            color: client.config.embed.color,
            author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
            thumbnail: { url: client.user.displayAvatarURL() },
            description: text,
            footer: { text: client.config.embed.footer, icon_url: client.user.displayAvatarURL() }
        }
    });
}

module.exports.help = {
    name: "slot",
    aliases: ["slot", "slot-machine", "slotmachine"],
    category: "Economy",
    description: "Jouer à la lotterie !",
    usage: "<bet>",
    cooldown: 2,
    memberPerms: [],
    botPerms: [],
    args: true
}