// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.expand(); 
tg.ready();

// İstifadəçi məlumatlarını al
const user = tg.initDataUnsafe?.user || { id: Math.floor(Math.random()*1000), first_name: "Qonaq" };

// Menyu UI-ni istifadəçi ilə doldur
document.getElementById('user-name').innerText = user.first_name;
document.getElementById('user-avatar').innerText = user.first_name.charAt(0).toUpperCase();

let socket;
const roomId = "room_global"; // Sadəlik üçün hamı eyni otağa gedir

// OYUNA BAŞLA DÜYMƏSİ
document.getElementById('play-btn').onclick = () => {
    // 1. Ekranı dəyiş (Menyunu gizlət, Oyunu göstər)
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('turn-indicator').innerText = "Oyunçular axtarılır...";

    // 2. Serverə qoşul
    // DİQQƏT: Render backend linkini bura yazın
    socket = io('https://domino-backend-linkiniz.onrender.com'); 

    socket.emit('joinRoom', { roomId, user: { id: user.id, name: user.first_name } });

    // Oyun vəziyyətini dinlə
    socket.on('gameState', updateGameUI);
    
    socket.on('errorMsg', (msg) => {
        tg.showAlert(msg);
    });
};

// OYUN İNTERFEYSİNİ YENİLƏYƏN FUNKSİYA
function updateGameUI(state) {
    // Xalları yenilə
    document.getElementById('score-a').innerText = state.scores.TeamA;
    document.getElementById('score-b').innerText = state.scores.TeamB;
    
    // Növbə göstəricisi
    const currentPlayer = state.players[state.turnIndex];
    const isMyTurn = currentPlayer?.id === user.id;
    const turnBadge = document.getElementById('turn-indicator');
    
    if (isMyTurn) {
        turnBadge.innerText = "Sənin Növbəndir!";
        turnBadge.style.backgroundColor = "#4caf50"; // Yaşıl
    } else {
        turnBadge.innerText = `Növbə: ${currentPlayer?.name || 'Gözlənilir...'}`;
        turnBadge.style.backgroundColor = "var(--btn-color)";
    }
    
    // Masa vizuallaşdırılması (Müvəqqəti mətn şəklində)
    document.getElementById('board').innerHTML = state.board.length > 0 
        ? `<div style="padding:20px; background:white; color:black; border-radius:10px; font-weight:bold;">${JSON.stringify(state.board)}</div>` 
        : "<span style='color: var(--hint-color);'>Masa boşdur</span>";

    // Əlimizdəki daşların çəkilməsi
    const myHandDiv = document.getElementById('my-hand');
    myHandDiv.innerHTML = '';
    const myData = state.players.find(p => p.id === user.id);
    
    if (myData && myData.hand) {
        myData.hand.forEach((tile, index) => {
            // Hər daş üçün HTML yaradırıq
            const tileEl = document.createElement('div');
            tileEl.className = 'tile';
            tileEl.innerHTML = `
                <span>${tile[0]}</span>
                <div class="line"></div>
                <span>${tile[1]}</span>
            `;
            
            // Daşa tıklandıqda gediş et
            tileEl.onclick = () => {
                if (isMyTurn) {
                    socket.emit('playTile', { roomId, userId: user.id, tileIndex: index, side: 'right' });
                } else {
                    tg.HapticFeedback.notificationOccurred('error'); // Səhv klikləndikdə titrəmə
                }
            };
            myHandDiv.appendChild(tileEl);
        });
    }

    // Pass düyməsini idarə et
    document.getElementById('pass-btn').style.display = isMyTurn ? 'flex' : 'none';
}

// Pas düyməsi məntiqi
document.getElementById('pass-btn').onclick = () => {
    if(socket) socket.emit('passTurn', { roomId, userId: user.id });
};

// Main Button-u Telegram-ın nativ arayüzündən istifadə etmək üçün konfiqurasiya etmək olar (istəyə bağlı)
