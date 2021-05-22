const Game = require('./Game');

module.exports = class UltimateMorpion extends Game {
    constructor(challenger, opponent) {
        super(challenger, opponent);

        this.lastMove = null;
        this.board = Array(9).fill().map(() => Array(9).fill(''));
    }

    checkSquare(square) {
        function check(a, b, c) {
            if(a == b && b == c) return a;
            return false;
        }
    
        function checkRowCol() {
            for (let i = 0; i < square.length; i += 3) {
                const horizontal = check(square[i], square[i + 1], square[i + 2]);
                if(horizontal) return horizontal;
            }

            for (let i = 0; i < 3; i++) {
                const vertical = check(square[i], square[i + 3], square[i + 6]);
                if(vertical) return vertical;
            }

            return false;
        }

        function checkDiagonal() {
            const result1 = check(square[0], square[4], square[8]);
            if(result1) return result1;
            const result2 = check(square[2], square[4], square[6]);
            if(result2) return result2;
            return false;
        }

        function checkDraw() {
            for (let i = 0; i < square.length; i++) {
                if(square[i] === '') return false;
            }

            return true;
        }

        const rowCol = checkRowCol();
        const diag = checkDiagonal();

        if(rowCol) return rowCol;
        if(diag) return diag;
        if(checkDraw()) return 'égalité';
        return false;
    }

    checkWin(board) {
        const results = [];

        for (let i = 0; i < board.length; i++) {
            results.push(this.checkSquare(board[i]))
        }

        function check(a, b, c) {
            if(a == b && b == c) return a;
            return false;
        }

        function checkHorizontal() {
            if(results.slice(0, 3).every((result) => result === results[0] && result !== 'égalité')) return results[0];
            if(results.slice(3, 6).every((result) => result === results[0] && result !== 'égalité')) return results[0];
            if(results.slice(6).every((result) => result === results[0] && result !== 'égalité')) return results[0];
            return false;
        }

        function checkVertical() {
            for (let i = 0; i < 3; i++) {
                const vertical = check(results[i], results[i + 3], results[i + 6]);
                if(vertical) return vertical;
            }

            return false;
        }

        function checkDiagonal() {
            const result1 = check(results[0], results[4], results[8]);
            if(result1) return result1;
            const result2 = check(results[2], results[4], results[6]);
            if(result2) return result2;
            return false;
        }

        const horizontal = checkHorizontal();
        const vertical = checkVertical();
        const diagonal = checkDiagonal();

        if(results.every((result) => result !== false) && !horizontal && !vertical && !diagonal) return 'égalité';
        if(horizontal) return horizontal;
        if(vertical) return vertical;
        if(diagonal) return diagonal;
        return false;
    }

    getPlayerSymbol(player) {
        if(player === 1) {
            return '❌';
        } else if(player === 2) {
            return '⭕';
        }
    }
}