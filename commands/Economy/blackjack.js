const Blackjack = require('../../models/games/Blackjack');
const { MessageCollector } = require('discord.js');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.economy.enabled) return message.channel.send(`⚠️ Le système d'économie n'est pas activé sur ce serveur. Activez-le avec la commande \`${data.prefix}enable economy\``);

    const bet = args[0];

    let user = await client.findOrCreateUser(message.author);
    if(!user) return message.channel.send('❌ Votre compte en banque n\'était pas créé, veuillez réessayer.');

    if(bet > user.money || bet < 1 || isNaN(bet)) return message.channel.send('⚠️ Vous ne pouvez miser plus que ce vous avez dans votre balance !');

    const game = new Blackjack(message.author, parseInt(bet));

    const msg = await message.channel.send({
        embed: {
            color: client.config.embed.color,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            description: `Envoyez \`hit\` pour piocher une carte, ou envoyez \`stand\` pour passer.`,
            fields: [
                { name: `${message.author.username} (**${game.player.score} points**)`, value: game.player.toString(), inline: true },
                { name: `${client.user.username} (**${game.dealer.score} points**)`, value: game.dealer.toString(), inline: true }
            ],
            footer: {
                text: client.config.embed.footer,
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: new Date()
        }
    });

    const filter = m => m.author.id === message.author.id;
    const collector = new MessageCollector(message.channel, filter, {
        time: 120000,
    });

    collector.on("collect", async tmsg => {
        if(tmsg.content.toLowerCase() === "hit") {
            game.play(true, async (result) => {
                if(result === "continues") {
                    await msg.edit({
                        embed: {
                            color: client.config.embed.color,
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({ dynamic: true })
                            },
                            description: `Envoyez \`hit\` pour piocher une carte, ou envoyez \`stand\` pour passer.`,
                            fields: [
                                { name: `${message.author.username} (**${game.player.score} points**)`, value: game.player.toString(), inline: true },
                                { name: `${client.user.username} (**${game.dealer.score} points**)`, value: game.dealer.toString(), inline: true }
                            ],
                            footer: {
                                text: client.config.embed.footer,
                                icon_url: client.user.displayAvatarURL()
                            },
                            timestamp: new Date()
                        }
                    });
                } else if(result === "lost") {
                    await msg.edit({ 
                        embed: {
                            color: 'RED',
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({ dynamic: true })
                            },
                            description: `Vous avez perdu, **${client.user.username}** a gagné la partie. Vous perdez ${bet}${data.plugins.economy.currency}.`,
                            fields: [
                                { name: `${message.author.username} (**${game.player.score} points**)`, value: game.player.toString(), inline: true },
                                { name: `${client.user.username} (**${game.dealer.score} points**)`, value: game.dealer.toString(), inline: true }
                            ],
                            footer: {
                                text: client.config.embed.footer,
                                icon_url: client.user.displayAvatarURL()
                            },
                            timestamp: new Date()
                        }
                    });

                    user.money = user.money - bet;
                    user.save();

                    collector.stop(true);
                }
            });
        } else if(tmsg.content.toLowerCase() === "stand") {
            game.play(false, async (result) => {
                if(result === "won") {
                    await msg.edit({ 
                        embed: {
                            color: 'GREEN',
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({ dynamic: true })
                            },
                            description: `🎉 Vous avez gagné ! Vous remportez ${bet * 2}${data.plugins.economy.currency}.`,
                            fields: [
                                { name: `${message.author.username} (**${game.player.score} points**)`, value: game.player.toString(), inline: true },
                                { name: `${client.user.username} (**${game.dealer.score} points**)`, value: game.dealer.toString(), inline: true }
                            ],
                            footer: {
                                text: client.config.embed.footer,
                                icon_url: client.user.displayAvatarURL()
                            },
                            timestamp: new Date()
                        }
                    });

                    user.money = user.money + bet * 2;
                    user.save();

                    collector.stop(true);
                } else if(result === "lost") {
                    await msg.edit({ 
                        embed: {
                            color: 'RED',
                            author: {
                                name: message.author.tag,
                                icon_url: message.author.displayAvatarURL({ dynamic: true })
                            },
                            description: `Vous avez perdu, **${client.user.username}** a gagné la partie. Vous perdez ${bet}${data.plugins.economy.currency}.`,
                            fields: [
                                { name: `${message.author.username} (**${game.player.score} points**)`, value: game.player.toString(), inline: true },
                                { name: `${client.user.username} (**${game.dealer.score} points**)`, value: game.dealer.toString(), inline: true }
                            ],
                            footer: {
                                text: client.config.embed.footer,
                                icon_url: client.user.displayAvatarURL()
                            },
                            timestamp: new Date()
                        }
                    });

                    user.money = user.money - bet;
                    user.save();

                    collector.stop(true);
                }
            });
        }
    });
}

module.exports.help = {
    name: "blackjack",
    aliases: ["blackjack", "bj"],
    category: "Economy",
    description: "Jouer au blackjack avec le bot",
    usage: "<argent parié>",
    cooldown: 10,
    memberPerms: [],
    botPerms: ["EMBED_LINKS"],
    args: true
}
