// --- 1. 총 20칸 설정 (사진과 똑같은 배치) ---
const totalTiles = 20;
let boardData = Array(totalTiles).fill("랜덤 마시기");

// 캡처 사진 기반 고정 칸 
boardData[0] = "GAME\nSTART!!";
boardData[5] = "무인도\n(휴식)";
boardData[10] = "눈치게임\n시작!";
boardData[15] = "맞은 편\n한잔 마시기";

// 🔥 황금열쇠 대신 들어갈 '지옥' 구역 3군데 배치
boardData[3] = "🔥 지옥 🔥";
boardData[8] = "🔥 지옥 🔥";
boardData[17] = "🔥 지옥 🔥";

let currentPos = 0;
let isInHell = false;
let isRolling = false;

const boardContainer = document.getElementById("boardContainer");
const centerArea = document.getElementById("centerArea");
const normalMode = document.getElementById("normalMode");
const hellMode = document.getElementById("hellMode");
const diceBtn = document.getElementById("diceBtn");
const hellDiceBtn = document.getElementById("hellDiceBtn");
const statusMsg = document.getElementById("statusMsg");
const hellResult = document.getElementById("hellResult");

// 인덱스 번호에 따라 그리드(Grid) 위치를 지정하는 함수 (ㅁ자 궤도)
function getGridPos(index) {
    if (index === 0) return { row: 6, col: 1 }; // 좌측 하단 시작
    if (index >= 1 && index <= 4) return { row: 6 - index, col: 1 }; // 왼쪽 위로
    if (index === 5) return { row: 1, col: 1 }; // 좌측 상단
    if (index >= 6 && index <= 9) return { row: 1, col: index - 4 }; // 위쪽 우측으로
    if (index === 10) return { row: 1, col: 6 }; // 우측 상단
    if (index >= 11 && index <= 14) return { row: index - 9, col: 6 }; // 오른쪽 아래로
    if (index === 15) return { row: 6, col: 6 }; // 우측 하단
    if (index >= 16 && index <= 19) return { row: 6, col: 21 - index }; // 아래쪽 좌측으로
}

// --- 2. 게임판 그리기 ---
function renderBoard() {
    // 기존 타일만 지우기 (가운데 영역 제외)
    document.querySelectorAll('.tile').forEach(e => e.remove());
    
    boardData.forEach((text, index) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.innerText = text;
        
        // CSS Grid 좌표 꽂아넣기
        const pos = getGridPos(index);
        tile.style.gridRow = pos.row;
        tile.style.gridColumn = pos.col;

        // 현재 위치에 말 생성
        if (index === currentPos) {
            tile.classList.add("active");
            const token = document.createElement("div");
            token.className = "player-token";
            tile.appendChild(token);
        }

        boardContainer.appendChild(tile);
    });
}

// --- 3. 다이내믹 주사위 애니메이션 ---
diceBtn.addEventListener("click", () => {
    if (isInHell || isRolling) return;
    isRolling = true;

    let rollCount = 0;
    // 0.05초마다 숫자가 바뀌는 애니메이션
    const rollInterval = setInterval(() => {
        const tempNum = Math.floor(Math.random() * 6) + 1;
        diceBtn.innerText = `🎲 ${tempNum}`;
        rollCount++;

        // 15번 굴러가면 멈춤 (약 0.75초)
        if (rollCount > 15) {
            clearInterval(rollInterval);
            const finalNum = tempNum; 
            diceBtn.innerText = `🎲 ${finalNum} 나왔다!`;
            
            // 말 이동
            currentPos = (currentPos + finalNum) % totalTiles;
            statusMsg.innerText = `[ ${boardData[currentPos]} ] 도착!`;
            
            renderBoard();
            checkHell(); // 지옥에 걸렸는지 확인
            
            isRolling = false;
            setTimeout(() => { diceBtn.innerText = "주사위 굴리기 🎲"; }, 1500);
        }
    }, 50);
});

// --- 4. 지옥 로직 ---
function checkHell() {
    if (boardData[currentPos] === "🔥 지옥 🔥") {
        isInHell = true;
        setTimeout(() => {
            normalMode.classList.add("hidden");
            hellMode.classList.remove("hidden");
            hellResult.innerText = "🎯";
        }, 800);
    }
}

hellDiceBtn.addEventListener("click", () => {
    if (isRolling) return;
    isRolling = true;
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const tempNum = Math.floor(Math.random() * 7) + 1;
        hellResult.innerText = tempNum;
        rollCount++;

        if (rollCount > 20) {
            clearInterval(rollInterval);
            const finalNum = Math.floor(Math.random() * 7) + 1;
            hellResult.innerText = `결과: ${finalNum}`;
            
            if (finalNum === 7) {
                alert("🎉 기적의 7! 지옥 탈출!");
                isInHell = false;
                currentPos = (currentPos + 1) % totalTiles; 
                hellMode.classList.add("hidden");
                normalMode.classList.remove("hidden");
                statusMsg.innerText = "휴, 다음 칸으로 이동 완료!";
                renderBoard();
            } else {
                alert(`🔥 탈출 실패 (숫자 ${finalNum}) - 한 잔 마셔라!`);
            }
            isRolling = false;
        }
    }, 50);
});

// 초기 세팅
renderBoard();
