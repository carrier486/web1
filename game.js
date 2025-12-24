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

        // 재화 시스템
        this.cash = 20000; // 기본 캐시
        this.food = 0; // 먹이 개수

        // 똥 시스템
        this.poops = []; // 똥 배열
        this.lastPoopTime = Date.now();

        // 실제 강아지 이미지 목록 (Unsplash에서 무료 강아지 이미지)
        this.dogImages = [
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'
        ];

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
        this.dogImage = document.getElementById('dogImage');
        this.statusEmoji = document.getElementById('statusEmoji');
        this.actionMessage = document.getElementById('actionMessage');
        this.gameTimeDisplay = document.getElementById('gameTime');
        this.petNameDisplay = document.getElementById('petNameDisplay');

        // 재화 표시 요소
        this.cashDisplay = document.getElementById('cashDisplay');
        this.foodDisplay = document.getElementById('foodDisplay');

        // 똥 컨테이너
        this.poopContainer = document.getElementById('poopContainer');

        // 강아지 이미지 랜덤 설정 (저장된 이미지가 없으면)
        if (!this.selectedDogImage) {
            this.selectedDogImage = this.dogImages[Math.floor(Math.random() * this.dogImages.length)];
        }
        this.dogImage.src = this.selectedDogImage;

        // 강아지 클릭 이벤트
        this.dogImage.addEventListener('click', () => this.onDogClick());

        // 버튼 이벤트 리스너
        document.getElementById('feedBtn').addEventListener('click', () => this.feed());
        document.getElementById('walkBtn').addEventListener('click', () => this.walk());
        document.getElementById('bathBtn').addEventListener('click', () => this.bath());
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('sleepBtn').addEventListener('click', () => this.sleep());
        document.getElementById('buyFoodBtn').addEventListener('click', () => this.buyFood());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('changeName').addEventListener('click', () => this.changePetName());

        this.updateDisplay();
        this.petNameDisplay.textContent = this.petName;

        // 랜덤 애니메이션 시작
        this.startRandomAnimations();

        // 똥 시스템 시작
        this.startPoopSystem();
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
        // 먹이가 없는 경우
        if (this.food <= 0) {
            this.showToast('먹이가 부족해요! 상점에서 구매하세요 🛒', 'warning');
            return;
        }

        if (this.stats.hunger >= 95) {
            this.showMessage('배가 안 고파요! 😊');
            return;
        }

        // 먹이 1개 소모
        this.food--;

        this.stats.hunger = Math.min(100, this.stats.hunger + 30);
        this.stats.happy = Math.min(100, this.stats.happy + 10);
        this.stats.energy = Math.min(100, this.stats.energy + 5);

        this.playAnimation('feeding');
        this.showMessage('맛있어요! 🍖');
        this.updateDisplay();
        this.saveGame();
    }

    // 먹이 구매
    buyFood() {
        const foodPrice = 10000;
        const foodAmount = 15;

        // 캐시가 부족한 경우
        if (this.cash < foodPrice) {
            this.showToast('캐시가 부족합니다! 충전이 필요해요 💰', 'error');
            return;
        }

        // 구매 확인
        if (confirm(`먹이 ${foodAmount}개를 ${foodPrice.toLocaleString()} 캐시에 구매하시겠습니까?`)) {
            this.cash -= foodPrice;
            this.food += foodAmount;

            this.showToast(`먹이 ${foodAmount}개를 구매했어요! 🎉`, 'success');
            this.updateDisplay();
            this.saveGame();
        }
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

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // 애니메이션
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3초 후 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // 화면 업데이트
    updateDisplay() {
        // 상태 바 업데이트
        this.updateStatBar(this.hungerBar, this.hungerValue, this.stats.hunger);
        this.updateStatBar(this.cleanBar, this.cleanValue, this.stats.clean);
        this.updateStatBar(this.happyBar, this.happyValue, this.stats.happy);
        this.updateStatBar(this.energyBar, this.energyValue, this.stats.energy);

        // 재화 표시 업데이트
        this.cashDisplay.textContent = this.cash.toLocaleString();
        this.foodDisplay.textContent = this.food;

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
            lastUpdateTime: this.lastUpdateTime,
            selectedDogImage: this.selectedDogImage,
            cash: this.cash,
            food: this.food
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
                this.selectedDogImage = gameData.selectedDogImage;
                this.cash = gameData.cash !== undefined ? gameData.cash : 20000;
                this.food = gameData.food !== undefined ? gameData.food : 0;

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

    // 강아지 클릭 반응
    onDogClick() {
        const reactions = [
            { message: '멍멍! 🐶', emoji: '🥰' },
            { message: '좋아요! ❤️', emoji: '😍' },
            { message: '만져주세요! 👋', emoji: '😊' },
            { message: '놀아줘요! 🎾', emoji: '🤩' },
            { message: '행복해요! ✨', emoji: '😄' }
        ];

        const reaction = reactions[Math.floor(Math.random() * reactions.length)];

        // 클릭 애니메이션
        this.petCharacter.classList.add('clicked');
        this.dogImage.classList.add('happy-wiggle');

        setTimeout(() => {
            this.petCharacter.classList.remove('clicked');
            this.dogImage.classList.remove('happy-wiggle');
        }, 500);

        // 메시지와 이모지 표시
        this.showMessage(reaction.message);
        this.statusEmoji.textContent = reaction.emoji;

        setTimeout(() => {
            this.updateStatusEmoji();
        }, 2000);

        // 행복도 약간 증가
        this.stats.happy = Math.min(100, this.stats.happy + 2);
        this.updateDisplay();
        this.saveGame();
    }

    // 랜덤 애니메이션 시작
    startRandomAnimations() {
        setInterval(() => {
            // 랜덤하게 재롱부리기 (30% 확률)
            if (Math.random() < 0.3) {
                this.playIdleAnimation();
            }
        }, 5000); // 5초마다 체크
    }

    // 랜덤 재롱 애니메이션
    playIdleAnimation() {
        const animations = ['idle-wiggle', 'idle-bounce', 'idle-shake'];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];

        this.petCharacter.classList.add(randomAnim);

        setTimeout(() => {
            this.petCharacter.classList.remove(randomAnim);
        }, 1000);
    }

    // 똥 시스템 시작
    startPoopSystem() {
        setInterval(() => {
            // 청결도가 50 이하이고, 마지막 똥 이후 30초 경과 시 똥 싸기
            const now = Date.now();
            const timeSinceLastPoop = (now - this.lastPoopTime) / 1000;

            if (this.stats.clean < 50 && timeSinceLastPoop > 30 && this.poops.length < 3) {
                this.createPoop();
                this.lastPoopTime = now;
            }
        }, 10000); // 10초마다 체크
    }

    // 똥 생성
    createPoop() {
        const poop = document.createElement('div');
        poop.className = 'poop';
        poop.textContent = '💩';
        poop.style.left = `${Math.random() * 70 + 10}%`;
        poop.style.top = `${Math.random() * 60 + 20}%`;

        poop.addEventListener('click', () => this.cleanPoop(poop));

        this.poopContainer.appendChild(poop);
        this.poops.push(poop);

        // 청결도 감소
        this.stats.clean = Math.max(0, this.stats.clean - 10);
        this.updateDisplay();
        this.saveGame();

        this.showMessage('앗! 실수했어요... 😅');
    }

    // 똥 청소
    cleanPoop(poop) {
        poop.style.animation = 'poopDisappear 0.3s ease-out';

        setTimeout(() => {
            poop.remove();
            const index = this.poops.indexOf(poop);
            if (index > -1) {
                this.poops.splice(index, 1);
            }
        }, 300);

        // 청결도 회복
        this.stats.clean = Math.min(100, this.stats.clean + 5);
        this.updateDisplay();
        this.saveGame();

        this.showToast('깨끗하게 치웠어요! ✨', 'success');
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
            this.cash = 20000;
            this.food = 0;
            this.lastPoopTime = Date.now();

            // 모든 똥 제거
            this.poops.forEach(poop => poop.remove());
            this.poops = [];

            // 새로운 강아지 이미지 랜덤 선택
            this.selectedDogImage = this.dogImages[Math.floor(Math.random() * this.dogImages.length)];
            this.dogImage.src = this.selectedDogImage;

            this.petNameDisplay.textContent = this.petName;
            this.updateDisplay();
            this.showMessage('새로운 강아지와 함께! 🎉');
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
