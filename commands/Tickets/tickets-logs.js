module.exports.run = async (client, message, args, data) => {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find((c) => c.name.toLowerCase().includes(args[0].toLowerCase()));
    if(!message.guild.channels.cache.get(channel?.id)) return message.channel.send('⚠️ Salon introuvable.');
    if(channel.type !== 'text') return message.channel.send('⚠️ Merci de spécifier un salon textuel.');
    if(!message.guild.me.permissionsIn(channel).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return message.channel.send('⚠️ Permissions insuffisantes ! Vérifier que j\'ai bien les permission d\'envoyer des messages et intégrer des liens dans le salon.');

    data.plugins.tickets
        ? data.plugins.tickets.logs_channel = channel.id
        : data.plugins.tickets = {
            panels: [],
            transcripts_channel: null,
            logs_channel: channel.id
        }

    data.markModified('plugins.tickets');
    data.save().then(() => {
        message.channel.send('✅ Le salon de logs des tickets a bien été enregistré.');
    });
}

module.exports.help = {
    name: "tickets-logs",
    aliases: ["tickets-logs", "ticketslogs", "ticketlogs", "ticket-logs", "ticketlog", "ticketslog"],
    category: 'Tickets',
    description: "Définir un salon pour les logs des tickets.",
    usage: "<channel>",
    cooldown: 3,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: [],
    args: true
}