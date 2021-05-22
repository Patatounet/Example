module.exports.run = async (client, message, args, data) => {
    if(data.plugins.tickets?.panels?.length >= 5) return message.channel.send('⚠️ Vous avez atteint la limite de 5 panels de tickets.');
    const filter = (m) => m.author.id === message.author.id;

    const panelNameMsg = await message.channel.send('Quel nom souhaitez-vous donner à votre panel ?');
    const panelNameColl = message.channel.createMessageCollector(filter, { time: 60000, max: 5 });
    panelNameColl.on('collect', async (collectedPanelName) => {
        const panelName = collectedPanelName.content;
        if(!panelName) return message.channel.send('⚠️ Merci de spécifier un texte valide.');
        if(panelName.length > 250) return message.channel.send('⚠️ Le nom ne peut pas faire plus de 250 caractères.');

        panelNameMsg.delete().catch(() => {});
        collectedPanelName.delete().catch(() => {});

        panelNameColl.stop();

        const descriptionMsg = await message.channel.send('Quel description voulez-vous afficher sur votre panel ?');
        const descriptionColl = message.channel.createMessageCollector(filter, { time: 60000, max: 5 });
        descriptionColl.on('collect', async (collectedDescription) => {
            const description = collectedDescription.content;
            if(!description) return message.channel.send('⚠️ Merci de spécifier un texte valide.');
            if(description.length > 2000) return message.channel.send('⚠️ La description ne peut pas faire plus de 2000 caractères.');

            descriptionMsg.delete().catch(() => {});
            collectedDescription.delete().catch(() => {});

            descriptionColl.stop();

            const askImageMsg = await message.channel.send('Voulez-vous attacher une image a votre panel ?');
            const rArr = ['✅', '❌'];
            rArr.forEach((r) => askImageMsg.react(r));

            askImageMsg.awaitReactions((reaction, user) => rArr.includes(reaction.emoji.name) && user.id === message.author.id, { max: 1, time: 60000 })
                .then(async (collected) => {
                    askImageMsg.delete().catch(() => {});

                    if(collected.first()?.emoji.name === rArr[0]) {
                        const imageMsg = await message.channel.send('Envoyez l\'image a afficher dans votre panel.');
                        const imageColl = message.channel.createMessageCollector(filter, { time: 60000, max: 5 });
                        imageColl.on('collect', async (collectedImage) => {
                            const image = collectedImage.attachments.first()?.url;
                            if(!image) return message.channel.send('⚠️ Merci d\'envoyer une image !');

                            imageMsg.delete().catch(() => {});

                            imageColl.stop();

                            await afterImage(image);
                        });

                        imageColl.on('end', (_, reason) => {
                            if(reason === 'time') return message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.');
                            if(reason === 'limit') return message.channel.send('❌ Vous avez fait trop d\'essais, veuillez réessayer.');
                        });
                    } else {
                        await afterImage();
                    }

                    async function afterImage(image) {
                        const reactionMsg = await message.channel.send('Avec quelle réaction devront réagir les membres aux panel pour ouvrir un ticket ? Réagissez à ce message avec l\'emoji souhaité !');
                        reactionMsg.awaitReactions((_, user) => user.id === message.author.id, { max: 1, time: 60000 })
                            .then(async (collectedR) => {
                                const reaction = collectedR.first();
                                if(!reaction) return message.channel.send('⚠️ Merci de réagir avec un emoji valide !');
                                if(reaction.emoji.id && !message.guild.emojis.cache.get(emoji.id)) return message.channel.send('⚠️ Merci de me donner un emoji présent sur le serveur !');

                                reactionMsg.delete().catch(() => {});

                                const categoryMsg = await message.channel.send('Dans quelle catégorie voulez-vous que les tickets créés via ce panel soient ? Envoyez \'aucune\' pour les mettre dans aucune catégorie.');
                                const categoryColl = message.channel.createMessageCollector(filter, { time: 60000, max: 5 });
                                categoryColl.on('collect', async (collectedCategory) => {
                                    const categoryM = collectedCategory.content;
                                    if(!categoryM) return message.channel.send('⚠️ Merci de spécifier du contenu valide.');

                                    let category = null
                                    if(categoryM.toLowerCase() !== 'aucune') {
                                        category = collectedCategory.mentions.channels.first() || message.guild.channels.cache.get(categoryM) || collected.guild.channels.cache.find((c) => c.name.toLowerCase().includes(categoryM));
                                        if(!message.guild.channels.cache.get(category?.id)) return message.channel.send('⚠️ Catégorie introuvable.');
                                        if(category.type !== 'category') return message.channel.send('⚠️ Merci de spécifier une catégorie !');
                                        if(!message.guild.me.permissionsIn(category).has('MANAGE_CHANNELS')) return message.channel.send('⚠️ Je n\'ai pas les permissions de créer des salons dans cette catégorie !');
                                    }

                                    categoryMsg.delete().catch(() => {});
                                    collectedCategory.delete().catch(() => {});

                                    categoryColl.stop();

                                    const channelMsg = await message.channel.send('Dans quel salon voulez-vous envoyer le panel ?');
                                    const channelColl = message.channel.createMessageCollector(filter, { time: 60000, max: 5 });
                                    channelColl.on('collect', async (collectedChannel) => {
                                        const channelM = collectedChannel.content;
                                        if(!channelM) return message.channel.send('⚠️ Merci de spécifier du contenu valide.');

                                        const channel = collectedChannel.mentions.channels.first() || message.guild.channels.cache.get(channelM) || message.guild.channels.cache.find((c) => c.name.toLowerCase().includes(channelM));
                                        if(!message.guild.channels.cache.get(channel?.id)) return message.channel.send('⚠️ Salon introuvable.');
                                        if(channel.type !== 'text') return message.channel.send('⚠️ Merci de spécifier un salon textuel !');
                                        if(!message.guild.me.permissionsIn(channel).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return message.channel.send('⚠️ Je n\'ai pas les permissions de parler ou d\'intégrer des liens dans ce salon !');

                                        channelMsg.delete().catch(() => {});
                                        collectedChannel.delete().catch(() => {});

                                        channelColl.stop();

                                        channel.send({
                                            embed: {
                                                color: client.config.embed.color,
                                                title: panelName,
                                                description,
                                                image: image ? { url: image } : null,
                                                footer: { text: client.config.embed.footer, icon_url: client.user.displayAvatarURL() }
                                            }
                                        }).then((m) => {
                                            m.react(reaction.emoji.id || reaction.emoji.name);

                                            data.plugins.tickets?.panels
                                                ? data.plugins.tickets.panels.push({ panelID: m.id, reaction: reaction.emoji.id || reaction.emoji.name, panelName, ticketsCount: 0, category: category?.id })
                                                : data.plugins.tickets = {
                                                    panels: [{ panelID: m.id, reaction: reaction.emoji.id || reaction.emoji.name, panelName, ticketsCount: 0, category: category?.id }],
                                                    transcripts_channel: null,
                                                    logs_channel: null
                                                }

                                            data.markModified('plugins.tickets');
                                            data.save().then(() => {
                                                message.channel.send(`✅ Le panel a bien été créé dans le salon ${channel} !`);
                                            });
                                        });
                                    });

                                    channelColl.on('end', (_, reason) => {
                                        if(reason === 'time') return message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.');
                                        if(reason === 'limit') return message.channel.send('❌ Vous avez fait trop d\'essais, veuillez réessayer.');
                                    });
                                });

                                categoryColl.on('end', (_, reason) => {
                                    if(reason === 'time') return message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.');
                                    if(reason === 'limit') return message.channel.send('❌ Vous avez fait trop d\'essais, veuillez réessayer.');
                                });
                            })
                            .catch((err) => message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.'));
                    }
                })
                .catch(() => message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.'));
        });

        descriptionColl.on('end', (_, reason) => {
            if(reason === 'time') return message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.');
            if(reason === 'limit') return message.channel.send('❌ Vous avez fait trop d\'essais, veuillez réessayer.');
        });
    });

    panelNameColl.on('end', (_, reason) => {
        if(reason === 'time') return message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.');
        if(reason === 'limit') return message.channel.send('❌ Vous avez fait trop d\'essais, veuillez réessayer.');
    });
}

module.exports.help = {
    name: "create-panel",
    aliases: ["create-panel", "cpanel", "panel-create", "createpanel", "panel"],
    category: 'Tickets',
    description: "Créer un panel de ticket sur le serveur.",
    usage: "",
    cooldown: 5,
    memberPerms: ["EMBED_LINKS", "MANAGE_CHANNELS"],
    botPerms: ["EMBED_LINKS", "MANAGE_GUILD", "MANAGE_CHANNELS"],
    args: false
}