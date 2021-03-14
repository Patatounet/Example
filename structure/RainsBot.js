const { GiveawaysManager } = require('discord-giveaways');
const { Client, Collection } = require('discord.js');
const { readdirSync, readdir } = require('fs');
const { loadImage, createCanvas } = require('canvas');
const Guild = require('../models/Guild');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();
const sbl = require('@shadowlist/sblapi');
const sblClient = new sbl.Client(process.env.SBLTOKEN);
const Topgg = require('@top-gg/sdk');
const AutoPoster = require('topgg-autoposter');
const express = require('express');
const app = express();
const webhook = new Topgg.Webhook(process.env.TOPGGAUTH);

module.exports = class RainsBot extends Client {
    constructor() {
        super({
            disableMentions: "everyone"
        });

        this.config = require('../config');
        this.mongoose = mongoose;
        this.games = [];
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.giveawaysManager = new GiveawaysManager(this, {
            storage: "../giveaways.json",
            updateCountdownEvery: 10000,
            default: {
                botsCanWin: false,
                embedColor: this.config.embed.color,
                embedColorEnd: "RED",
                reaction: "🎉"
            }
        });
    }

    init() {
        // load commands
        readdirSync("./commands/").forEach(dirs => {
        const commands = readdirSync(`./commands//${dirs}/`).filter(files => files.endsWith('.js'));
    
            for (const file of commands) {
                const fileName = require(`.././commands//${dirs}/${file}`);
                this.commands.set(fileName.help.name, fileName);
            }
        });

        console.log(`${this.commands.size} commandes chargées`);

        // load events
        readdir("./events/", (error, f) => {
            if(error) console.error(error);
            console.log(`${f.length} évènements en chargement`);
    
            f.forEach((file) => {
                const events = require(`.././events//${file}`);
                const evtName = file.split(".")[0];
    
                this.on(evtName, events.bind(null, this));
            });
        });

        // connect to mongodb
        this.mongoose.connect(process.env.DBCONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
            autoIndex: false
        }).then(() => console.log('MongoDB s\'est connecté'))

        this.mongoose.Promise = global.Promise;

        // login into Discord
        this.login(process.env.TOKEN);

        // DO NOT INIT THE FOLLOWING CODE !!

        // post stats to shadow-bot.fr
        sblClient.postServers(this.guilds.cache.size);

        // Autopost stats to Top.gg
        const ap = AutoPoster(process.env.TOPGGTOKEN, this);
        console.log('Posted stats to Top.gg!');

        // Send message and DM when a user votes for the bot
        app.post('/dblwebhook', webhook.middleware(), async (req, res) => {
            const user = this.users.cache.get(req.vote.user);
            if(!user) return this.channels.cache.get(this.config.support.votes).send("Impossible de déterminer qui vient de voter pour moi.");

            const dbUser = await this.findOrCreateUser(user);
            if(dbUser) {
                dbUser.bank = dbUser.bank + 10000;

                dbUser.markModified("bank");
                dbUser.save();
            }

            this.channels.cache.get(this.config.support.votes).send({
                embed: {
                    color: this.config.embed.color,
                    description: `**${user.tag}** vient juste de voter pour moi, merci beaucoup ! \nSi vous voulez voter pour moi, cliquez [ici](https://top.gg/bot/${this.user.id}) !`,
                    author: {
                        name: user.username,
                        icon_url: user.displayAvatarURL({ dynamic: true })
                    },
                    footer: {
                        text: this.config.embed.footer,
                        icon_url: this.user.displayAvatarURL()
                    }
                }
            });

            user.send('Merci d\'avoir voté pour moi ! 10 000$ ont été rajoutés à votre compte en banque.').catch(() => {});
        });

    	app.listen(80);

        // check for all unmutes
        setInterval(async () => {
            const allUnmutedUser = await User.find({ tempmutes: { $elemMatch: { endsAt: { $lt: Date.now() } } } });
            if(!allUnmutedUser || allUnmutedUser?.length === 0) return;

            allUnmutedUser.forEach(async (user) => {
                for (let i = 0; i < user.tempmutes.length; i++) {
                    const mute = user.tempmutes[i];

                    user.tempmutes = user.tempmutes.filter(m => m.guildID !== mute.guildID);
                    await user.save();

                    const guild = this.guilds.cache.get(mute.guildID);
                    if(!guild || !guild?.available) return;
                    if(!guild.me.hasPermission("MANAGE_ROLES")) return;

                    const data = await this.getGuild(guild);
                    const member = guild.members.cache.get(user.id);
                    if(!member || !data) return;

                    if(member.roles.cache.has(data.muterole)) {
                        member.roles.remove(data.muterole).then(() => {
                            member.send(`Vous avez été unmute du serveur ${guild.name}. Raison: **Automatic unmute**`).catch(() => {});
                        }).catch(() => {});
                    }

                    if(data.plugins.logs.enabled) {
                        const channel = guild.channels.resolve(data.plugins.logs.channel);
                        if(channel) {
                            channel.send({
                                embed: {
                                    color: 'ORANGE',
                                    description: `L'utilisateur **${this.users.cache.get(user.id).tag}** s'est fait unmute. \nRaison: **Automatic unmute**`,
                                    footer: {
                                        text: this.config.embed.footer,
                                        icon_url: this.user.displayAvatarURL()
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }, 10000);
    }

    async createGuild(guild) {
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, guild);
        const createGuild = await new Guild(merged);
        createGuild.save();
    }

    async getGuild(guild) {
        const data = await Guild.findOne({ id: guild.id })
        if(data) return data;
        return null;
    }

    async updateGuild(guild, data = {}) {
        let data_ = await this.getGuild(guild);
        if(typeof data_ !== "object") data_ = {};
        for (const key in data) {
            if(data_[key] !== data[key]) data_[key] = data[key];
        }
        return data_.updateOne(data);
    }

    getAllUsers() {
        let size = 0;

        this.guilds.cache.forEach(g => {
            if(g.memberCount) {
                size += g.memberCount;
            }
        });

        return this.formatNumber(size);
    }

    formatPermissions(content) {
        if(!content || (typeof (content) != 'string')) throw new Error("Please specify a message to format.");

        content = content.replace("CREATE_INSTANT_INVITE", "Créer une invitation")
            .replace("BAN_MEMBERS", "Bannir des membres")
            .replace("MANAGE_CHANNELS", "Gérer les salons")
            .replace("ADD_REACTIONS", "Ajouter des réactions")
            .replace("PRIORITY_SPEAKER", "Voix prioritaire")
            .replace("SEND_TTS_MESSAGES", "Envoyer des messages TTS")
            .replace("EMBED_LINKS", "Intégrer des liens")
            .replace("READ_MESSAGE_HISTORY", "Voir les anciens messages")
            .replace("USE_EXTERNAL_EMOJIS", "Utiliser des emojis externes")
            .replace("CONNECT", "Se connecter")
            .replace("MUTE_MEMBERS", "Couper le micro des membres")
            .replace("VIEW_CHANNEL", "Voir le salon")
            .replace("MOVE_MEMBERS", "Déplacer des membres")
            .replace("CHANGE_NICKNAME", "Changer le pseudo")
            .replace("MANAGE_ROLES", "Gérer les rôles")
            .replace("MANAGE_EMOJIS", "Gérer les emojis")
            .replace("KICK_MEMBERS", "Expulser des membres")
            .replace("ADMINISTRATOR", "Administrateur")
            .replace("MANAGE_GUILD", "Gérer le serveur")
            .replace("VIEW_AUDIT_LOG", "Voir les logs du serveur")
            .replace("STREAM", "Vidéo")
            .replace("SEND_MESSAGES", "Envoyer des messages")
            .replace("MANAGE_MESSAGES", "Gérer les messages")
            .replace("ATTACH_FILES", "Joindre des fichiers")
            .replace("MENTION_EVERYONE", "Mentionner @\u200beveryone, @\u200bhere et tous les rôles")
            .replace("VIEW_GUILD_INSIGHTS", "Voir les analyses de serveur")
            .replace("SPEAK", "Parler")
            .replace("DEAFEN_MEMBERS", "Mettre en sourdine des membres")
            .replace("USE_VAD", "Utiliser la Détection de voix")
            .replace("MANAGE_NICKNAMES", "Gérer les pseudos")
            .replace("MANAGE_WEBHOOKS", "Gérer les webhooks");

        return content;
    }

    formatNumber(number) {
        return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1 ');
    }

    async updateUserLevel(user, guild, options = {}) {
        await Guild.updateOne({
            id: guild.id, "members.id": user.id
        },
        {
            $set: options
        });
    }

    async findOrCreateUser(user) {
        if(user.bot) return;

        const data = await User.findOne({ id: user.id });
        if(data) return data;
        else {
            const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, user);
            const createUser = await new User(merged);
            createUser.save();
        }
    }

    async generateRankcard(member, userData, rankcard = {}) {
        const canvas = createCanvas(1000, 333);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#23272a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#000000";
        ctx.fillRect(180, 216, 770, 65);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeRect(180, 216, 770, 65);
        ctx.stroke();

        ctx.fillStyle = rankcard.progress_bar_color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(180, 216, ((100 / (getTotalExpToLevelUp(userData.level))) * getCurrentLevelExp(userData.level, userData.exp)) * 7.7, 65);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${getCurrentLevelExp(userData.level, userData.exp)} / ${getTotalExpToLevelUp(userData.level)} XP`, 600, 260);

        ctx.fillStyle = rankcard.text_color; 
        ctx.font = "50px Arial";
        ctx.textAlign = "left";
        ctx.fillText(member.user.tag, 380, 90);

        ctx.font = "45px Arial";
        ctx.fillText(`Level : ${userData.level}`, 310, 190);
        ctx.fillText(`Total exp : ${userData.exp}`, 580, 190);

        ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = rankcard.avatar_color;
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(await loadImage(member.user.displayAvatarURL({ format: "png" })), 40, 40, 250, 250);

        return canvas.toBuffer();

        function getTotalExpToLevelUp(level) {
            if(level === 0) return 100;
            const one = 5 * Math.pow(level, 2) + (50 * level) + 100;
            const two = 5 * Math.pow(level + 1, 2) + (50 * (level + 1)) + 100;
        
            return two - one;
        }
    
        function getCurrentLevelExp(level, exp) {
            if(level === 0) return exp;
            return getTotalExpToLevelUp(level) - (5 * Math.pow(level, 2) + (50 * level) + 100 - exp);
        }
    }
}
