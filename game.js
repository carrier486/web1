// 게임 상태 관리
class PetGame {
    constructor() {
        this.stats = {
            hunger: 100,
            clean: 100,
            happy: 100,
            energy: 100
        };
        this.petName = '멍멍이';
        this.gameStartTime = Date.now();
        this.lastUpdateTime = Date.now();

        this.loadGame();
        this.init();
        this.startGameLoop();
    }

    init() {
        // DOM 요소 가져오기
        this.hungerBar = document.getElementById('hungerBar');
        this.cleanBar = document.getElementById('cleanBar');
        this.happyBar = document.getElementById('happyBar');
        this.energyBar = document.getElementById('energyBar');

        this.hungerValue = document.getElementById('hungerValue');
        this.cleanValue = document.getElementById('cleanValue');
        this.happyValue = document.getElementById('happyValue');
        this.energyValue = document.getElementById('energyValue');

        this.petCharacter = document.getElementById('petCharacter');
        this.statusEmoji = document.getElementById('statusEmoji');
        this.actionMessage = document.getElementById('actionMessage');
        this.gameTimeDisplay = document.getElementById('gameTime');
        this.petNameDisplay = document.getElementById('petNameDisplay');

        // 버튼 이벤트 리스너
        document.getElementById('feedBtn').addEventListener('click', () => this.feed());
        document.getElementById('walkBtn').addEventListener('click', () => this.walk());
        document.getElementById('bathBtn').addEventListener('click', () => this.bath());
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('sleepBtn').addEventListener('click', () => this.sleep());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('changeName').addEventListener('click', () => this.changePetName());

        this.updateDisplay();
        this.petNameDisplay.textContent = this.petName;
    }

    // 게임 루프 - 시간에 따라 상태 감소
    startGameLoop() {
        setInterval(() => {
            const now = Date.now();
            const timeDiff = (now - this.lastUpdateTime) / 1000; // 초 단위
            this.lastUpdateTime = now;

            // 30초마다 1씩 감소
            const decreaseRate = timeDiff / 30;

            this.stats.hunger = Math.max(0, this.stats.hunger - decreaseRate);
            this.stats.clean = Math.max(0, this.stats.clean - decreaseRate * 0.5);
            this.stats.happy = Math.max(0, this.stats.happy - decreaseRate * 0.7);
            this.stats.energy = Math.max(0, this.stats.energy - decreaseRate * 0.6);

            this.updateDisplay();
            this.saveGame();
            this.updateGameTime();
        }, 1000);
    }

    // 먹이기
    feed() {
        if (this.stats.hunger >= 95) {
            this.showMessage('배가 안 고파요! 😊');
            return;
        }

        this.stats.hunger = Math.min(100, this.stats.hunger + 30);
        this.stats.happy = Math.min(100, this.stats.happy + 10);
        this.stats.energy = Math.min(100, this.stats.energy + 5);

        this.playAnimation('feeding');
        this.showMessage('맛있어요! 🍖');
        this.updateDisplay();
        this.saveGame();
    }

    // 산책하기
    walk() {
        if (this.stats.energy < 20) {
            this.showMessage('너무 피곤해요... 😴');
            return;
        }

        this.stats.happy = Math.min(100, this.stats.happy + 25);
        this.stats.energy = Math.max(0, this.stats.energy - 15);
        this.stats.hunger = Math.max(0, this.stats.hunger - 10);
        this.stats.clean = Math.max(0, this.stats.clean - 15);

        this.playAnimation('walking');
        this.showMessage('산책 재밌어요! 🚶');
        this.updateDisplay();
        this.saveGame();
    }

    // 씻기기
    bath() {
        if (this.stats.clean >= 95) {
            this.showMessage('깨끗해요! ✨');
            return;
        }

        this.stats.clean = 100;
        this.stats.happy = Math.min(100, this.stats.happy + 15);
        this.stats.energy = Math.max(0, this.stats.energy - 5);

        this.playAnimation('bathing');
        this.showMessage('상쾌해요! 🛁');
        this.updateDisplay();
        this.saveGame();
    }

    // 놀아주기
    play() {
        if (this.stats.energy < 25) {
            this.showMessage('너무 피곤해요... 😴');
            return;
        }

        this.stats.happy = Math.min(100, this.stats.happy + 30);
        this.stats.energy = Math.max(0, this.stats.energy - 20);
        this.stats.hunger = Math.max(0, this.stats.hunger - 15);

        this.playAnimation('playing');
        this.showMessage('신나요! 🎾');
        this.updateDisplay();
        this.saveGame();
    }

    // 재우기
    sleep() {
        if (this.stats.energy >= 90) {
            this.showMessage('아직 안 졸려요! 😊');
            return;
        }

        this.stats.energy = Math.min(100, this.stats.energy + 40);
        this.stats.happy = Math.min(100, this.stats.happy + 10);

        this.playAnimation('sleeping');
        this.showMessage('꿀잠 자요~ 😴');
        this.updateDisplay();
        this.saveGame();
    }

    // 애니메이션 재생
    playAnimation(animationType) {
        this.petCharacter.classList.remove('feeding', 'walking', 'bathing', 'playing', 'sleeping');

        setTimeout(() => {
            this.petCharacter.classList.add(animationType);
        }, 10);

        setTimeout(() => {
            this.petCharacter.classList.remove(animationType);
        }, 2000);
    }

    // 메시지 표시
    showMessage(message) {
        this.actionMessage.textContent = message;
        this.actionMessage.classList.remove('show');

        setTimeout(() => {
            this.actionMessage.classList.add('show');
        }, 10);

        setTimeout(() => {
            this.actionMessage.classList.remove('show');
        }, 2000);
    }

    // 화면 업데이트
    updateDisplay() {
        // 상태 바 업데이트
        this.updateStatBar(this.hungerBar, this.hungerValue, this.stats.hunger);
        this.updateStatBar(this.cleanBar, this.cleanValue, this.stats.clean);
        this.updateStatBar(this.happyBar, this.happyValue, this.stats.happy);
        this.updateStatBar(this.energyBar, this.energyValue, this.stats.energy);

        // 강아지 상태 이모지 업데이트
        this.updateStatusEmoji();
    }

    updateStatBar(barElement, valueElement, value) {
        const roundedValue = Math.round(value);
        barElement.style.width = roundedValue + '%';
        valueElement.textContent = roundedValue;

        // 색상 변경
        barElement.classList.remove('low', 'medium');
        if (roundedValue < 30) {
            barElement.classList.add('low');
        } else if (roundedValue < 60) {
            barElement.classList.add('medium');
        }
    }

    updateStatusEmoji() {
        const avgStat = (this.stats.hunger + this.stats.clean + this.stats.happy + this.stats.energy) / 4;

        if (avgStat >= 80) {
            this.statusEmoji.textContent = '😊';
        } else if (avgStat >= 60) {
            this.statusEmoji.textContent = '🙂';
        } else if (avgStat >= 40) {
            this.statusEmoji.textContent = '😐';
        } else if (avgStat >= 20) {
            this.statusEmoji.textContent = '😟';
        } else {
            this.statusEmoji.textContent = '😢';
        }
    }

    // 게임 시간 업데이트
    updateGameTime() {
        const elapsed = Date.now() - this.gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const displayMinutes = minutes % 60;
        const displayHours = hours % 24;

        this.gameTimeDisplay.textContent = `${days}일 ${displayHours}시간 ${displayMinutes}분`;
    }

    // 이름 변경
    changePetName() {
        const newName = prompt('강아지의 이름을 입력하세요:', this.petName);
        if (newName && newName.trim()) {
            this.petName = newName.trim();
            this.petNameDisplay.textContent = this.petName;
            this.saveGame();
            this.showMessage(`이제 ${this.petName}예요! 🎉`);
        }
    }

    // 게임 저장
    saveGame() {
        const gameData = {
            stats: this.stats,
            petName: this.petName,
            gameStartTime: this.gameStartTime,
            lastUpdateTime: this.lastUpdateTime
        };
        localStorage.setItem('petGameSave', JSON.stringify(gameData));
    }

    // 게임 불러오기
    loadGame() {
        const savedData = localStorage.getItem('petGameSave');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                this.stats = gameData.stats;
                this.petName = gameData.petName;
                this.gameStartTime = gameData.gameStartTime;
                this.lastUpdateTime = gameData.lastUpdateTime;

                // 부재중 시간 계산
                const now = Date.now();
                const timeDiff = (now - this.lastUpdateTime) / 1000; // 초 단위
                const decreaseRate = timeDiff / 30;

                // 부재중 상태 감소 (최대 5분까지만)
                const maxDecrease = 300 / 30; // 5분
                const actualDecrease = Math.min(decreaseRate, maxDecrease);

                this.stats.hunger = Math.max(0, this.stats.hunger - actualDecrease);
                this.stats.clean = Math.max(0, this.stats.clean - actualDecrease * 0.5);
                this.stats.happy = Math.max(0, this.stats.happy - actualDecrease * 0.7);
                this.stats.energy = Math.max(0, this.stats.energy - actualDecrease * 0.6);

                this.lastUpdateTime = now;
            } catch (e) {
                console.error('게임 불러오기 실패:', e);
            }
        }
    }

    // 게임 초기화
    resetGame() {
        if (confirm('정말 게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
            localStorage.removeItem('petGameSave');
            this.stats = {
                hunger: 100,
                clean: 100,
                happy: 100,
                energy: 100
            };
            this.petName = '멍멍이';
            this.gameStartTime = Date.now();
            this.lastUpdateTime = Date.now();
            this.petNameDisplay.textContent = this.petName;
            this.updateDisplay();
            this.showMessage('새로운 시작! 🎉');
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    const game = new PetGame();

    // 페이지 언로드 시 게임 저장
    window.addEventListener('beforeunload', () => {
        game.saveGame();
    });
});
