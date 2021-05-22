const Game = require('./Game');

const faces = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K"
];
const suites = ["❤️", "♠️", "♦️", "♣️"];

class Card {
    constructor(face, suite) {
        this.face = face;
        this.suite = suite;
        this.faces = faces;
        this.suites = suites;
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    add(card) {
        this.cards.push(card);
    }

    get score() {
        let score = 0;

        this.cards.forEach(card => {
            if (card.face == "J" || card.face == "Q" || card.face == "K") {
                score += 10;
            } else if (card.face == "A") {
                score += 1;
            } else {
                score += parseInt(card.face, 10);
            }
        });

        return score;
    }

    get bust() {
        return this.score > 21;
    }

    toString() {
        let string = "";

        this.cards.forEach(card => {
            string += `${card.face} ${card.suite}\n`;
        });
      
        return string;
    }
}

module.exports = class Blackjack extends Game {
    constructor(user, bet) {
        super();

        this.user = user;
        this.bet = bet;
        this.deck = new class Deck {
            constructor() {
                this.cards = [];

                suites.forEach((suite) => {
                    faces.forEach((face) => {
                        this.cards.push(new Card(face, suite));
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
        this.player = new Hand();
        this.dealer = new Hand();

        this.player.add(this.deck.draw());
        this.player.add(this.deck.draw());
        this.dealer.add(this.deck.draw());
        this.dealer.add(this.deck.draw());
    }

    play(hit, callback) {
        if(hit) {
            this.player.add(this.deck.draw());

            if(this.player.bust) {
                return callback("lost");
            } else {
                return callback("continues");
            }
        } else {
            if(this.dealer.score > this.player.score && !this.player.bust) {
                callback("lost");
            }

            while (!this.dealer.bust && (this.dealer.score <= this.player.score)) {
                this.dealer.add(this.deck.draw());

                if(this.dealer.bust) {
                    callback("won");
                }

                if(!this.dealer.bust && (this.dealer.score > this.player.score)) {
                    callback("lost");
                }
            }
        }
    }
}