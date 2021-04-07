module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    function formatRank(r) {
        switch (r) {
            case 1: r = '🥇'; break;
            case 2: r = '🥈'; break;
            case 3: r = '🥉'; break;
            default: r = r + '.';
        }

        return r;
    }

    const allUsers = (await require('../../models/User').find().sort({
            bank: -1,
            money: -1
        }).limit(10))
        .map(user => {
            return {
                total: user.money + user.bank,
                ...user
            }
        })
        .sort((a, b) => b.total - a.total);

    const embed = {
        color: client.config.embed.color,
        title: 'Top 10 des utilisateurs de RainsBot les plus riches',
        description: allUsers.find(u => u._doc.id === message.author.id) ? `GG ! Vous faites parti du top 10 !` : `Vous ne faites pas parti du top 10.`,
        author: {
            icon_url: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username
        },
        fields: [],
        footer: {
            text: client.config.embed.footer,
            icon_url: client.user.displayAvatarURL()
        }
    }

    for (const [i, user] of allUsers.entries()) {
        await client.users.fetch(user._doc.id).then((rUser) => {
            embed.fields.push({ name: `${formatRank(i + 1)} ${rUser.username}`, value: `**${client.formatNumber(user.total)}$**` })
        }).catch(() => {
            embed.fields.push({ name: `${formatRank(i + 1)} Utilisateur inconnu`, value: `**${client.formatNumber(user.total)}$**` });
        });
    }

    message.channel.send({ embed });
}

module.exports.help = {
    name: "top-money",
    aliases: ["top-money", "moneyleaderboard", "money-leaderboard", "top"],
    category: "Economy",
    description: "Voir le top 10 des utilisateurs de RainsBot avec le plus d'argent",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}
