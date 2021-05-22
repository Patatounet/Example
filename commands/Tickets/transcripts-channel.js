module.exports.run = async (client, message, args, data) => {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find((c) => c.name.toLowerCase().includes(args[0].toLowerCase()));
    if(!message.guild.channels.cache.get(channel?.id)) return message.channel.send('⚠️ Salon introuvable.');
    if(channel.type !== 'text') return message.channel.send('⚠️ Merci de spécifier un salon textuel.');
    if(!message.guild.me.permissionsIn(channel).has(['SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS'])) return message.channel.send('⚠️ Permissions insuffisantes ! Vérifier que j\'ai bien les permission d\'envoyer des messages, envoyer des fichiers et intégrer des liens dans le salon.');

    data.plugins.tickets
        ? data.plugins.tickets.transcripts_channel = channel.id
        : data.plugins.tickets = {
            panels: [],
            transcripts_channel: channel.id,
            logs_channel: null
        }

    data.markModified('plugins.tickets');
    data.save().then(() => {
        message.channel.send('✅ Le salon de transcripts des tickets a bien été enregistré.');
    });
}

module.exports.help = {
    name: "transcripts-channel",
    aliases: ["transcripts-channel", "transcriptschannel", "transcript-channel", "transcriptchannel"],
    category: 'Tickets',
    description: "Définir un salon dans lequel envoyer les transcripts de tickets.",
    usage: "<channel>",
    cooldown: 3,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: [],
    args: true
}