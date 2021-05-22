/**
 * Some images were taken from https://github.com/Maxisthemoose/discord-uno
 */

const { createCanvas, loadImage } = require('canvas');
const cards = require('../../assets/uno/uno_cards.json');

class Card {
    constructor({ color, value, link, wild } = {}) {
        this.color = color;
        this.value = value;
        this.link = link;
        if(wild) this.wild = true
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    add(card) {
        this.cards.push(card);
    }

    draw(deck) {
        this.cards.splice(0, 0, deck.draw());
        this.sortCards();
    }

    sortCards() {
        const sortedCards = [[], [], [], [], []];
        for (const [i, card] of Object.keys(cards).entries()) {
            sortedCards[i].push(...this.cards.filter((c) => c.color === card));
            sortedCards[i].sort((a, b) => a.value - b.value);
        }

        const finalCards = [];
        sortedCards.forEach((cardArr) => finalCards.push(...cardArr));
        this.cards = finalCards;
    }

    async viewCards() {
        const canvas = createCanvas(250 + (160 * (this.cards.length - 1)), 480);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 75px calibri';

        for (let i = 0; i < this.cards.length; i++) {
            ctx.drawImage(await loadImage(this.cards[i].link), i * 160, 0, 250, 400);
            ctx.fillText(i + 1, i * 160 + 85.5, canvas.height - 5);
        }

        return canvas.toBuffer();
    }
}

module.exports = class Uno {
    constructor(client, channel, ...players) {
        this.players = players.map((player) => {
            return {
                id: player.id,
                hand: new Hand(),
                lastEmbed: null,
                tag: player.tag,
                avatarURL: player.displayAvatarURL({ dynamic: true, format: 'jpg' }),
                DMch: null
            };
        });

        this.currentPlayer = 0;
        this.tableMessage = null;
        this.channel = channel;
        this.client = client;
        this.deck = new class Deck {
            constructor() {
                this.cards = [];

                Object.keys(cards).forEach((cardType) => {
                    cards[cardType].forEach(({ color, value, link, wild }) => {
                        if(value !== 0 && !wild) {
                            this.cards.push(...Array(2).fill(new Card({ color, value, link, wild })));
                        } else if(wild) {
                            this.cards.push(...Array(4).fill(new Card({ color, value, link, wild })));
                        } else {
                            this.cards.push(new Card({ color, value, link, wild }));
                        }
                    });
                });
            }

            draw() {
                return this.cards.pop();
            }

            shuffle() {
                for (
                    let j, x, i = this.cards.length;
                    i;
                    j = Math.floor(Math.random() * i),
                        x = this.cards[--i],
                        this.cards[i] = this.cards[j],
                        this.cards[j] = x
                );

                return this;
            }
        }().shuffle();
        this.topCard = null;
        this.rotation = 1;
    }

    async start() {
        this.channel.startTyping();

        try {
            let disabledDMs = false;

            for (const player of this.players) {
                for (let i = this.deck.cards.length - 1; i > 0; i--) {
                    if(player.hand.cards.length < 8) {
                        player.hand.add(this.deck.cards[i]);
                        this.deck.draw();
                    } else {
                        player.hand.sortCards();
                    }
                }
    
                const member = await this.channel.guild.members.fetch(player.id);
                const DMch = await member.createDM().catch(() => {
                    this.channel.stopTyping(true);
                    disabledDMs = true;
                    this.channel.send(`<@${player.id}> n'a pas activé ses MP ! Veuillez les activer et relancez la partie.`);
                    return this.destroy();
                });

                if(disabledDMs) break;

                await DMch.send({
                    embed: {
                        color: this.client.config.embed.color,
                        author: { name: player.tag, icon_url: player.avatarURL },
                        description: `${this.nextPlayer.id === player.id ? '**C\'est à vous de jouer ! Envoyez le numéro de la carte à jouer.**' : `**C'est au tour de <@${this.nextPlayer.id}>, veuillez patienter le temps qu'il joue.**`}\n\nVoici vos cartes :`,
                        files: [{ attachment: await player.hand.viewCards(), name: 'cards.png' }],
                        image: { url: 'attachment://cards.png' },
                        footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                    }
                }).then((m) => player.lastEmbed = m).catch(() => {
                    this.channel.stopTyping(true);
                    disabledDMs = true;
                    this.channel.send(`<@${player.id}> n'a pas activé ses MP ! Veuillez les activer et relancez la partie.`);
                    return this.destroy();
                });

                if(disabledDMs) return this.destroy();

                player.DMch = DMch;
            }

            if(disabledDMs) return this.destroy();

            const firstPlayer = this.players[0];

            do {
                this.topCard = this.deck.cards[this.deck.cards.length - 1];
                if(typeof this.topCard.value !== 'number') {
                    this.deck.cards.splice(0, 0, this.deck.draw());
                }
            } while (typeof this.topCard.value !== 'number');

            let changed = false;
            while (!firstPlayer.hand.cards.find((c) => c.color === this.topCard.color || c.value  === this.topCard.value || c.color === 'wild')) {
                firstPlayer.hand.draw(this.deck);
                changed = true;
            }

            if(changed) {
                firstPlayer.DMch.send({
                    embed: {
                        color: this.client.config.embed.color,
                        author: { name: firstPlayer.tag, icon_url: firstPlayer.avatarURL },
                        description: '**C\'est à vous de jouer ! Envoyez le numéro de la carte à jouer.**\n\nVoici vos cartes :',
                        files: [{ attachment: await firstPlayer.hand.viewCards(), name: 'cards.png' }],
                        image: { url: 'attachment://cards.png' },
                        footer: { text: 'C\'est votre tour de jouer !', icon_url: firstPlayer.avatarURL }
                    }
                }).then((m) => {
                    firstPlayer.lastEmbed.delete().then(() => firstPlayer.lastEmbed = m).catch(() => {});
                });
            }

            this.channel.send({ files: [{ attachment: await this.viewTable(), name: 'table.png' }] })
                .then((m) => {
                    this.channel.stopTyping(true);
                    this.tableMessage = m;
                });

            this.play(firstPlayer);
        } catch (e) {
            console.error(e);

            this.channel.stopTyping(true);
            this.channel.send('Une erreur est survenue, veuillez réessayer.');
            this.destroy();
            this.client.channels.cache.get(this.client.config.support.logs).send(`Uno error: \n\`\`\`\n${e.stack || e}\n\`\`\``);
        }
    }

    play(player) {
        let drawn = 0;
        if(!player.hand.cards.find((c) => c.color === this.topCard.color || c.value  === this.topCard.value || c.value === 'Plus 4' || c.value === 'Changement de couleur')) {
            player.hand.draw(this.deck);
            drawn++;

            if(!player.hand.cards.find((c) => c.color === this.topCard.color || c.value  === this.topCard.value || c.value === 'Plus 4' || c.value === 'Changement de couleur')) {
                drawn++;
            }
        }

        if(drawn >= 1) {
            this.displayCards(player).then(() => {
                if(drawn === 1) {
                    player.DMch.send('ℹ️ Vous avez pioché une carte car vous n\'aviez aucun possibilité de jouer.');
                } else {
                    player.DMch.send('ℹ️ Vous avez pioché une carte car vous n\'aviez aucun possibilité de jouer. Vous ne pouvez toujours pas jouer, vous passez votre tour.').then(async () => {
                        this.changeCurrentPlayer();
                        this.nextPlayer.DMch.send('**C\'est à votre tour de jouer !** Envoyez le numéro de la carte à jouer.');
                        this.channel.startTyping();
                        return this.channel.send({ files: [{ attachment: await this.viewTable(), name: 'table.png' }] })
                            .then((m) => {
                                this.play(this.nextPlayer);
                                this.channel.stopTyping(true);
                                this.tableMessage.delete().then(() => this.tableMessage = m).catch(() => {});
                            });
                    });
                }
            });

            if(drawn > 1) return;
        }

        const collector = player.DMch.createMessageCollector((m) => m.author.id === player.id, { time: 180000 });
        collector.on('collect', async (tmsg) => {
            if(isNaN(parseInt(tmsg.content)) || !Number.isInteger(parseInt(tmsg.content))) return tmsg.channel.send('⚠️ Merci de spécifier le numéro indiqué en dessous de vos cartes pour jouer !')
                .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));

            if(parseInt(tmsg.content) < 1 || parseInt(tmsg.content) > player.hand.cards.length) return tmsg.channel.send('⚠️ Numéro invalide.')
                .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));

            if(!this.checkValid(player.hand.cards[parseInt(tmsg.content) - 1])) return tmsg.channel.send(`⚠️ Vous ne pouvez pas jouer cette carte ! Vous pouvez jouer : Une carte de couleur \`${this.topCard.color}\`${(this.topCard.value === 'Changement de couleur' || this.topCard.value === 'Plus 4') ? '' : ` ou une carte de valeur ${this.topCard.value}`}.`)
                .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));

            collector.stop(true);

            this.topCard = player.hand.cards[parseInt(tmsg.content) - 1];
            this.deck.cards.splice(0, 0, this.topCard);
            player.hand.cards.splice(parseInt(tmsg.content) - 1, 1);

            if(player.hand.cards.length <= 0) {
                this.tableMessage.delete().catch(() => {});
                this.players.forEach((p) => p.lastEmbed?.delete().catch(() => {}));
                const canvas = createCanvas(500, 550);
                const ctx = canvas.getContext('2d');

                ctx.lineWidth = 6;
                ctx.save();

                ctx.beginPath();
                ctx.arc(250, 300, 245, 0, Math.PI * 2, true);
                ctx.closePath();

                ctx.strokeStyle = this.client.config.embed.color;
                ctx.stroke();
                ctx.clip();
                ctx.drawImage(await loadImage(player.avatarURL), 0, 50, 495, 495);

                ctx.restore();

                ctx.rotate(32 * Math.PI / 180);
                ctx.drawImage(await loadImage('https://discordapp.com/assets/98fe9cdec2bf8ded782a7bf1e302b664.svg'), 300, -210, 130, 130);

                return this.channel.send({
                    embed: {
                        color: this.client.config.embed.color,
                        author: { name: `${player.tag} a remporté la partie !`, icon_url: player.avatarURL },
                        files: [{ attachment: canvas.toBuffer(), name: 'win.png' }],
                        image: { url: 'attachment://win.png' },
                        footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                    }
                }).then(() => {
                    return this.destroy();
                });
            }

            if(typeof this.topCard.value === 'string') {
                if(this.topCard.value.toLowerCase() === 'changement de couleur' || this.topCard.value.toLowerCase() === 'plus 4') {
                    const msg = await tmsg.channel.send('Quelle nouvelle couleur voulez-vous choisir ?');
                    const rArr = {
                        '🔵': 'blue',
                        '🟢': 'green',
                        '🔴': 'red',
                        '🟡': 'yellow'
                    };
                    Object.keys(rArr).forEach(async (r) => await msg.react(r));

                    const collected = await msg.awaitReactions((reaction, user) => Object.keys(rArr).includes(reaction.emoji.name) && user.id === player.id, { max: 1, time: 30000 });

                    const reaction = collected.first();
                    if(!reaction || !rArr[reaction.emoji?.name]) {
                        this.topCard.color = Object.values(rArr)[Math.floor(Math.random() * 4)];
                        tmsg.channel.send(`Temps écoulé, la couleur \`${this.translateColor(this.topCard)}\` a été choisie aléatoirement.`);
                    } else {
                        this.topCard.color = rArr[reaction.emoji.name];
                    }

                    if(this.topCard.value.toLowerCase() === 'plus 4') {
                        this.changeCurrentPlayer();
                        const user = this.nextPlayer;

                        for (let i = 0; i < 4; i++) {
                            user.hand.draw(this.deck);
                        }

                        if(this.players.length === 2) {
                            user.DMch.send({
                                embed: {
                                    color: this.client.config.embed.color,
                                    author: { name: user.tag, icon_url: user.avatarURL },
                                    description: `**C'est au tour de <@${player.id}>, veuillez patienter le temps qu'il joue.**\n\nVoici vos cartes :`,
                                    files: [{ attachment: await user.hand.viewCards(), name: 'cards.png' }],
                                    image: { url: 'attachment://cards.png' },
                                    footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                                }
                            }).then((m) => {
                                user.lastEmbed.delete().then(() => user.lastEmbed = m).catch(() => {});

                                user.DMch.send(`ℹ️ 4 cartes vous ont été rajoutées car ${player.tag} a joué un Plus 4 ! Il a choisi la couleur **${this.translateColor(this.topCard)}**`);
                            });
                        } else {
                            await user.DMch.send({
                                embed: {
                                    color: this.client.config.embed.color,
                                    author: { name: user.tag, icon_url: user.avatarURL },
                                    description: `**C'est au tour de <@${(this.rotation === 1 ? this.players[this.currentPlayer + 1] || this.players[0] : this.players[this.currentPlayer - 1] || this.players[this.players.length - 1]).id}>, veuillez patienter le temps qu'il joue.**\n\nVoici vos cartes :`,
                                    files: [{ attachment: await user.hand.viewCards(), name: 'cards.png' }],
                                    image: { url: 'attachment://cards.png' },
                                    footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                                }
                            }).then((m) => {
                                user.lastEmbed.delete().then(() => user.lastEmbed = m).catch(() => {});

                                user.DMch.send(`ℹ️ 4 cartes vous ont été rajoutées car ${player.tag} a joué un Plus 4 !`);
                            });
                        }
                    }
                } else if(this.topCard.value.toLowerCase() === 'changement de sens') {
                    if(this.players.length === 2) this.changeCurrentPlayer();
                    this.rotation === 1 ? this.rotation = 0 : this.rotation = 1;
                } else if(this.topCard.value.toLowerCase() === 'skip') {
                    this.changeCurrentPlayer();
                    this.nextPlayer.DMch.send(`**${player.tag}** a joué une carte Passe ton tour ! Vous ne pouvez pas jouer ce tour-ci.`);
                } else if(this.topCard.value.toLowerCase() === 'plus 2') {
                    this.changeCurrentPlayer();

                    const user = this.nextPlayer;
                    user.hand.draw(this.deck);
                    user.hand.draw(this.deck);

                    if(this.players.length === 2) {
                        user.DMch.send({
                            embed: {
                                color: this.client.config.embed.color,
                                author: { name: user.tag, icon_url: user.avatarURL },
                                description: `**C'est au tour de <@${player.id}>, veuillez patienter le temps qu'il joue.**\n\nVoici vos cartes :`,
                                files: [{ attachment: await user.hand.viewCards(), name: 'cards.png' }],
                                image: { url: 'attachment://cards.png' },
                                footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                            }
                        }).then((m) => {
                            user.lastEmbed.delete().then(() => user.lastEmbed = m).catch(() => {});

                            user.DMch.send(`ℹ️ 2 cartes vous ont été rajoutées car ${player.tag} a joué un Plus 2 !`);
                        });
                    } else {
                        user.DMch.send({
                            embed: {
                                color: this.client.config.embed.color,
                                author: { name: user.tag, icon_url: user.avatarURL },
                                description: `**C'est au tour de <@${(this.rotation === 1 ? this.players[this.currentPlayer + 1] || this.players[0] : this.players[this.currentPlayer - 1] || this.players[this.players.length - 1]).id}>, veuillez patienter le temps qu'il joue.**\n\nVoici vos cartes :`,
                                files: [{ attachment: await user.hand.viewCards(), name: 'cards.png' }],
                                image: { url: 'attachment://cards.png' },
                                footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                            }
                        }).then((m) => {
                            user.lastEmbed.delete().then(() => user.lastEmbed = m).catch(() => {});

                            user.DMch.send(`ℹ️ 2 cartes vous ont été rajoutées car ${player.tag} a joué un Plus 2 !`);
                        });
                    }
                }
            }

            this.changeCurrentPlayer();

            const embed = {
                color: this.client.config.embed.color,
                author: { name: player.tag, icon_url: player.avatarURL },
                description: `**C'est au tour de <@${this.nextPlayer.id}>, veuillez patienter le temps qu'il joue.**\n\nVoici vos cartes :`,
                files: [{ attachment: await player.hand.viewCards(), name: 'cards.png' }],
                image: { url: 'attachment://cards.png' },
                footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
            };

            await player.DMch.send({ embed }).then((m) => {
                player.lastEmbed.delete().then(() => player.lastEmbed = m).catch(() => {});
            });

            this.players.filter((p) => p.id !== player.id && p.id !== this.nextPlayer.id).forEach(async (p) => {
                embed.author = { name: p.tag, icon_url: p.avatarURL };
                await p.lastEmbed.edit({ embed });
            });

            let text = '**C\'est à votre tour de jouer !** Envoyez le numéro de la carte à jouer.';
            if(typeof this.topCard.value === 'string' && this.topCard.value.toLowerCase() === 'changement de couleur') text += `\nℹ️ **${player.tag}** a joué une carte Changement de couleur, il a choisi la couleur **${this.translateColor(this.topCard)}**.`
            if(typeof this.topCard.value === 'string' && this.topCard.value?.toLowerCase() === 'plus 4') text += `\nℹ️ **${player.tag}** a joué une carte Plus 4, il a choisi la couleur **${this.translateColor(this.topCard)}**`

            if(text.length > 80) {
                this.nextPlayer.DMch.send({
                    embed: {
                        color: this.client.config.embed.color,
                        author: { name: this.nextPlayer.tag, icon_url: this.nextPlayer.avatarURL },
                        description: '**C\'est à votre tour de jouer !** Envoyez le numéro de la carte à jouer.',
                        files: [{ attachment: await this.nextPlayer.hand.viewCards(), name: 'cards.png' }],
                        image: { url: 'attachment://cards.png' },
                        footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
                    }
                }).then((m) => {
                    this.nextPlayer.DMch.send(text);
                    this.nextPlayer.lastEmbed.delete().then(() => this.nextPlayer.lastEmbed = m).catch(() => {});
                });
            } else {
                embed.description = '**C\'est à votre tour de jouer !** Envoyez le numéro de la carte à jouer.';
                embed.author = { name: this.nextPlayer.tag, icon_url: this.nextPlayer.avatarURL }

                this.nextPlayer.lastEmbed.edit({ embed })
                    .then((m) => {
                        this.nextPlayer.DMch.send(text);
                        this.nextPlayer.lastEmbed = m
                    }).catch(() => {});
            }

            this.play(this.nextPlayer);

            this.channel.startTyping();
            return this.channel.send({ files: [{ attachment: await this.viewTable(), name: 'table.png' }] })
                .then((m) => {
                    this.channel.stopTyping(true);
                    this.tableMessage.delete().then(() => this.tableMessage = m).catch(() => {});
                });
        });

        collector.on('end', (_, reason) => {
            if(reason === 'time') {
                this.destroy();
                return this.channel.send(`**❌ <@${player.id}> a pris trop de temps à jouer ! Partie annulée.**`);
            }
        });
    }

    checkValid(card) {
        if(card.color === this.topCard.color || card.value === this.topCard.value || card.value === 'Plus 4' || card.value === 'Changement de couleur') {
            return true;
        } else {
            return false;
        }
    }

    async displayCards(player) {
        return await player.DMch.send({
            embed: {
                color: this.client.config.embed.color,
                author: { name: player.tag, icon_url: player.avatarURL },
                description: player.id === this.nextPlayer.id ? '**C\'est à vous de jouer ! Envoyez le numéro de la carte à jouer.**' : `**C'est au tour de <@${this.nextPlayer.id}>, veuillez patienter le temps qu'il joue.**` + '\n\nVoici vos cartes:',
                files: [{ attachment: await player.hand.viewCards(), name: 'cards.png' }],
                image: { url: 'attachment://cards.png' },
                footer: { text: this.client.config.embed.footer, icon_url: this.client.user.displayAvatarURL() }
            }
        });
    }

    changeCurrentPlayer() {
        if(this.rotation === 1) {
            if(this.currentPlayer + 1 >= this.players.length) {
                this.currentPlayer = 0;
            } else {
                this.currentPlayer++;
            }
        } else {
            if(this.currentPlayer - 1 < 0) {
                this.currentPlayer = this.players.length - 1;
            } else {
                this.currentPlayer--;
            }
        }
    }

    get nextPlayer() {
        return this.players[this.currentPlayer];
    }

    translateColor(card) {
        const values = {
            blue: 'bleue',
            green: 'verte',
            red: 'rouge',
            yellow: 'jaune'
        };

        return values[card.color] || card.color;
    }

    async viewTable() {
        // Inspired from https://github.com/Maxisthemoose/discord-uno

        const canvas = createCanvas(2000, 1000);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(await loadImage('./assets/uno/UNO_Table.png'), 0, 0, canvas.width, canvas.height);

        const topCard = await loadImage(this.topCard.link);
        ctx.drawImage(topCard, canvas.width / 2, canvas.height / 2 - 90, 120, 175);

        ctx.font = 'bold 40px calibri';
        ctx.lineWidth = 8;

        let x = 480;
        let y = canvas.height / 2 - 300;
        for (const [i, player] of this.players.entries()) {
            ctx.strokeStyle = this.client.config.embed.color;
            ctx.fillStyle = this.client.config.embed.color;

            ctx.save();

            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2, true);
            ctx.closePath();

            if(player.id === this.nextPlayer.id) {
                ctx.fillStyle = '#DC4523';
                ctx.strokeStyle = '#DC4523';
            }

            ctx.fill();
            ctx.stroke();
            ctx.clip();

            const avatar = await loadImage(player.avatarURL);
            ctx.drawImage(avatar, x - avatar.width / 2 + 4, y - avatar.height / 2 + 4, 120, 120);

            ctx.restore();

            ctx.fillStyle = '#ffffff'
            ctx.drawImage(await loadImage('https://cdn.discordapp.com/emojis/840511496605007872.png?v=1'), x - 105, y + 15, 36.8, 53.34);

            ctx.textAlign = 'right';
            ctx.fillText(player.hand.cards.length.toString(), x - 120, y + 60);

            switch (i) {
                case 0:
                    x += 350;
                    y -= 30;
                    break;
                case 1:
                    x += 370;
                    break;
                case 2:
                    x += 350;
                    y += 30;
                    break;
                case 3:
                    x += 200;
                    y += 300;
                    break;
                case 4:
                    x -= 200;
                    y += 300;
                    break;
                case 5:
                    x -= 350;
                    y += 30;
                    break;
                case 6:
                    x -= 370;
                    break;
                case 7:
                    x -= 350;
                    y -= 30;
                    break;
                case 8:
                    x -= 170;
                    y -= 300;
                    break;
            }
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px calibri';

        ctx.fillText(this.nextPlayer.tag, 470, canvas.height - 50);
        ctx.drawImage(await loadImage(this.rotation === 1 ? './assets/uno/clock-wise.png' : './assets/uno/counter_clock-wise.png'), canvas.width - 200, canvas.height - 120, 100, 87.36);

        return canvas.toBuffer();
    }

    delete() {
        this.client.games = this.client.games.filter((game) => game !== this);
        return this;
    }

    destroy() {
        this.players.forEach((player) => {
            player.lastEmbed?.delete().catch(() => {});
        });
        this.tableMessage?.delete().catch(() => {});
        return this.delete();
    }
}