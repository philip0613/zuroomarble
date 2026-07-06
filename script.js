// --- 1. 기본 판 설정 ---
// 총 16칸 기준 (원하는 만큼 늘려도 됨)
let boardData = Array(16).fill("랜덤 마시기"); // 기본값 세팅

// 고정 칸 설정
boardData[0] = "시작 (원샷)";
boardData[7] = "🔥 지옥 입구 🔥";

// 게임 상태 변수
let currentPos = 0;
let isInHell = false;

// HTML 요소 가져오기
const boardContainer = document.getElementById("boardContainer");
const diceBtn = document.getElementById("diceBtn");
const hellDiceBtn = document.getElementById("hellDiceBtn");
const statusMsg = document.getElementById("statusMsg");
const hellContainer = document.getElementById("hellContainer");

// --- 2. 게임판 그리기 함수 ---
function renderBoard() {
    boardContainer.innerHTML = ""; // 기존 판 지우기
    
    boardData.forEach((text, index) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.innerText = text;

        // 현재 내 위치에 말(Token) 표시하기
        if (index === currentPos && !isInHell) {
            tile.classList.add("active");
            const token = document.createElement("div");
            token.className = "player-token";
            tile.appendChild(token);
        }

        boardContainer.appendChild(tile);
    });
}

// --- 3. 일반 주사위 굴리기 로직 ---
diceBtn.addEventListener("click", () => {
    if (isInHell) return;

    // 1~6 랜덤 숫자 생성
    const diceNum = Math.floor(Math.random() * 6) + 1;
    
    // 말 이동 (보드 크기를 넘어가면 다시 처음으로 뺑뺑이 돌기 위해 % 사용)
    currentPos = (currentPos + diceNum) % boardData.length;
    
    statusMsg.innerText = `🎲 ${diceNum}칸 이동! [ ${boardData[currentPos]} ] 당첨!`;

    // 지옥 입구에 도착했을 때
    if (boardData[currentPos] === "🔥 지옥 입구 🔥") {
        isInHell = true;
        setTimeout(() => {
            alert("지옥에 빠졌습니다! 다음 턴부터 탈출 룰렛을 돌려야 합니다.");
            boardContainer.classList.add("hidden");
            diceBtn.classList.add("hidden");
            hellContainer.classList.remove("hidden");
            statusMsg.innerText = "🔥 지옥에 갇혔습니다 🔥";
        }, 500);
    }

    renderBoard();
});

// --- 4. 지옥 전용 탈출 룰렛 로직 (1/7 확률) ---
hellDiceBtn.addEventListener("click", () => {
    // 1~7 랜덤 숫자 생성
    const hellNum = Math.floor(Math.random() * 7) + 1;

    if (hellNum === 7) {
        // 숫자 7이 나오면 탈출 (1칸)
        alert("🎉 기적적으로 지옥에서 탈출했습니다! (다음 칸으로 이동)");
        isInHell = false;
        currentPos = (currentPos + 1) % boardData.length; // 지옥 다음 칸으로
        
        hellContainer.classList.add("hidden");
        boardContainer.classList.remove("hidden");
        diceBtn.classList.remove("hidden");
        statusMsg.innerText = "휴, 살았다! 다시 주사위를 굴려주세요.";
    } else {
        // 1~6이 나오면 벌칙 (6칸)
        statusMsg.innerText = `🔥 탈출 실패! (숫자: ${hellNum}) 한 잔 마시기! 🍻`;
    }

    renderBoard();
});

// 처음 화면 로딩될 때 판 그리기 실행
renderBoard();
