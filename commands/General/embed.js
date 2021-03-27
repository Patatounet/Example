module.exports.run = async (client, message) => {
    const embed = {
        footer: {
            text: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
        },
        timestamp: new Date()
    };
    const title = await message.channel.send('Quel **titre** voulez-vous donner à votre embed ? (max. 256 chars)\nEnvoyez \'skip\' pour passer cette étape.');

    const filter = (m) => m.author.id === message.author.id;

    message.channel.awaitMessages(filter, { max: 1, time: 30000 })
        .then(async (collectedTitle) => {
            if(!collectedTitle.first().content) return message.channel.send('❌ Merci de spécifier un texte valide!');

            await title.delete().catch(() => {});

            if(collectedTitle.first().content.toLowerCase() !== 'skip') {
                if(collectedTitle.first().content.length > 256) return message.channel.send('❌ Votre titre est trop long.');

                embed.title = collectedTitle.first().content;
            }

            await collectedTitle.first().delete().catch(() => {});

            const color = await message.channel.send('Quelle **couleur** souhaitez-vous mettre à votre embed ? La couleur peut être **hexadécimale** (#7289da), **numérique** (7506394), ou **normale** (blurple).\nEnvoyez \'skip\' pour passer, la couleur par défaut est grise (#2f3136).');

            message.channel.awaitMessages(filter, { max: 1, time: 20000 })
                .then(async (collectedColor) => {
                    if(!collectedColor.first().content) return message.channel.send('❌ Merci de spécifier une couleur!');

                    await color.delete().catch(() => {});

                    if(collectedColor.first().content.toLowerCase() !== 'skip') {
                        const isValid = (require('discord.js').Util.resolveColor(collectedColor.first().content.toUpperCase()) === 'NaN') ? false : true;

                        if(!isValid) return message.channel.send('❌ Couleur invalide');
    
                        embed.color = require('discord.js').Util.resolveColor(collectedColor.first().content.toUpperCase());
                    } else {
                        embed.color = '#2f3136';
                    }

                    await collectedColor.first().delete().catch(() => {});

                    const description = await message.channel.send('Quelle **description** souhaitez-vous donner à votre embed ? (max. 2048 chars).\nEnvoyez \'skip\' pour passer cette étape.');

                    message.channel.awaitMessages(filter, { max: 1, time: 50000 })
                        .then(async (collectedDesc) => {
                            if(!collectedDesc.first().content) return message.channel.send('❌ Merci de spécifier du texte valide!');

                            await description.delete().catch(() => {});

                            if(collectedDesc.first().content.toLowerCase() !== 'skip') {
                                if(collectedDesc.first().content.length > 2048) return message.channel.send('❌ Votre description est trop longue.');

                                embed.description = collectedDesc.first().content;
                            }

                            await collectedDesc.first().delete().catch(() => {});

                            const thumbnail = await message.channel.send('Quelle **icône** souhaitez-vous ajouter à votre embed ? Celle-ci peut être une image ou un lien.\nEnvoyer \'skip\' pour passer cette étape.');

                            message.channel.awaitMessages(filter, { max: 1, time: 30000 })
                                .then(async (collectedThumbnail) => {
                                    if(!collectedThumbnail.first().content && !collectedThumbnail.first().attachments.first()) return message.channel.send('❌ Merci d\'envoyer une image ou un lien.');

                                    await thumbnail.delete().catch(() => {});

                                    if(collectedThumbnail.first().content.toLowerCase() !== 'skip') {
                                        if(collectedThumbnail.first().attachments.first()) {
                                            embed.thumbnail = { url: collectedThumbnail.first().attachments.first().proxyURL };
                                        } else {
                                            if(!collectedThumbnail.first().content.startsWith('https://')) return message.channel.send('❌ Merci d\'envoyer un lien valide!');
    
                                            embed.thumbnail = { url: collectedThumbnail.first().content };
                                        }   
                                    }

                                    await collectedThumbnail.first().delete().catch(() => {});

                                    const image = await message.channel.send('Quelle **image** souhaitez-vous attacher à votre embed ? Celle-ci peut être une image ou un lien.\nEnvoyer \'skip\' pour passer cette étape.');

                                    message.channel.awaitMessages(filter, { max: 1, time: 30000 })
                                        .then(async (collectedImage) => {
                                            if(!collectedImage.first().content && !collectedImage.first().attachments.first()) return message.channel.send('❌ Merci d\'envoyer une image ou un lien.');

                                            await image.delete().catch(() => {});

                                            if(collectedImage.first().content.toLowerCase() !== 'skip') {
                                                if(collectedImage.first().attachments.first()) {
                                                    embed.image = { url: collectedImage.first().attachments.first().proxyURL };
                                                } else {
                                                    if(!collectedImage.first().content.startsWith('https://')) return message.channel.send('❌ Merci d\'envoyer un lien valide!');
            
                                                    embed.image = { url: collectedImage.first().content };
                                                }
                                            }
        
                                            await collectedImage.first().delete().catch(() => {});

                                            if(!embed.title && !embed.description && !embed.image?.url) return message.channel.send('❌ Votre embed doit contenir au moins soit un titre, soit une description, soit une image.');

                                            await message.channel.send({ embed: embed })
                                                .catch((err) => {
                                                    message.channel.send(`Une erreur est surevenue lors de l'envoi de l'embed: \n\`\`\`${err}\`\`\``);
                                                });
                                        })
                                        .catch(() => message.channel.send('Temps écoulé'));
                                })
                                .catch(() => message.channel.send('Temps écoulé'));
                        })
                        .catch(() => message.channel.send('Temps écoulé'));
                })
                .catch(() => message.channel.send('Temps écoulé'));
        })
        .catch(() => message.channel.send('Temps écoulé'));
}

module.exports.help = {
    name: "embed",
    aliases: ["embed", "customembed", "custom-embed"],
    category: "General",
    description: "Créer un embed custom",
    usage: "",
    cooldown: 5,
    memberPerms: ["EMBED_LINKS"],
    botPerms: ["EMBED_LINKS"],
    args: false
}
