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
            this.users.fetch(req.vote.user).then(async (user) => {
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
            }).catch(() => this.channels.cache.get(this.config.support.votes).send("Impossible de déterminer qui vient de voter pour moi"));
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
}
