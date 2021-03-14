const emojis = require('../../emojis');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args, data) => {
	let user = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(u => u.username.toLowerCase().includes(args[0].toLowerCase()));

    if(!user || !message.guild.member(user)) return message.channel.send('⚠️ Cet utilisateur n\'existe pas !');
    
    const dbUser = await client.findOrCreateUser(user);

    if(user.id == message.author.id) return message.channel.send(`⚠️ Vous ne pouvez pas vous warn vous même ${emojis.facepalm}`);

    if(!dbUser) return message.channel.send("❌ Oops ! Cet utilisateur n'était pas enregistré, veuillez réessayer.");

    const reason = (args.slice(1).join(" ") || null);

    const member = message.guild.member(user);

    const memberPosition = member.roles.highest.position;
    const moderatorPosition = message.guild.member(message.author).roles.highest.position;
    if(message.guild.ownerID !== message.author.id) {
        if(moderatorPosition <= memberPosition) return message.channel.send(`⚠️ Vous ne pouvez pas warn ce membre.`);
    }

    dbUser.warns.push({ guildID: message.guild.id, reason: reason, moderator: message.author.id });

    dbUser.markModified("warns");
    dbUser.save();

    user.send(`Vous avez été warn sur le serveur **${message.guild.name}** par ${message.author}. Raison: **${reason ? reason : "Aucune raison spécifiée"}**`).catch(() => {});

    message.channel.send(`✅ ${user} a été averti par ${message.author} pour la raison suivante: **${reason ? reason : "Aucune raison spécifiée"}**.\nIl possède désormais ${dbUser.warns.length} warn(s).`);

    if(data.plugins.logs.enabled) {
        if(message.guild.channels.cache.get(data.plugins.logs.channel)) {
            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`L'utilisateur **${user.username}** s'est fait avertir par ${message.author}. Il possède désormais ${dbUser.warns.length} warn(s).`)
                .setFooter(client.config.embed.footer, client.user.displayAvatarURL());
            message.guild.channels.cache.get(data.plugins.logs.channel).send(embed);
        }
    }
}

module.exports.help = {
    name: "warn",
    aliases: ["warn", "warning"],
    category: "Moderation",
    description: "Avertir un membre",
    usage: "<membre> [raison]",
    cooldown: 5,
    memberPerms: ["MANAGE_MESSAGES"],
    botPerms: [],
    args: true
}