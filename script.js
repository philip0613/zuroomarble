// --- 1. 데이터 설정 ---
const totalTiles = 20;
let mainBoardData = Array(totalTiles).fill("랜덤 마시기");

// 기본 고정 칸 설정 (5번 칸에 지옥 딱 하나!)
mainBoardData[0] = "GAME\nSTART!!";
mainBoardData[5] = "🔥 지옥 🔥"; 
mainBoardData[10] = "눈치게임\n시작!";
mainBoardData[15] = "맞은 편\n한잔 마시기";

// 지옥 보드 데이터 (8칸: 3x3 그리드의 테두리)
const hellBoardData = ["💀 입구", "🍻 1잔", "🍻 1잔", "🍻 1잔", "🍻 1잔", "🍻 1잔", "👼 탈출!", "🍻 1잔"];

// 플레이어 및 게임 상태 변수
let players = [];
let turnIndex = 0;
let isAnimating = false;
const colors = ['#ff6b6b', '#4facfe', '#f9ca24', '#2ecc71', '#9b59b6', '#fd79a8'];

// HTML 요소들 가져오기
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
    if (index === 6) return { r: 3, c: 1 }; 
    if (index === 7) return { r: 2, c: 1 };
}

// --- 4. 보드 그리기 ---
function renderAllBoards() {
    document.querySelectorAll('.tile').forEach(e => e.remove());
    mainBoardData.forEach((text, i) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.innerHTML = `<div class="tile-text">${text}</div>`;
        const pos = getMainGridPos(i);
        tile.style.gridRow = pos.r;
        tile.style.gridColumn = pos.c;

        players.filter(p => !p.isInHell && p.mainPos === i).forEach(p => {
            const token = document.createElement("div");
            token.className = "player-token";
            token.style.backgroundColor = p.color;
            token.innerText = p.name.charAt(0);
            tile.appendChild(token);
        });
        boardContainer.appendChild(tile);
    });

    hellMiniBoard.innerHTML = "";
    hellBoardData.forEach((text, i) => {
        const tile = document.createElement("div");
        tile.className = "hell-tile";
        tile.innerHTML = `<div class="tile-text">${text}</div>`;
        const pos = getHellGridPos(i);
        tile.style.gridRow = pos.r;
        tile.style.gridColumn = pos.c;

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
    if (players.length === 0) return;
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

diceBtn.addEventListener("click", () => {
    rollDice(diceBtn, 6, (num) => {
        const cp = players[turnIndex];
        cp.mainPos = (cp.mainPos + num) % totalTiles;
        renderAllBoards();

        setTimeout(() => {
            if (mainBoardData[cp.mainPos] === "🔥 지옥 🔥") {
                alert(`🚨 ${cp.name} 지옥으로 추락! (다음 턴부터 지옥 탈출)`);
                cp.isInHell = true;
                cp.hellPos = 0; 
                renderAllBoards();
            } else {
                alert(`${cp.name}: [ ${mainBoardData[cp.mainPos]} ]`);
            }
            nextTurn();
        }, 300);
    });
});

hellDiceBtn.addEventListener("click", () => {
    rollDice(hellDiceBtn, 6, (num) => {
        const cp = players[turnIndex];
        cp.hellPos = (cp.hellPos + num) % 8;
        renderAllBoards();

        setTimeout(() => {
            if (cp.hellPos === 6) { 
                alert(`🎉 기적! ${cp.name} 지옥 탈출 성공!`);
                cp.isInHell = false;
                cp.mainPos = (cp.mainPos + 1) % totalTiles; 
                renderAllBoards();
            } else {
                alert(`🔥 지옥 벌칙: ${cp.name} 1잔 마시기! (탈출 실패)`);
            }
            nextTurn();
        }, 300);
    });
});

// --- 6. 회원가입/로그인 및 DB 연동 (내 계정 전용) ---
let isEditMode = false;
let currentUser = null; 

const editModeBtn = document.getElementById("editModeBtn");
const authModal = document.getElementById("authModal");

const savedUser = localStorage.getItem("zuroo_user");
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
}

document.getElementById("openLoginBtn").addEventListener("click", () => authModal.classList.remove("hidden"));
document.getElementById("closeModalBtn").addEventListener("click", () => authModal.classList.add("hidden"));

function updateAuthUI() {
    if (currentUser) {
        document.getElementById("openLoginBtn").classList.add("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
        document.getElementById("userInfo").innerText = `👤 ${currentUser.email}님`;
        document.getElementById("userInfo").classList.remove("hidden");
    } else {
        document.getElementById("openLoginBtn").classList.remove("hidden");
        document.getElementById("logoutBtn").classList.add("hidden");
        document.getElementById("userInfo").classList.add("hidden");
    }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("zuroo_user");
    currentUser = null;
    updateAuthUI();
    alert("로그아웃 되었습니다.");
});

async function handleAuth(action) {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    
    if (!email || password.length < 6) return alert("이메일과 6자리 이상의 비밀번호를 입력하세요.");

    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        const userObj = data.user || data; 
        currentUser = { id: userObj.id, email: email };
        localStorage.setItem("zuroo_user", JSON.stringify(currentUser));
        
        authModal.classList.add("hidden");
        updateAuthUI();
        alert(action === 'signup' ? "회원가입 완료! 로그인되었습니다." : "로그인 성공!");

    } catch (err) {
        alert("에러: " + err.message);
    }
}

document.getElementById("loginSubmitBtn").addEventListener("click", () => handleAuth('login'));
document.getElementById("signupSubmitBtn").addEventListener("click", () => handleAuth('signup'));

editModeBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;
    editModeBtn.innerText = isEditMode ? "수정 완료 ✅" : "판 커스텀하기 ✏️";
    if (isEditMode) alert("하얀색 칸을 클릭해서 벌칙을 마음대로 수정하세요!");
});

document.getElementById("boardContainer").addEventListener("click", (e) => {
    if (!isEditMode) return;
    const tile = e.target.closest('.tile');
    if (!tile) return;

    const tilesArray = Array.from(document.getElementById("boardContainer").querySelectorAll('.tile'));
    const index = tilesArray.indexOf(tile);

    if ([0, 5, 10, 15].includes(index)) return alert("이 칸은 고정 칸이라 바꿀 수 없습니다 🙅‍♂️");

    const newText = prompt("새로운 벌칙을 입력하세요:", mainBoardData[index]);
    if (newText && newText.trim() !== "") {
        mainBoardData[index] = newText;
        renderAllBoards();
    }
});

document.getElementById("saveBtn").addEventListener("click", async () => {
    if (!currentUser) return alert("로그인을 먼저 해주세요!");

    const boardName = prompt("저장할 판의 이름을 지어주세요:");
    if (!boardName) return;

    try {
        const response = await fetch('/api/saveBoard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board_name: boardName, custom_tiles: mainBoardData, user_id: currentUser.id })
        });
        
        if (response.ok) alert("✅ 내 계정에 성공적으로 저장되었습니다!");
        else alert("❌ 저장 실패");
    } catch (error) { alert("서버 에러!"); }
});

document.getElementById("loadBtn").addEventListener("click", async () => {
    if (!currentUser) return alert("로그인을 먼저 해주세요!");

    try {
        const response = await fetch(`/api/loadBoards?user_id=${currentUser.id}`);
        const boards = await response.json();
        
        if (boards.length === 0) return alert("아직 저장한 판이 없습니다.");
        
        let msg = "👇 불러올 판 번호를 입력하세요:\n\n";
        boards.forEach((board, idx) => { msg += `${idx + 1}. ${board.board_name}\n`; });
        
        const choice = prompt(msg);
        const selectedIndex = parseInt(choice) - 1;
        
        if (boards[selectedIndex]) {
            mainBoardData = boards[selectedIndex].custom_tiles;
            renderAllBoards();
            alert(`🎉 '${boards[selectedIndex].board_name}' 판 로드 완료!`);
        }
    } catch (error) { alert("목록 불러오기 실패!"); }
});
