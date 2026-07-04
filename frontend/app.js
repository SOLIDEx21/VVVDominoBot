// OYUN İNTERFEYSİNİ YENİLƏYƏN FUNKSİYA
function updateGameUI(state) {
    // Xalları yenilə
    document.getElementById('score-a').innerText = state.scores.TeamA;
    document.getElementById('score-b').innerText = state.scores.TeamB;
    
    // --- LOBBY (GÖZLƏMƏ ZALI) MƏNTİQİ ---
    if (state.status === 'waiting') {
        const teamA = state.players.filter(p => p.team === 'TeamA');
        const teamB = state.players.filter(p => p.team === 'TeamB');

        const turnBadge = document.getElementById('turn-indicator');
        turnBadge.innerText = `Oyunçular: ${state.players.length}/4`;
        turnBadge.style.backgroundColor = "var(--btn-color)";

        // Masanın yerinə komandaların siyahısını göstər
        document.getElementById('board').innerHTML = `
            <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; gap: 15px; padding: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 140px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    <h3 style="color: #4caf50; font-size: 16px; margin-bottom: 12px;">🛡 Komanda A (${teamA.length}/2)</h3>
                    ${teamA.map(p => `<div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 5px; font-weight: bold; font-size: 14px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">👤 ${p.name}</div>`).join('')}
                    ${teamA.length === 0 ? `<div style="color: #707579; font-size: 12px; margin-top: 10px;">Boşdur...</div>` : ''}
                </div>
                
                <div style="flex: 1; min-width: 140px; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    <h3 style="color: #f44336; font-size: 16px; margin-bottom: 12px;">⚔️ Komanda B (${teamB.length}/2)</h3>
                    ${teamB.map(p => `<div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 5px; font-weight: bold; font-size: 14px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">👤 ${p.name}</div>`).join('')}
                    ${teamB.length === 0 ? `<div style="color: #707579; font-size: 12px; margin-top: 10px;">Boşdur...</div>` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('my-hand').innerHTML = ''; // Gözləyərkən əldə daş olmur
        document.getElementById('pass-btn').style.display = 'none';
        return; // Funksiyanı burda saxla, 4 nəfər olana qədər oyun lövhəsini çəkmə
    }


    // --- OYUN BAŞLAYANDA İŞLƏYƏCƏK MƏNTİQ (state.status === 'playing') ---
    
    const currentPlayer = state.players[state.turnIndex];
    const isMyTurn = currentPlayer?.id === user.id;
    const turnBadge = document.getElementById('turn-indicator');
    
    if (isMyTurn) {
        turnBadge.innerText = "Sənin Növbəndir!";
        turnBadge.style.backgroundColor = "#4caf50"; // Yaşıl rəng
    } else {
        turnBadge.innerText = `Növbə: ${currentPlayer?.name || 'Gözlənilir...'}`;
        turnBadge.style.backgroundColor = "var(--btn-color)";
    }
    
    // Masa vizuallaşdırılması
    document.getElementById('board').innerHTML = state.board.length > 0 
        ? `<div style="padding:15px; background:rgba(255,255,255,0.9); color:black; border-radius:12px; font-weight:bold; word-wrap: break-word;">${JSON.stringify(state.board)}</div>` 
        : "<span style='color: var(--hint-color); font-weight: 500;'>Oyun Başladı! İlk gedişi edin.</span>";

    // Əlimizdəki daşların çəkilməsi
    const myHandDiv = document.getElementById('my-hand');
    myHandDiv.innerHTML = '';
    const myData = state.players.find(p => p.id === user.id);
    
    if (myData && myData.hand) {
        myData.hand.forEach((tile, index) => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile';
            tileEl.innerHTML = `
                <span>${tile[0]}</span>
                <div class="line"></div>
                <span>${tile[1]}</span>
            `;
            
            tileEl.onclick = () => {
                if (isMyTurn) {
                    socket.emit('playTile', { roomId, userId: user.id, tileIndex: index, side: 'right' });
                } else {
                    tg.HapticFeedback.notificationOccurred('error');
                }
            };
            myHandDiv.appendChild(tileEl);
        });
    }

    document.getElementById('pass-btn').style.display = isMyTurn ? 'flex' : 'none';
}
