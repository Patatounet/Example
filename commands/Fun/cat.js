const fetch = require('node-fetch');
const emojis = require('../../emojis');

module.exports.run = async (client, message) => {
    let msg = await message.channel.send(`Chargement de l'image... ${emojis.chargement}`);

    const cat = await fetch("https://api.thecatapi.com/v1/images/search")
        .then(res => res.json())
        .then(json => json[0].url);

    message.channel.send({
        embed: {
            color: client.config.embed.color,
            description: `[\`[Lien vers l'image]\`](${cat})`,
            image: {
                url: cat
            },
            footer: {
                text: client.config.embed.footer,
                icon_url: client.user.displayAvatarURL()
            }
        }
    });
    await msg.delete().catch(() => {});
}

module.exports.help = {
    name: "cat",
    aliases: ["cat", "cats"],
    category: "Fun",
    description: "Envoie une image de chat aléatoire !",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}