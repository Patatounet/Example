module.exports = class Game {
    constructor(challenger, opponent) {
        this.currentPlayer = 1;
        this.challenger = challenger
        this.opponent = opponent;
        this.players = [challenger, opponent];
    }

    changeCurrentPlayer() {
        if(this.currentPlayer === 1) {
            this.currentPlayer = 2;
        } else {
            this.currentPlayer = 1;
        }
    }

    static findGameByUsers(client, user1, user2) {
        return client.games.find(
            (game) =>
                (game.players[0].id === user1.id &&
                    game.players[1].id === user2.id) ||
                (game.players[0].id === user2.id &&
                    game.players[1].id === user1.id)
        );
    }

    delete(client) {
        client.games = client.games.filter((game) => game !== this);
        return this;
    }
}
