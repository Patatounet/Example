module.exports.run = (client, message) => {
    message.channel.send({
        embed: {
            color: client.config.embed.color,
            author: {
                name: message.author.username,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            fields: [
                { name: 'Variables messages de bienvenue et aurevoir', value: '**{user}** ➔ Mentionner le membre \n**{username}** ➔ Nom d\'utilisateur du membre \n**{usertag}** ➔ Tag (nom d\'utilisateur + discriminateur) du membre \n**{guildName}** ➔ Nom du serveur \n**{memberCount}** ➔ Nombre de membres sur le serveur' },
                { name: 'Variables messages de montées en niveau', value: '**{user}** ➔ Mentionner le membre \n**{username}** ➔ Nom d\'utilisateur du membre \n**{usertag}** ➔ Tag (nom d\'utilisateur + discriminateur) du membre \n**{level}** ➔ Level qu\'a atteint la personne \n**{exp}** ➔ Expérience totale de la personne' },
            ],
            footer: {
                text: client.config.embed.footer,
                icon_url: client.user.displayAvatarURL()
            }
        }
    });
}

module.exports.help = {
    name: "variables",
    aliases: ["variables", "variable", "var", "vars"],
    category: 'Config',
    description: "Voir les variables disponibles pour le message de bienvenue et d'aurevoir",
    usage: "",
    cooldown: 5,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: false
}
