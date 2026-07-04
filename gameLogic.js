class DominoGame {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = []; // max 4 oyunçu: [{id, name, hand, team}]
        this.board = []; // Masadakı daşlar zənciri
        this.leftEnd = null; // Zəncirin sol ucu
        this.rightEnd = null; // Zəncirin sağ ucu
        this.turnIndex = 0; // Hansı oyunçunun növbəsidir
        this.scores = { TeamA: 0, TeamB: 0 };
        this.status = 'waiting'; // 'waiting', 'playing', 'finished'
    }

    addPlayer(player) {
        if (this.players.length >= 4) return false;
        // 1 və 3-cü oyunçular Team A, 2 və 4-cü oyunçular Team B
        const team = (this.players.length % 2 === 0) ? 'TeamA' : 'TeamB';
        this.players.push({ ...player, hand: [], team });
        if (this.players.length === 4) this.startRound();
        return true;
    }

    startRound() {
        this.status = 'playing';
        this.board = [];
        this.leftEnd = null;
        this.rightEnd = null;
        
        let tiles = this.generateTiles();
        this.shuffle(tiles);

        // Hər kəsə 7 daş ver
        this.players.forEach((p, index) => {
            p.hand = tiles.slice(index * 7, (index + 1) * 7);
        });

        // 6-6 daşı kimdədirsə oyunu o başlayır
        this.turnIndex = this.players.findIndex(p => 
            p.hand.some(tile => tile[0] === 6 && tile[1] === 6)
        );
        if(this.turnIndex === -1) this.turnIndex = 0; // Ehtiyat tədbiri
    }

    generateTiles() {
        let tiles = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                tiles.push([i, j]);
            }
        }
        return tiles;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Oyunçu gediş edir (side: 'left' və ya 'right')
    playTile(playerId, tileIndex, side) {
        const player = this.players[this.turnIndex];
        if (player.id !== playerId) return { error: "Sənin növbən deyil!" };

        const tile = player.hand[tileIndex];
        
        // İlk gediş yoxlanışı (masada heç nə yoxdursa)
        if (this.board.length === 0) {
            this.board.push(tile);
            this.leftEnd = tile[0];
            this.rightEnd = tile[1];
        } else {
            // Uyğunluq məntiqi (Qısaldılmış versiya)
            if (side === 'left' && (tile[0] === this.leftEnd || tile[1] === this.leftEnd)) {
                this.leftEnd = tile[0] === this.leftEnd ? tile[1] : tile[0];
                this.board.unshift(tile);
            } else if (side === 'right' && (tile[0] === this.rightEnd || tile[1] === this.rightEnd)) {
                this.rightEnd = tile[0] === this.rightEnd ? tile[1] : tile[0];
                this.board.push(tile);
            } else {
                return { error: "Yanlış gediş!" };
            }
        }

        // Daşı əldən sil
        player.hand.splice(tileIndex, 1);
        
        // Qalib yoxlanışı (Əli bitirsə)
        if (player.hand.length === 0) {
            this.endRound(player.team);
        } else {
            this.turnIndex = (this.turnIndex + 1) % 4; // Növbəni ötür
        }
        return { success: true };
    }

    passTurn(playerId) {
        if (this.players[this.turnIndex].id !== playerId) return { error: "Sənin növbən deyil!" };
        // Əlavə: Doğrudan da gediş edə bilməməsini yoxlamaq olar (Block check)
        this.turnIndex = (this.turnIndex + 1) % 4;
        return { success: true };
    }

    endRound(winningTeam) {
        this.status = 'waiting';
        const losingTeam = winningTeam === 'TeamA' ? 'TeamB' : 'TeamA';
        
        // Məğlub komandanın əlində qalan xalların hesablanması
        let penaltyPoints = 0;
        this.players.filter(p => p.team === losingTeam).forEach(p => {
            p.hand.forEach(tile => penaltyPoints += (tile[0] + tile[1]));
        });

        this.scores[winningTeam] += penaltyPoints;

        // 101 xal limitinin yoxlanışı
        if (this.scores['TeamA'] >= 101) {
            // Team B QALİBDİR (Çünki Team A 101-i keçdi)
            this.status = 'TeamB_WinsMatch';
        } else if (this.scores['TeamB'] >= 101) {
            this.status = 'TeamA_WinsMatch';
        }
    }
}

module.exports = DominoGame;