class Game {
    constructor(challenger, opponent) {
        this.currentPlayer = 1;
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        this.challenger = challenger;
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

    checkWin(board) {
        function check(a, b, c) {
            if(a == b && b == c) return a;
            return false;
        }
    
        function checkRowCol(board) {
            for (let i = 0; i < board.length; i++) {
                let result1 = check(board[i][0], board[i][1], board[i][2]);
                if(result1) return result1;
                let result2 = check(board[0][i], board[1][i], board[2][i]);
                if(result2) return result2;
            }
            return false;
        }

        function checkDiagonal(board) {
            let result1 = check(board[0][0], board[1][1], board[2][2]);
            if(result1) return result1;
            let result2 = check(board[2][0], board[1][1], board[0][2]);
            if(result2) return result2;
            return false;
        }

        function checkDraw(board) {
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if(board[i][j] === '') return false;
                }
            }
            return true;
        }

        let rowCol = checkRowCol(board);
        let diag = checkDiagonal(board);

        if(rowCol) return rowCol;
        if(diag) return diag;
        if(checkDraw(board)) return 'égalité';
        return false;
    }

    static getPlayerSymbol(player) {
        if(player === 1) {
            return '❌';
        } else if(player === 2) {
            return '⭕';
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

module.exports = Game;