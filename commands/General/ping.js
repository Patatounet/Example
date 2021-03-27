const emojis = require('../../emojis');
const Guild = require('../../models/Guild');

module.exports.run = async (client, message) => {
    const embed = {
        color: client.config.embed.color,
        fields: [
            { name: '**Latence messages**', value: emojis.chargement },
            { name: '**Latence API**', value: emojis.chargement },
            { name: '**Base de données**', value: emojis.chargement },
        ],
        footer: {
            text: client.config.embed.footer,
            icon_url: client.user.displayAvatarURL()
        }
    };

    message.channel.send({ embed: embed }).then(async (m) => {
        embed.fields[0].value = `${Date.now() - m.createdTimestamp}ms`;

        embed.fields[1].value = `${client.ws.ping}ms`;

        const date = Date.now();
        await Guild.findOne({ id: message.guild.id });

        embed.fields[2].value = `${Date.now() - date}ms`;

        await m.edit({ embed: embed });
    });
}

module.exports.help = {
    name: "ping",
    aliases: ["ping"],
    category: "General",
    description: "Vérifier la latence du bot",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: [],
    args: false
}
