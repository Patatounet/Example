module.exports.run = (client, message, args, data) => {
    message.channel.send({ 
        embed: {
            color: client.config.embed.color,
            author: {
                icon_url: message.guild.iconURL({ dynamic: true }),
                name: message.guild.name
            },
            description: `**Configuration actuelle du serveur ${message.guild.name}** \nSi vous souhaitez activer ou désactiver certaines plugins, faites \`${data.prefix}enable <plugin>\`. Pour plus d'informations, faites \`${data.prefix}help\``,
            fields: [
                {
                    name: "🌐 Général",
                    value: `Préfixe: \`${data.prefix}\` \nLangue: \`${data.lang}\``,
                    inline: false
                },
                {
                    name: "👋 Message de bienvenue",
                    value: `Activé: \`${data.plugins.welcome.enabled ? "Oui" : "Non"}\` \nMessage: \`${data.plugins.welcome.message}\` \nSalon: ${data.plugins.welcome.channel ? checkDeleted("welcome") : "`MP`"}`,
                    inline: true
                },
                {
                    name: "💔 Message d\'aurevoir",
                    value: `Activé: \`${data.plugins.goodbye.enabled ? "Oui" : "Non"}\` \nMessage: \`${data.plugins.goodbye.message}\` \nSalon: ${data.plugins.goodbye.channel ? checkDeleted("goodbye") : "`MP`"}`,
                    inline: false
                },
                {
                    name: "🥇 Levels",
                    value: `Activé: ${data.plugins.levels.enabled ? "`Oui`" : "`Non`"} \nSalon de montées en niveau: ${data.plugins.levels.level_up_channel ? `<#${data.plugins.levels.level_up_channel}>` : "`Aucun`"} \nMessage de montées de niveau: \`${data.plugins.levels.level_up_message ? data.plugins.levels.level_up_message : 'GG {user} ! Tu passes niveau {level} !'}\``,
                    inline: true
                },
                {
                    name: "💵 Économie",
                    value: `Activée sur le serveur: ${data.plugins.economy.enabled ? '`Oui`' : '`Non`'} \nDevise: \`${data.plugins.economy.currency}\``,
                    inline: true
                },
                {
                    name: "💡 Suggestions",
                    value: `Activé: ${data.plugins.suggestion.enabled ? "`Oui`" : "`Non`"} \nSalon: ${data.plugins.suggestion.channel ? checkDeleted("suggestion") : "`Aucun`"}`,
                    inline: true
                },
                {
                    name: "🛡️ Protection",
                    value: `Raidmode: \`${data.plugins.protection.raidmode ? "Activé" : "Désactivé"}\` \nAnti-give-role: \`${data.plugins.protection.antigiverole ? "Activé" : "Désactivé"}\` \nAntiban: \`${data.plugins.protection.antiban ? "Activé" : "Désactivé"}\` \nAntilien: \`${data.plugins.protection.antilink ? "Activé" : "Désactivé"}\` \nAntimaj: \`${data.plugins.protection.antimaj ? "Activé" : "Désactivé"}\` \n**Antispam**: \nActivé: \`${data.plugins.protection.antispam?.enabled ? "Activé" : "Désactivé"}\` \nSalon(s) ignoré(s): ${data.plugins.protection.antispam?.ignored_channels?.length >= 1 ? data.plugins.protection.antispam.ignored_channels.map(c => `<#${c}>`).join(", ") : "`Aucun`"}`,
                    inline: true
                },
                {
                    name: "⚒️ Modération",
                    value: `Activé: ${data.plugins.logs.enabled ? "`Oui`" : "`Non`"} \nSalon de logs: ${data.plugins.logs.channel ? checkDeleted("logs") : "`Aucun`"}`,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "\u200b",
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
