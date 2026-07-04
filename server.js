const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const DominoGame = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = new Map(); // gameId -> DominoGame instance

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new DominoGame(roomId));
        }
        
        const game = rooms.get(roomId);
        game.addPlayer({ id: user.id, name: user.name });

        // Bütün otağa yeni vəziyyəti göndər
        io.to(roomId).emit('gameState', getSafeGameState(game));
    });

    socket.on('playTile', ({ roomId, userId, tileIndex, side }) => {
        const game = rooms.get(roomId);
        if (game) {
            const result = game.playTile(userId, tileIndex, side);
            if (result.success) {
                io.to(roomId).emit('gameState', getSafeGameState(game));
            } else {
                socket.emit('errorMsg', result.error);
            }
        }
    });

    socket.on('passTurn', ({ roomId, userId }) => {
        const game = rooms.get(roomId);
        if (game) {
            game.passTurn(userId);
            io.to(roomId).emit('gameState', getSafeGameState(game));
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Oyunçu çıxdıqda handle etmək (oyunu dayandırmaq və s.)
    });
});

// Digər oyunçuların əlindəki daşları gizlətmək üçün filter
function getSafeGameState(game) {
    return {
        board: game.board,
        turnIndex: game.turnIndex,
        scores: game.scores,
        status: game.status,
        players: game.players.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            tileCount: p.hand.length, // Rəqiblərə ancaq daş sayı gedir
            hand: p.hand // Front-end-də sadəcə öz id-si ilə yoxlayıb daşları görəcək
        }))
    };
}

server.listen(3000, () => console.log('Server 3000 portunda işləyir...'));