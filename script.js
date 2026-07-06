// --- 1. 데이터 설정 ---
const totalTiles = 20;
let mainBoardData = Array(totalTiles).fill("랜덤 마시기");
mainBoardData[0] = "GAME\nSTART!!";
mainBoardData[5] = "무인도\n(휴식)";
mainBoardData[10] = "눈치게임\n시작!";
mainBoardData[15] = "맞은 편\n한잔 마시기";
mainBoardData[3] = "🔥 지옥 🔥";
mainBoardData[8] = "🔥 지옥 🔥";
mainBoardData[17] = "🔥 지옥 🔥";

// 지옥 보드 데이터 (8칸: 3x3 그리드의 테두리)
// 0: 입구, 1~5&7: 마시기, 6: 탈출
const hellBoardData = ["💀 입구", "🍻 1잔", "🍻 1잔", "🍻 1잔", "🍻 1잔", "🍻 1잔", "👼 탈출!", "🍻 1잔"];

let players = [];
let turnIndex = 0;
let isAnimating = false;
const colors = ['#ff6b6b', '#4facfe', '#f9ca24', '#2ecc71', '#9b59b6', '#fd79a8'];

// HTML 요소들
const setupArea = document.getElementById("setupArea");
const gameArea = document.getElementById("gameArea");
const playerNameInput = document.getElementById("playerName");
const playerListDiv = document.getElementById("playerList");
const startGameBtn = document.getElementById("startGameBtn");
const boardContainer = document.getElementById("boardContainer");
const hellMiniBoard = document.getElementById("hellMiniBoard");
const turnIndicator = document.getElementById("turnIndicator");
const diceBtn = document.getElementById("diceBtn");
const hellDiceBtn = document.getElementById("hellDiceBtn");

// --- 2. 플레이어 등록 로직 ---
document.getElementById("addPlayerBtn").addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (!name) return;
    if (players.length >= 6) return alert("최대 6명까지만 가능합니다!");

    const color = colors[players.length];
    players.push({ name, color, mainPos: 0, hellPos: 0, isInHell: false });
    
    const badge = document.createElement("div");
    badge.className = "player-badge";
    badge.style.backgroundColor = color;
    badge.innerText = name;
    playerListDiv.appendChild(badge);
    
    playerNameInput.value = "";
    if (players.length >= 2) startGameBtn.classList.remove("hidden");
});

startGameBtn.addEventListener("click", () => {
    setupArea.classList.add("hidden");
    gameArea.classList.remove("hidden");
    updateTurnUI();
    renderAllBoards();
});

// --- 3. 그리드 좌표 계산 함수 ---
function getMainGridPos(index) {
    if (index === 0) return { r: 6, c: 1 };
    if (index >= 1 && index <= 4) return { r: 6 - index, c: 1 };
    if (index === 5) return { r: 1, c: 1 };
    if (index >= 6 && index <= 9) return { r: 1, c: index - 4 };
    if (index === 10) return { r: 1, c: 6 };
    if (index >= 11 && index <= 14) return { r: index - 9, c: 6 };
    if (index === 15) return { r: 6, c: 6 };
    if (index >= 16 && index <= 19) return { r: 6, c: 21 - index };
}

function getHellGridPos(index) {
    if (index === 0) return { r: 1, c: 1 };
    if (index === 1) return { r: 1, c: 2 };
    if (index === 2) return { r: 1, c: 3 };
    if (index === 3) return { r: 2, c: 3 };
    if (index === 4) return { r: 3, c: 3 };
    if (index === 5) return { r: 3, c: 2 };
    if (index === 6) return { r: 3, c: 1 }; // 탈출구 (좌측 하단)
    if (index === 7) return { r: 2, c: 1 };
}

// --- 4. 보드 그리기 ---
function renderAllBoards() {
    // 1. 메인 보드 초기화 및 렌더링
    document.querySelectorAll('.tile').forEach(e => e.remove());
    mainBoardData.forEach((text, i) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.innerHTML = `<div class="tile-text">${text}</div>`;
        const pos = getMainGridPos(i);
        tile.style.gridRow = pos.r;
        tile.style.gridColumn = pos.c;

        // 이 칸에 있는 (지옥에 빠지지 않은) 플레이어 말 올리기
        players.filter(p => !p.isInHell && p.mainPos === i).forEach(p => {
            const token = document.createElement("div");
            token.className = "player-token";
            token.style.backgroundColor = p.color;
            token.innerText = p.name.charAt(0);
            tile.appendChild(token);
        });
        boardContainer.appendChild(tile);
    });

    // 2. 미니 지옥 보드 초기화 및 렌더링
    hellMiniBoard.innerHTML = "";
    hellBoardData.forEach((text, i) => {
        const tile = document.createElement("div");
        tile.className = "hell-tile";
        tile.innerHTML = `<div class="tile-text">${text}</div>`;
        const pos = getHellGridPos(i);
        tile.style.gridRow = pos.r;
        tile.style.gridColumn = pos.c;

        // 이 지옥 칸에 있는 플레이어 말 올리기
        players.filter(p => p.isInHell && p.hellPos === i).forEach(p => {
            const token = document.createElement("div");
            token.className = "player-token";
            token.style.backgroundColor = p.color;
            token.innerText = p.name.charAt(0);
            tile.appendChild(token);
        });
        hellMiniBoard.appendChild(tile);
    });
}

// --- 5. 턴 및 주사위 로직 ---
function updateTurnUI() {
    const cp = players[turnIndex];
    turnIndicator.innerText = `👉 [ ${cp.name} ] 의 차례!`;
    turnIndicator.style.color = cp.color;

    if (cp.isInHell) {
        diceBtn.classList.add("hidden");
        hellDiceBtn.classList.remove("hidden");
    } else {
        diceBtn.classList.remove("hidden");
        hellDiceBtn.classList.add("hidden");
    }
}

function nextTurn() {
    turnIndex = (turnIndex + 1) % players.length;
    updateTurnUI();
}

function rollDice(btnElement, maxNum, callback) {
    if (isAnimating) return;
    isAnimating = true;
    let rollCount = 0;
    const originalText = btnElement.innerText;

    const interval = setInterval(() => {
        btnElement.innerText = `🎲 ${Math.floor(Math.random() * maxNum) + 1}`;
        rollCount++;
        if (rollCount > 15) {
            clearInterval(interval);
            const finalNum = Math.floor(Math.random() * maxNum) + 1;
            btnElement.innerText = `🎲 ${finalNum} 나옴!`;
            
            setTimeout(() => {
                btnElement.innerText = originalText;
                isAnimating = false;
                callback(finalNum);
            }, 1000);
        }
    }, 50);
}

// 메인 주사위 굴리기
diceBtn.addEventListener("click", () => {
    rollDice(diceBtn, 6, (num) => {
        const cp = players[turnIndex];
        cp.mainPos = (cp.mainPos + num) % totalTiles;
        renderAllBoards();

        setTimeout(() => {
            if (mainBoardData[cp.mainPos] === "🔥 지옥 🔥") {
                alert(`🚨 ${cp.name} 지옥으로 추락!`);
                cp.isInHell = true;
                cp.hellPos = 0; // 지옥 입구로 이동
                renderAllBoards();
            } else {
                alert(`${cp.name}: [ ${mainBoardData[cp.mainPos]} ]`);
            }
            nextTurn();
        }, 300);
    });
});

// 지옥 주사위 굴리기
hellDiceBtn.addEventListener("click", () => {
    rollDice(hellDiceBtn, 6, (num) => {
        const cp = players[turnIndex];
        // 8칸짜리 미니 보드 뺑뺑이
        cp.hellPos = (cp.hellPos + num) % 8;
        renderAllBoards();

        setTimeout(() => {
            if (cp.hellPos === 6) { // 6번 인덱스가 '탈출' 칸
                alert(`🎉 기적! ${cp.name} 지옥 탈출 성공!`);
                cp.isInHell = false;
                cp.mainPos = (cp.mainPos + 1) % totalTiles; // 메인 보드 다음 칸으로 생존
                renderAllBoards();
            } else {
                alert(`🔥 지옥 벌칙: ${cp.name} 1잔 마시기! (탈출 실패)`);
            }
            nextTurn();
        }, 300);
    });
});
