// --- 1. 데이터 설정 ---
const totalTiles = 20;
let mainBoardData = Array(totalTiles).fill("랜덤 마시기");

// 기본 고정 칸 설정 (5번 칸에 지옥 딱 하나!)
mainBoardData[0] = "GAME\nSTART!!";
mainBoardData[5] = "🔥 지옥 🔥"; 
mainBoardData[10] = "눈치게임\n시작!";
mainBoardData[15] = "맞은 편\n한잔 마시기";

// 지옥 보드 데이터 (8칸: 3x3 그리드의 테두리)
// 0: 입구, 1~5&7: 마시기, 6: 탈출
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
// 메인 보드 (6x6 ㅁ자 궤도)
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

// 지옥 보드 (3x3 ㅁ자 궤도)
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

// 메인 주사위 굴리기 (6면체)
diceBtn.addEventListener("click", () => {
    rollDice(diceBtn, 6, (num) => {
        const cp = players[turnIndex];
        cp.mainPos = (cp.mainPos + num) % totalTiles;
        renderAllBoards();

        setTimeout(() => {
            if (mainBoardData[cp.mainPos] === "🔥 지옥 🔥") {
                alert(`🚨 ${cp.name} 지옥으로 추락! (다음 턴부터 지옥 탈출)`);
                cp.isInHell = true;
                cp.hellPos = 0; // 지옥 입구로 워프
                renderAllBoards();
            } else {
                alert(`${cp.name}: [ ${mainBoardData[cp.mainPos]} ]`);
            }
            nextTurn();
        }, 300);
    });
});

// 지옥 주사위 굴리기 (6면체)
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

// --- 6. 커스텀 판 수정 및 DB 저장/불러오기 기능 ---
let isEditMode = false;
const editModeBtn = document.getElementById("editModeBtn");

// 1) 수정 모드 켜기/끄기
editModeBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;
    editModeBtn.innerText = isEditMode ? "수정 완료 ✅" : "판 커스텀하기 ✏️";
    if (isEditMode) {
        alert("바꾸고 싶은 하얀색 칸을 클릭해서 벌칙을 마음대로 수정해 보세요! (시작, 지옥 등 고정 칸 제외)");
    }
});

// 2) 보드판 칸을 클릭했을 때 글자 바꾸기 (이벤트 위임 활용)
boardContainer.addEventListener("click", (e) => {
    if (!isEditMode) return;
    
    // 클릭한 곳이 타일(칸)인지 확인
    const tile = e.target.closest('.tile');
    if (!tile) return;

    // 타일이 전체 보드에서 몇 번째 칸인지 인덱스 찾기
    const tilesArray = Array.from(boardContainer.querySelectorAll('.tile'));
    const index = tilesArray.indexOf(tile);

    // 고정 칸(0: 시작, 5: 지옥, 10: 눈치게임, 15: 맞은편)은 수정 방지
    if ([0, 5, 10, 15].includes(index)) {
        alert("이 칸은 게임 진행을 위한 고정 칸이라 바꿀 수 없습니다 🙅‍♂️");
        return;
    }

    const currentText = mainBoardData[index];
    const newText = prompt("새로운 벌칙을 입력하세요:", currentText);
    
    if (newText && newText.trim() !== "") {
        mainBoardData[index] = newText;
        renderAllBoards(); // 화면 새로고침
    }
});

// 3) DB에 현재 판 저장하기
document.getElementById("saveBtn").addEventListener("click", async () => {
    const boardName = prompt("저장할 판의 이름을 지어주세요 (예: 스퀘 엠티용 매운맛)");
    if (!boardName) return;

    try {
        const response = await fetch('/api/saveBoard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board_name: boardName, custom_tiles: mainBoardData })
        });
        
        if (response.ok) alert("✅ 데이터베이스에 성공적으로 저장되었습니다!");
        else alert("❌ 저장에 실패했습니다.");
    } catch (error) {
        alert("서버 연결에 문제가 발생했습니다.");
    }
});

// 4) DB에서 판 목록 불러오기
document.getElementById("loadBtn").addEventListener("click", async () => {
    try {
        const response = await fetch('/api/loadBoards');
        const boards = await response.json();
        
        if (boards.length === 0) {
            return alert("아직 저장된 판이 없습니다. 첫 번째 판을 만들어 보세요!");
        }
        
        // 목록을 번호와 함께 보여주기
        let msg = "👇 불러올 판의 번호를 입력하세요:\n\n";
        boards.forEach((board, idx) => {
            msg += `${idx + 1}. ${board.board_name}\n`;
        });
        
        const choice = prompt(msg);
        const selectedIndex = parseInt(choice) - 1;
        
        // 유저가 올바른 번호를 입력했다면 해당 판 데이터로 교체
        if (boards[selectedIndex]) {
            mainBoardData = boards[selectedIndex].custom_tiles;
            renderAllBoards(); // 화면 새로고침
            alert(`🎉 '${boards[selectedIndex].board_name}' 판을 성공적으로 불러왔습니다!`);
        }
    } catch (error) {
        alert("목록을 불러오는 중 오류가 발생했습니다.");
    }
});
