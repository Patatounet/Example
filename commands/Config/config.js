const { enabled, disabled } = require('../../emojis');

module.exports.run = (client, message, args, data) => {
    message.channel.send({ 
        embed: {
            color: client.config.embed.color,
            author: {
                icon_url: message.guild.iconURL({ dynamic: true }),
                name: message.guild.name
            },
            description: `**Configuration actuelle du serveur ${message.guild.name}** \nSi vous souhaitez activer des plugins, faites \`${data.prefix}enable <plugin>\`. Pour en désactiver faites \`${data.prefix}disable <plugin>\`. Pour plus d'informations, faites \`${data.prefix}help\`\n\u200b`,
            fields: [
                {
                    name: `👋 Message de bienvenue  ${data.plugins.welcome.enabled ? enabled : disabled}`,
                    value: `Message: \`${data.plugins.welcome.message}\` \nSalon: ${data.plugins.welcome.channel ? checkDeleted("welcome") : "`MP`"}`,
                    inline: true
                },
                {
                    name: `💔 Message d\'aurevoir  ${data.plugins.goodbye.enabled ? enabled : disabled}`,
                    value: `Message: \`${data.plugins.goodbye.message}\` \nSalon: ${data.plugins.goodbye.channel ? checkDeleted("goodbye") : "`MP`"}`,
                    inline: false
                },
                {
                    name: `🥇 Levels  ${data.plugins.levels.enabled ? enabled : disabled}`,
                    value: `Salon de montées en niveau: ${data.plugins.levels.level_up_channel ? `<#${data.plugins.levels.level_up_channel}>` : "`Aucun`"} \nMessage de montées de niveau: \`${data.plugins.levels.level_up_message ? data.plugins.levels.level_up_message : 'GG {user} ! Tu passes niveau {level} !'}\``,
                    inline: false
                },
                {
                    name: `💵 Économie ${data.plugins.economy.enabled ? enabled : disabled}`,
                    value: `Devise: \`${data.plugins.economy.currency}\``,
                    inline: true
                },
                {
                    name: `💡 Suggestions ${data.plugins.suggestion.enabled ? enabled : disabled}`,
                    value: `Salon: ${data.plugins.suggestion.channel ? checkDeleted("suggestion") : "`Aucun`"}`,
                    inline: true
                },
                {
                    name: `⚒️ Modération ${data.plugins.logs.enabled ? enabled : disabled}`,
                    value: `Salon de logs: ${data.plugins.logs.channel ? checkDeleted("logs") : "`Aucun`"}`,
                    inline: true
                },
                {
                    name: "🛡️ Protection",
                    value: `Raidmode: ${data.plugins.protection.raidmode ? enabled : disabled}  Anti-give-role: ${data.plugins.protection.antigiverole ? enabled : disabled} \nAntiban: ${data.plugins.protection.antiban ? enabled : disabled}  Antilien: ${data.plugins.protection.antilink ? enabled : disabled} \nAntimaj: ${data.plugins.protection.antimaj ? enabled : disabled} \n**Antispam** ${data.plugins.protection.antispam?.enabled ? enabled : disabled}: Salon(s) ignoré(s): ${data.plugins.protection.antispam?.ignored_channels?.length >= 1 ? data.plugins.protection.antispam.ignored_channels.map(c => `<#${c}>`).join(", ") : "`Aucun`"}`,
                    inline: true
                }
            ],
            footer: {
                icon_url: client.user.displayAvatarURL(),
                text: client.config.embed.footer
            }
        } 
    });

    function checkDeleted(plugin) {
        const channel = client.channels.cache.get(data.plugins[plugin].channel);
        if(!channel) return "**Salon supprimé**";
        else return `<#${channel.id}>`;
    }
}

module.exports.help = {
    name: "config",
    aliases: ["config"],
    category: 'Config',
    description: "Vérifier les paramètres de configuration du serveur",
    usage: "",
    cooldown: 5,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: ["EMBED_LINKS"],
    args: false
}
