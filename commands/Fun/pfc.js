const { MessageEmbed } = require("discord.js");

module.exports.run = (client, message, args) => {
    let authorAttack = args[0].toLowerCase();
    if(authorAttack === "pierre" || authorAttack === "feuille" || authorAttack === "ciseaux") {
        const attacks = ["pierre", "feuille", "ciseaux"];
        const randomNumber = Math.floor(Math.random() * attacks.length);
        let attack = attacks[randomNumber];

        let text = `**${message.author.username}**, vous avez choisi **${authorAttack}**. J'ai choisi **${attack}**.`;
        
        const embed = new MessageEmbed()
            .setColor(client.config.embed.color)
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setFooter(client.config.embed.footer, client.user.displayAvatarURL());

        authorAttack = authorAttack.charAt(0);
        attack = attack.charAt(0);

        switch (authorAttack + attack) {
            case "pc":
            case "fp":
            case "cf":
                text += "\nVous avez gagné!";
                break;
            case "cp":
            case "pf":
            case "fc":
                text += "\nVous avez perdu :(";
                break;
            case "pp":
            case "ff":
            case "cc":
                text += "\nC'est une égalité!";
                break;
        }

        embed.setDescription(text);
        return message.channel.send(embed);
    } else {
        return message.channel.send('⚠️ Vous devez préciser l\'une des possibilités suivantes: `pierre`, `feuille`, `ciseaux`.');
    }
}

module.exports.help = {
    name: "pfc",
    aliases: ["pfc", "pierrefeuilleciseaux", "pierre-feuille-ciseaux", "papiercaillouciseaux", "papier-caillou-ciseaux"],
    category: "Fun",
    description: "Jouer au pierre feuille ciseaux !",
    usage: "<pierre | feuille | ciseaux>",
    cooldown: 3,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: true
}