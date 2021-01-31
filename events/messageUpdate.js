const Discord = require('discord.js');
const Guild = require('../models/Guild');

module.exports = async (client, oldMessage, newMessage) => {
    if(newMessage.channel.type === "dm" || newMessage.author.bot) return;
    if(oldMessage.content == newMessage.content) return;

    if(newMessage.content.includes(client.token)) {
        return newMessage.delete().then(() => client.users.cache.get(client.config.owner.id).send("Tu devrais regen ton token. C'est juste un conseil."));
    }

    const data = await client.getGuild(newMessage.guild);

    const p = data.members.map(m => m.id).indexOf(newMessage.member.id);
    const userData = data.members[p];

    if(newMessage.guild && p == -1) {
        Guild.updateOne({
            id: newMessage.guild.id
        },
        { 
            $push: {
                members: {
                    id: newMessage.member.id,
                    exp: 0,
                    level: 0
                }
            }
        }).then(() => {});
    }

    const prefixes = [`<@!${client.user.id}> `, `<@${client.user.id}> `, data.prefix]
    let prefix = null;
    prefixes.forEach(p => {
        if(newMessage.content.startsWith(p)) {
            prefix = p;
        }
    });

    if(data.plugins.protection.antilink) {
        if(/discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/i.test(newMessage.content)) {
            if(!newMessage.guild.member(newMessage.author).hasPermission("MANAGE_MESSAGES"));
            return newMessage.delete().then(() => {
                if(data.plugins.logs.enabled && data.plugins.logs.channel) {
                    let embed = {
                        color: 'RED',
                        author: {
                            name: newMessage.author.username,
                            icon_url: newMessage.author.displayAvatarURL({ dynamic: true })
                        },
                        description: `${newMessage.author} a envoyé une pub dans ${newMessage.channel}!`,
                        fields: [
                            {
                                name: "Message d'origine",
                                value: newMessage.content
                            }
                        ],
                        footer: {
                            text: client.config.embed.footer,
                            icon_url: client.user.displayAvatarURL()
                        }
                    }

                    if(embed.fields[0].value.length > 1000) {
                        embed.fields[0].value = newMessage.content.slice(0, 1000) + "...";
                    }

                    newMessage.guild.channels.cache.get(data.plugins.logs.channel).send({ embed: embed });
                }
            })
        }
    }

    if(!newMessage.content.startsWith(prefix) || newMessage.webhookID) return;

    const args = newMessage.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.help.aliases && cmd.help.aliases.includes(commandName));
    if(!command) return;

    if(!newMessage.guild.me.permissionsIn(newMessage.channel).has("SEND_MESSAGES") || !newMessage.guild.me.permissionsIn(newMessage.channel).has("READ_MESSAGE_HISTORY")) return newMessage.author.send(`⚠️ ${newMessage.author}, je n'ai pas les permissions de parler ou de voir l'historique de message dans le salon ${newMessage.channel} !`).catch(() => {});

    if(command.help.botPerms.length > 0) {
        if(!newMessage.guild.me.permissionsIn(newMessage.channel).has(command.help.botPerms)) {
            return newMessage.channel.send(`⚠️ ${newMessage.author}, je n\'ai pas les permissions nécessaires pour faire cette commande. \nJ\'ai besoin des permissions suivantes: ${client.formatPermissions(command.help.botPerms.map(perm => `\`${perm}\``).join(', '))}`)
        }
    }

    if(command.help.memberPerms.length > 0) {
        if(!newMessage.member.permissionsIn(newMessage.channel).has(command.help.memberPerms)) {
            return newMessage.channel.send(`⚠️ ${newMessage.author}, vous n\'avez les permissions nécessaires pour faire cette commande!`);
        }
    }

    if(command.help.args && !args.length) {
        return newMessage.channel.send({
            embed: {
                color: "#FF0000",
                author: {
                    name: newMessage.author.username,
                    icon_url: newMessage.author.displayAvatarURL({ dynamic: true })
                },
                description: `⚠️ Vous n'utilisez pas la commande correctement. \nFaites **${data.prefix}help ${commandName}** pour voir comment l'utiliser.`,
                footer: {
                    text: client.config.embed.footer,
                    icon_url: client.user.displayAvatarURL()
                }
            }
        })
    }

    if(!client.cooldowns.has(command.help.name)) {
        client.cooldowns.set(command.help.name, new Discord.Collection());
    }

    const tStamps = client.cooldowns.get(command.help.name);
    const cdAdmount = (command.help.cooldown || 0) * 1000;

    if(tStamps.has(newMessage.author.id)) {
        const cdExpirationTime = tStamps.get(newMessage.author.id) + cdAdmount;

        if(Date.now() < cdExpirationTime) {
            timeLeft = (cdExpirationTime - Date.now()) / 1000;
            return newMessage.channel.send(`⚠️ Attendez encore **${timeLeft.toFixed(0)}s** avant de réutiliser cette commande!`)
            .then(async msg => {
                await msg.delete({ timeout: 5000 });
            }).catch(() => {});
        }
    }

    tStamps.set(newMessage.author.id, Date.now());
    setTimeout(() => tStamps.delete(newMessage.author.id), cdAdmount);

    try {
        command.run(client, newMessage, args, data, userData);  
    } catch (error) {
        console.log(error.message);
        newMessage.channel.send(`Une erreur est survenue lors de l\'exécution de la commande. \n\`\`\`js\n${error.message}\n\`\`\``);
        client.channels.cache.get(client.config.support.logs).send(`Une erreur est survenue lors de la commande ${commandName}: \n\`\`\`js\n${error.message}\n\`\`\``);
    }
}
