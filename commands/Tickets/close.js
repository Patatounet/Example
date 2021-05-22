const { readFileSync, writeFileSync, appendFileSync, unlinkSync } = require('fs');
const { document } = (new (require('jsdom')).JSDOM()).window;
const moment = require('moment');

module.exports.run = async (client, message, args, data) => {
    const ticket = await require('../../models/Ticket').findOne({ ticketID: message.channel.id });
    if(!ticket) return message.channel.send('⚠️ Ce salon n\'est pas un ticket !');

    message.channel.updateOverwrite(ticket.userID, { VIEW_CHANNEL: false })
        .then(() => {
            const reactions = {
                '🔓': 'Réouvrir le ticket',
                '📑': 'Sauvegarder le transcript',
                '❌': 'Supprimer le ticket'
            };

            message.channel.send({
                embed: {
                    color: client.config.embed.color,
                    description: Object.entries(reactions).map((reaction) => `${reaction[0]} ➔ ${reaction[1]}`).join('\n'),
                    footer: { text: client.config.embed.footer, icon_url: client.user.displayAvatarURL() }
                }
            }).then((m) => {
                Object.keys(reactions).forEach((reaction) => m.react(reaction));

                const collector = m.createReactionCollector((reaction, user) => Object.keys(reactions).includes(reaction.emoji.name) && !user.bot, { time: 420000 });
                collector.on('collect', async (reaction, user) => {
                    reaction.users.remove(user).catch(() => {});

                    if(reaction.emoji.name === '🔓') {
                        message.channel.updateOverwrite(ticket.userID, { VIEW_CHANNEL: true })
                            .then(() => {
                                message.channel.send('✅ Le ticket a bien été réouvert.');
                                m.delete().catch(() => {});

                                collector.stop();
                            }).catch(() => {
                                message.channel.send('❌ Une erreur est survenue, assurez-vous que j\'ai les permissions de gérer ce salon et réessayer.');
                                console.error(err);
                            });
                    }

                    if(reaction.emoji.name === '📑') {
                        const embed = await message.channel.send({
                            embed: {
                                color: '#ffee58',
                                description: 'Création du transcript...'
                            }
                        });

                        let allMessages = new (require('discord.js').Collection)();
                        let channelMessages = await message.channel.messages.fetch({ limit: 100 }).catch(console.error);

                        allMessages = allMessages.concat(channelMessages);

                        while (channelMessages.size === 100) {
                            channelMessages = await message.channel.messages.fetch({ limit: 100, before: channelMessages.lastKey() }).catch(console.error);
                            if(channelMessages) allMessages = allMessages.concat(channelMessages);
                        }

                        const messages = allMessages.array().reverse();

                        if(transcriptsChannel) {
                            await transcriptsChannel.send({ files: [{ attachment: readFileSync(`./assets/transcripts/transcript-${ticketsCount}.html`), name: `transcript-${ticketsCount}.html` }] })
                                .then(() => {
                                    unlinkSync(`./assets/transcripts/transcript-${ticketsCount}.html`);
                                });
                        } else {
                            await message.channel.send({ files: [{ attachment: readFileSync(`./assets/transcripts/transcript-${ticketsCount}.html`), name: `transcript-${ticketsCount}.html` }] })
                                .then(() => {
                                    unlinkSync(`./assets/transcripts/transcript-${ticketsCount}.html`);
                                });
                        }

                        await embed.edit({
                            embed: {
                                color: 'GREEN',
                                description: 'Transcript créé.'
                            }
                        });
                    }

                    if(reaction.emoji.name === '❌') {
                        message.channel.send('Le ticket sera supprimé dans 5 secondes...');

                        setTimeout(async () => {
                            await message.channel.delete()
                                .then(async () => {
                                    await ticket.delete();
                                    message.guild.channels.cache.get(data.plugins.tickets.logs_channel)?.send({
                                        embed: {
                                            color: 'RED',
                                            author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
                                            title: 'Ticket supprimé',
                                            fields: [
                                                { name: 'Ticket créé par', value: `<@${ticket.userID}>`, inline: true },
                                                { name: 'Catégorie', value: ticket.panelName, inline: true },
                                                { name: 'Fermé par', value: message.author.toString(), inline: true }
                                            ],
                                            footer: { text: client.config.embed.footer, icon_url: client.user.displayAvatarURL() }
                                        }
                                    });
                                })
                                .catch((err) => {
                                    message.channel.send('❌ Une erreur est survenue, vérifiez que j\'ai les permissions de supprimer le salon.');
                                    console.error(err);
                                });
                        }, 5000);
                    }
                });

                collector.on('end', (_, reason) => {
                    if(reason === 'time') m.reactions.removeAll().catch(() => {});
                });
            });
        }).catch((err) => {
            message.channel.send('❌ Une erreur est survenue, assurez-vous que j\'ai les permissions de gérer ce salon et réessayer.');
            console.error(err);
        });
}

module.exports.help = {
    name: "close",
    aliases: ["close", "closeticket", "close-ticket", "deleteticket", "delete-ticket"],
    category: 'Tickets',
    description: "Fermer un ticket.",
    usage: "",
    cooldown: 5,
    memberPerms: ["MANAGE_GUILD", "MANAGE_CHANNELS"],
    botPerms: ["EMBED_LINKS", "ATTACH_FILES"],
    args: false
}