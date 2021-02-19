const Game = require('./Game');
const { black_circle } = require('../emojis');

module.exports = class ConnectFour extends Game {
    constructor(challenger, opponent) {
        super(challenger, opponent);

        this.board = [
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle],
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle],
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle],
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle],
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle],
            [black_circle, black_circle, black_circle, black_circle, black_circle, black_circle, black_circle]
        ];
    }

    checkWin(currentPlayerColor) {
        const board = this.board;

        for (let row = 0; row < board.length; row++) {
            for (let column = 0; column < board[row].length; column++) {
                if(board[row][column] === currentPlayerColor) {
                    if(row >= 3) {
                        if(board[row - 1][column] === currentPlayerColor && board[row - 2][column] === currentPlayerColor && board[row - 3][column] === currentPlayerColor) return true;

                        if(column >= 3) {
                            if(board[row - 1][column - 1] === currentPlayerColor && board[row - 2][column - 2] === currentPlayerColor && board[row - 3][column - 3] == currentPlayerColor) return true;
                        }

                        if(column <= 3) {
                            if(board[row - 1][column + 1] === currentPlayerColor && board[row - 2][column + 2] === currentPlayerColor && board[row - 3][column + 3] == currentPlayerColor) return true;
                        }
                    }

                    if(column >=3) {
                        if(board[row][column - 1] === currentPlayerColor && board[row][column - 2] === currentPlayerColor && board[row][column - 3] === currentPlayerColor) return true;
                    }
                }
            }
        }
    }

    static getPlayerSymbol(player) {
        if(player === 1) {
            return '🔵';
        } else if(player === 2) {
            return '🔴';
        }
    }
}