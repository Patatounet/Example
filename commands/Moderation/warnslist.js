const { Util } = require('discord.js');

module.exports.run = async (client, message, args, data) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(u => u.user.username.toLowerCase().includes(args[0]?.toLowerCase())) || message.guild.member(message.author);

    const dbUser = await client.findOrCreateUser(member.user);

    if(!dbUser || dbUser?.warns?.length < 1) return message.channel.send('⚠️ Cet utilisateur n\'a pas de warns à afficher.');

    function displayNumber(r) {
        return r + " |";
    }

    const page = args[1] ? args[1] : 1;
    let i0 = page * 10 - 10;
    let i1 = page * 10;

    dbUser.warns = dbUser.warns.filter(warn => warn.guildID == message.guild.id);

    if(isNaN(parseInt(page)) || parseInt(page) < 1 || (parseInt(page) > Math.ceil(dbUser.warns.length / 10))) return message.channel.send(`⚠️ Impossible d'aller à la page spécifiée.`);

    let embed = {
        color: client.config.embed.color,
        author: {
            name: message.author.username,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
        },
        title: `Page ${page}/${Math.ceil(dbUser.warns.length / 10)}`,
        description: `Vous visionnez actuellement les warns de **${member.user.tag}**\n\n`,
        thumbnail: {
            url: message.guild.iconURL({ dynamic: true })
        },
        footer: {
            text: `${data.prefix}warnslist [membre] [page]`,
            icon_url: client.user.displayAvatarURL()
        }
    }

    dbUser.warns.slice(i0, i1).forEach(warn => {
        embed.description += `${displayNumber(++i0)} Warn par **${client.users.cache.get(warn.moderator) ? Util.escapeMarkdown(client.users.cache.get(warn.moderator).tag) : "Utilisateur inconnu"}**. Raison: **${warn.reason ? Util.escapeMarkdown(warn.reason) : "Aucune raison spécifiée"}**\n`;
    });

    await message.channel.send({ embed: embed });
}

module.exports.help = {
    name: "warnslist",
    aliases: ["warnslist", "warnlist", "vwarns", "view-warns", "warns"],
    category: "Moderation",
    description: "Voir la liste des warns d'un membre du serveur",
    usage: "[membre] [page]",
    cooldown: 5,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}