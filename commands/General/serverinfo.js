const { MessageEmbed } = require("discord.js");
const emojis = require('../../emojis');
const moment = require('moment');

module.exports.run = (client, message) => {
    if(!message.guild.available) return;

    let guild = message.guild;

    let guildNotifications = guild.defaultMessageNotifications;

    if(guildNotifications == "ALL") guildNotifications = 'Tous les messages';
    if(guildNotifications == "MENTIONS") guildNotifications = 'Mentions uniquement';

    let guildVerificationLevel = guild.verificationLevel;
    switch (guildVerificationLevel) {
        case "NONE": guildVerificationLevel = 'Aucune restriction'; break;
        case "LOW": guildVerificationLevel = 'Faible - Doit avoir une adresse e-mail vérifiée sur son compte Discord.'; break;
        case "MEDIUM": guildVerificationLevel = 'Moyen - Doit aussi être inscrit sur Discord depuis plus de 5 minutes.'; break;
        case "HIGH": guildVerificationLevel = 'Élevé - Doit aussi être un membre de ce serveur depuis plus de 10 minutes.'; break;
        case "VERY_HIGH": guildVerificationLevel = 'Maximum - Doit avoir un numéro de téléphone vérifié sur son compte Discord.'; break;
    };

    let embed = {
        color: client.config.embed.color,
        author: {
            name: guild.name,
            icon_url: guild.iconURL({ dynamic: true })
        },
        thumbnail: {
            url: guild.iconURL()
        },
        fields: [
            {
                name: '__Informations générales__',
                value: `🏷️ **Nom du serveur :** ${guild.name}\n👑 **Propriétaire :** ${guild.members.cache.find(u => u.user.id === guild.ownerID).user.tag}\n🆕 **Date de création :** ${moment(guild.createdAt).locale("fr").format("llll")}\n🚩 **Région :** ${guild.region.charAt(0).toUpperCase() + guild.region.substr(1).toLowerCase()}\n🔐 **Niveau de vérification :** ${guildVerificationLevel}`
            },
            {
                name: '__Autres informations__',
                value: `**${emojis.boost} Boosts** : ${guild.premiumSubscriptionCount} boosts (Tier ${guild.premiumTier})\n**${emojis.partner} Partenaire ? :** ${guild.partnered ? "Oui" : "Non"}\n🔔 **Notifications :** ${guildNotifications}\n🔇 **Salon AFK :** ${guild.afkChannel ? guild.afkChannel : "Aucun"}\n💬 **Nombre de salons :** ${guild.channels.cache.filter(ch => ch.type === "text").size} ${emojis.textChannel} | ${guild.channels.cache.filter(ch => ch.type === "voice").size} ${emojis.voiceChannel}\n👨 **Nombre de membres :** ${guild.members.cache.filter(m => !m.user.bot).size} Humains | ${guild.members.cache.filter(m => m.user.bot).size} Bots`
            }
        ],
        footer: {
            text: client.config.embed.footer,
            icon_url: client.user.displayAvatarURL()
        }
    }

    if(guild.description) embed.description = guild.description;
    if(guild.bannerURL()) embed.image = {
        url: guild.bannerURL({ format: "png", size: 512 })
    }

    message.channel.send({ embed: embed });
}

module.exports.help = {
    name: "serverinfo",
    aliases: ["serverinfo", "si", "serverinfos", "infoserver", "infosserver", "server-info", "server-infos", "info-server", "infos-server", "serveurinfo", "serveurinfos", "infoserveur", "infosserveur", "serveur-info", "serveur-infos"],
    category: "General",
    description: "Voir des informations sur le serveur",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}
