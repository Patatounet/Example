module.exports.run = async (client, message, args, data) => {
    const enableMessage = await message.channel.send('Voulez-vous activer ou désactiver le captcha ?');
    const rArr = ['✅', '❌'];
    rArr.forEach((reaction) => enableMessage.react(reaction));

    enableMessage.awaitReactions((reaction, user) => rArr.includes(reaction.emoji.name) && user.id === message.author.id, { max: 1, time: 60000 })
        .then(async (collectedEnable) => {
            enableMessage.delete().catch(() => {});
            const reaction = collectedEnable.first()?.emoji?.name;

            if(reaction === '✅') {
                const reactions = {
                    '1️⃣': 'Facile - Lettres uniquement.',
                    '2️⃣': 'Moyen - Lettres et des chiffres.',
                    '3️⃣': 'Difficile - Lettres majuscules ou minuscules et des chiffres.'
                };

                const difficultyMessage = await message.channel.send('**Séléctionnez la difficulté du captcha :**', {
                    embed: {
                        color: client.config.embed.color,
                        author: { name: message.author.tag, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
                        description: Object.entries(reactions).map((r) => `${r[0]} ➔ ${r[1]}`).join('\n'),
                        footer: { text: client.config.embed.footer, icon_url: client.user.displayAvatarURL() }
                    }
                });

                Object.keys(reactions).forEach((r) => difficultyMessage.react(r));

                difficultyMessage.awaitReactions((react, usr) => Object.keys(reactions).includes(react.emoji.name) && usr.id === message.author.id, { max: 1, time: 60000 })
                    .then(async (collectedDifficulty) => {
                        difficultyMessage.delete().catch(() => {});

                        const reaction = collectedDifficulty.first()?.emoji?.name;

                        let difficulty_level;
                        if(reaction === '1️⃣') {
                            difficulty_level = 1;
                        } else if(reaction === '2️⃣') {
                            difficulty_level = 2;
                        } else if(reaction === '3️⃣') {
                            difficulty_level = 3;
                        } else {
                            difficulty_level = 1;
                        }

                        const role = message.guild.roles.cache.get(data.plugins.protection.captcha?.not_verified_role) || await message.guild.roles.create({
                            data: {
                                name: 'Non vérifié',
                                color: '#000000',
                                position: 0,
                                mentionable: false
                            }
                        }).catch((err) => {
                            message.channel.send('❌ Une erreur est survenue lors de la création du rôle, assurez-vous que le bot a les permissions nécessaires.');
                            console.error(err);
                        });

                        message.guild.channels.cache.filter((channel) => channel.id !== data.plugins.protection.captcha?.verif_channel).forEach((channel) => {
                            channel.updateOverwrite(role.id, { VIEW_CHANNEL: false }).catch(() => {});
                        });

                        const verif_channel = message.guild.channels.cache.get(data.plugins.protection.captcha?.verif_channel) || await message.guild.channels.create('verification', {
                            type: 'text',
                            permissionOverwrites: [
                                {
                                    id: role.id,
                                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                                },
                                {
                                    id: message.guild.roles.everyone.id,
                                    deny: ['VIEW_CHANNEL']
                                }
                            ],
                            position: 0
                        }).catch((err) => {
                            message.channel.send('❌ Une erreur est survenue lors de la création du salon, assurez-vous que le bot a les permissions nécessaires.');
                            console.error(err);
                        });

                        data.plugins.protection.captcha = {
                            enabled: true,
                            verif_channel: verif_channel.id,
                            not_verified_role: role.id,
                            difficulty_level
                        }

                        data.markModified('plugins.protection');
                        data.save();

                        return message.channel.send('✅ Le captcha a correctement été mis en place.');
                    })
                    .catch(() => message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.'));
            }

            if(reaction === '❌') {
                if(data.plugins.protection.captcha?.enabled === false) return message.channel.send('❌ Le captcha est déjà désactivé.');

                data.plugins.protection.captcha
                    ? data.plugins.protection.captcha.enabled = false
                    : data.plugins.protection.captcha = {
                        enabled: false,
                        verif_channel: null,
                        difficulty_level: 0
                    }

                data.markModified('plugins.protection');
                await data.save();

                return message.channel.send('✅ Le captcha a bien été désactivé sur le serveur');
            }
        })
        .catch(() => message.channel.send('❌ Vous avez mis trop de temps à répondre, commande annulée.'));
}

module.exports.help = {
    name: "captcha",
    aliases: ["captcha"],
    category: 'Protection',
    description: "Configurer le système de captcha sur le serveur.",
    usage: "",
    cooldown: 5,
    memberPerms: ["KICK_MEMBERS"],
    botPerms: ["KICK_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES"],
    args: false
}