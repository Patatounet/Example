const { MessageCollector } = require('discord.js');

module.exports.run = async (client, message, args, data) => {
    if(!data.plugins.welcome.enabled) return message.channel.send(`⚠️ Le plugin de bienvenue n'est pas activé. Faites \`${data.prefix}enable welcome\` pour l'activer!`);

    if(args[0] === "channel") {
        if(args[1] && (message.mentions.channels.first() || message.guild.channels.cache.get(args[1]))) {
            data.plugins.welcome = {
                enabled: true,
                message: data.plugins.welcome.message,
                channel: message.mentions.channels.first() || message.guild.channels.cache.get(args[1])
            }

            data.markModified("plugins.welcome");
            data.save();

            return message.channel.send('✅ Salon de bienvenue modifié.');
        } else {
            const filter = m => m.author.id === message.author.id;
    
            let MSG = await message.channel.send('Quel salon souhaitez-vous définir comme salon de bienvenue ?');

            const c = new MessageCollector(message.channel, filter, {
                time: 60000,
                max: 3
            });

            c.on("collect", async msg1 => {
                const channel = msg1.mentions.channels.first() || msg1.guild.channels.cache.get(msg1.content);
                if(!channel) return message.channel.send('⚠️ Ce salon n\'existe pas, vérifiez que j\'ai accès au salon.');

                if(channel.type != "text") return message.channel.send('⚠️ Merci de donner un salon de type textuel. Les salons d\'annonces ne sont pas acceptés.');

                if(channel.id == data.plugins.welcome.channel) return message.channel.send('⚠️ Ce salon est déjà défini comme salon de bienvenue!');

                if(!message.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) return message.channel.send('⚠️ Je n\'ai pas les permissions de parler dans ce salon, mettez moi la permission Envoyer des messages dans le salon.');

                c.stop(true);

                MSG.delete().catch(() => {});
                msg1.delete().catch(() => {});

                data.plugins.welcome = {
                    enabled: true,
                    message: data.plugins.welcome.message,
                    channel: channel.id
                }

                data.markModified("plugins.welcome");
                data.save();

                message.channel.send('✅ Salon de bienvenue modifié. Les messages de bienvenue s\'enverront désormais dans <#' + channel.id + '>. \nFaites `' + data.prefix + 'config` pour voir la configuration actuelle du bot sur le serveur!');
            });

            c.on("end", (collected, reason) => {
                if(collected.size >= 3) return message.channel.send('Vous avez fait trop d\'essais! Refaite la commande puis réessayez.');
                if(reason === "time") return message.channel.send('Temps écoulé');
            });
        }
    } else if(args[0] === "message") {
        if(args[1]) {
            const newMessage = args.slice(1).join(" ");
            if(newMessage.length < 5) return message.channel.send('⚠️ Le message de bienvenue doit faire plus de 5 caractères !');

            if(newMessage === data.plugins.welcome.message) return message.channel.send('⚠️ Ce message est le même que celui actuellement défini 🤔');

            data.plugins.welcome = {
                enabled: true,
                message: newMessage,
                channel: data.plugins.welcome.channel
            }

            data.markModified("plugins.welcome");
            data.save();

            return message.channel.send('✅ Message de bienveune modifié. \nFaites `' + data.prefix + 'config` pour voir la configuration actuelle du bot sur le serveur!');
        } else {
            const filter = m => m.author.id === message.author.id;
    
            let MSG = await message.channel.send('Quel message souhaitez-vous définir comme message de bienvenue ?');

            const c1 = new MessageCollector(message.channel, filter, {
                time: 60000,
                max: 3
            });

            c1.on("collect", async msg1 => {
                const newMessage = msg1.content;

                if(newMessage.length < 5) return message.channel.send('⚠️ Le message de bienvenue doit faire plus de 5 caractères et moins de 200!');

                if(newMessage === data.plugins.welcome.message) return message.channel.send('⚠️ Ce message est le même que celui actuellement défini 🤔');

                c1.stop(true);

                MSG.delete().catch(() => {});
                msg1.delete().catch(() => {});

                data.plugins.welcome = {
                    enabled: true,
                    message: newMessage,
                    channel: data.plugins.welcome.channel
                }

                data.markModified("plugins.welcome");
                data.save();

                message.channel.send('✅ Message de bienvenue modifié. \nFaites `' + data.prefix + 'config` pour voir la configuration actuelle du bot sur le serveur!');
            });

            c1.on("end", (collected, reason) => {
                if(collected.size >= 3) return message.channel.send('Vous avez fait trop d\'essais! Refaite la commande puis réessayez.');
                if(reason === "time") return message.channel.send('Temps écoulé');
            });
        }
    } else if(args[0] === "test") {
        if(!data.plugins.welcome.channel) return message.channel.send('Aucun salon de bienvenue n\'est défini. Faites `' + data.prefix + 'welcome channel` pour le configurer!');

        let welcomeMsg = data.plugins.welcome.message
            .replace('{user}', message.author)
            .replace('{guildName}', message.guild.name)
            .replace('{memberCount}', message.guild.memberCount)
            .replace('{username}', message.author.username)
            .replace('{usertag}', message.author.tag);

        message.guild.channels.cache.get(data.plugins.welcome.channel).send(welcomeMsg);
        return message.channel.send('Test effectué, allez voir ça dans <#' + data.plugins.welcome.channel + '> !');
    } else {
        message.channel.send(`⚠️ Vous n'utilisez pas la commande correctement.\nFaites \`${data.prefix}welcome <channel | message | test>\``);
    }
}

module.exports.help = {
    name: "welcome",
    aliases: ["welcome"],
    category: 'Config',
    description: "Modifier le message ou le salon de bienvenue",
    usage: "<message | channel | test>",
    cooldown: 5,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: ["EMBED_LINKS"],
    args: false
}
