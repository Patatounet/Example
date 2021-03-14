module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.levels.enabled) return message.channel.send(`⚠️ Le système de niveau n'est pas activé sur le serveur. Activez-le avec la commande \`${data.prefix}enable levels\``);

    const p = data.members.map(m => m.id).indexOf(message.author.id);
    const userData = data.members[p];
    const dbUser = await client.findOrCreateUser(message.author);

    if(p == -1 || !userData) return message.channel.send('⚠️ Cet utilisateur n\'est pas classé.');
    if(!dbUser) return message.channel.send('❌ Votre compte n\'était pas créé, veuillez réessayer.');

    let toUpdate = args[0].toLowerCase();
    if(!(toUpdate === "progress-bar" || toUpdate === "text" || toUpdate === "avatar")) return message.channel.send(`⚠️ Merci de spécifier un élément valide à éditer. \n**Exemples:** \n\`edit-rankcard progress-bar blue\`\n\`edit-rankcard text #ffff00\`\n\`edit-rankcard avatar 1015739\``);
    
    let newColor = args[1]?.toUpperCase();
    const isValid = (require('discord.js').Util.resolveColor(newColor) === "NaN") ? false : true;

    if(!args[1] || !isValid) return message.channel.send(`⚠️ Merci de spécifier une couleur valide. \n**Exemples:** \n\`edit-rankcard progress-bar blue\`\n\`edit-rankcard text #ffff00\`\n\`edit-rankcard avatar 1015739\``);

    if(!isNaN(newColor)) newColor = newColor.toString(16);

    const msg = await message.channel.send('**Voici une prévisualisation de votre rankcard :**\nVoulez-vous enregistrer les modifications ?', { files: 
        [{ attachment: await client.generateRankcard(message.member, userData, { 
            progress_bar_color: ((toUpdate === "progress-bar") ? newColor : dbUser.rankcard.progress_bar_color),
            text_color: ((toUpdate === "text") ? newColor : dbUser.rankcard.text_color),
            avatar_color: ((toUpdate === "avatar") ? newColor : dbUser.rankcard.avatar_color)
        }), name: "rank.png" }]
    });

    await msg.react("✅");
    await msg.react("❌");

    const filter = (reaction, user) => {
        return ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    msg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
        .then(collected => {
            if(collected.first().emoji.name === "✅") {
                msg.reactions.removeAll();

                switch (toUpdate) {
                    case 'progress-bar': toUpdate = "progress_bar_color"; break;
                    case 'text': toUpdate = "text_color"; break;
                    case 'avatar': toUpdate = "avatar_color"; break;
                }

                dbUser.rankcard[toUpdate] = newColor;

                dbUser.markModified("rankcard");
                dbUser.save();

                message.channel.send("✅ Les modifications ont bien été enregistrées à votre rankcard.")
            } else if(collected.first().emoji.name === "❌") {
                msg.reactions.removeAll();

                message.channel.send("ℹ️ Les modifications n'ont pas été enregistrées.");
            }
        })
        .catch(() => message.channel.send('Temps écoulé'));
}

module.exports.help = {
    name: "edit-rankcard",
    aliases: ["edit-rankcard", "rankcard", "rank-card", "editrankcard"],
    category: 'Levels',
    description: "Editer les couleurs de sa rankcard.",
    usage: "<progress-bar | text | avatar>",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: true
}