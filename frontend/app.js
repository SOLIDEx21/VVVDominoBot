// Telegram Web App API-ni aktivləşdir
const tg = window.Telegram.WebApp;
tg.expand(); // Ekranı tam kapla

// İstifadəçi məlumatlarını təhlükəsiz şəkildə al
const user = tg.initDataUnsafe?.user || { id: Math.floor(Math.random()*1000), name: "Guest" };
const roomId = "room_1"; // Otaq məntiqini URL parametrləri ilə dəyişə bilərsiniz

const socket = io('https://sizin-server-url.com'); // Backend URL-i bura yazın

socket.emit('joinRoom', { roomId, user: { id: user.id, name: user.first_name } });

socket.on('gameState', (state) => {
    // Xalları yenilə
    document.getElementById('scores').innerText = `Team A: ${state.scores.TeamA} | Team B: ${state.scores.TeamB}`;
    
    // Növbə göstəricisi
    const currentPlayer = state.players[state.turnIndex];
    const isMyTurn = currentPlayer?.id === user.id;
    document.getElementById('turn-indicator').innerText = isMyTurn ? "Sənin Növbəndir!" : `Növbə: ${currentPlayer?.name || 'Gözlənilir...'}`;
    
    // Masa vizuallaşdırılması
    document.getElementById('board').innerText = state.board.length > 0 
        ? JSON.stringify(state.board) 
        : "Masa boşdur";

    // Kendi əlimizi çək
    const myHandDiv = document.getElementById('my-hand');
    myHandDiv.innerHTML = '';
    const myData = state.players.find(p => p.id === user.id);
    
    if (myData && myData.hand) {
        myData.hand.forEach((tile, index) => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile';
            tileEl.innerText = `${tile[0]}-${tile[1]}`;
            
            // Tıklanma zamanı daşı at
            tileEl.onclick = () => {
                if (isMyTurn) {
                    // Sadəlik üçün default olaraq 'right' göndərilir, əslində UI-dan istifadəçi seçməlidir
                    socket.emit('playTile', { roomId, userId: user.id, tileIndex: index, side: 'right' });
                }
            };
            myHandDiv.appendChild(tileEl);
        });
    }

    // Pass düyməsini idarə et
    document.getElementById('pass-btn').style.display = isMyTurn ? 'block' : 'none';
});

document.getElementById('pass-btn').onclick = () => {
    socket.emit('passTurn', { roomId, userId: user.id });
};

socket.on('errorMsg', (msg) => {
    tg.showAlert(msg); // Telegramın native alert pəncərəsini istifadə et
});