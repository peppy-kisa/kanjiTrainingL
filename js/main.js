// メイン処理
class App {
    constructor() {
        this.currentPage = 'main';
        this.effectTimeout = null;
        
        this.init();
    }
    
    // 初期化
    init() {
        this.bindEvents();
        this.updateMainPage();
        this.createBackgroundEffects();
    }
    
    // イベントバインディング
    bindEvents() {
        // メインページ
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // ゲームページ
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showMainPage();
        });
        
        // 選択肢ボタン
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choiceIndex = parseInt(e.target.dataset.choice);
                this.selectAnswer(choiceIndex);
            });
        });
        
        // 結果ページ
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('home-btn').addEventListener('click', () => {
            this.showMainPage();
        });
        
        // たまごクリック
        document.getElementById('dragon-egg').addEventListener('click', () => {
            this.animateEgg();
        });
    }
    
    // メインページを更新
    updateMainPage() {
        const totalScore = storageManager.getTotalScore();
        const scoreToNext = characterManager.getScoreToNextDragon(totalScore);
        const eggState = characterManager.getEggState(totalScore);
        
        // スコア表示を更新
        document.getElementById('total-score').textContent = totalScore;
        document.getElementById('next-dragon').textContent = scoreToNext;
        
        // たまごの状態を更新
        const eggElement = document.querySelector('.egg-inner');
        eggElement.textContent = eggState.emoji;
        
        // たまごの進捗に応じてアニメーション
        const egg = document.getElementById('dragon-egg');
        if (eggState.progress > 75) {
            egg.classList.add('animate-heartbeat');
        } else {
            egg.classList.remove('animate-heartbeat');
        }
        
        // ドラゴンギャラリーを更新
        this.updateDragonGallery();
    }
    
    // ドラゴンギャラリーを更新
    updateDragonGallery() {
        const dragons = characterManager.getDragonsForGallery();
        const galleryGrid = document.getElementById('dragons-grid');
        
        galleryGrid.innerHTML = '';
        
        dragons.forEach(dragon => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'dragon-thumbnail';
            thumbnail.innerHTML = dragon.displayEmoji;
            thumbnail.style.background = `linear-gradient(45deg, ${dragon.color}55, ${dragon.color}88)`;
            thumbnail.title = dragon.displayName;
            
            thumbnail.addEventListener('click', () => {
                this.showDragonDetails(dragon.id);
            });
            
            galleryGrid.appendChild(thumbnail);
        });
        
        // ギャラリーの表示・非表示
        const gallery = document.querySelector('.dragons-gallery');
        if (dragons.length > 0) {
            gallery.style.display = 'block';
        } else {
            gallery.style.display = 'none';
        }
    }
    
    // ドラゴンの詳細を表示
    showDragonDetails(dragonId) {
        const dragon = characterManager.getDragonDetails(dragonId);
        if (!dragon) return;
        
        const message = `${dragon.displayName}\n\n誕生日: ${dragon.unlockDate}\n幸福度: ${dragon.happiness}%`;
        alert(message);
    }
    
    // ゲーム開始
    startGame() {
        const questionSet = gameManager.startGame();
        if (!questionSet || questionSet.length === 0) {
            alert('問題データの読み込み中です。少しお待ちください。');
            return;
        }
        
        this.showGamePage();
        this.updateGamePage();
    }
    
    // ゲームページを表示
    showGamePage() {
        this.switchPage('game');
    }
    
    // メインページを表示
    showMainPage() {
        gameManager.resetGame();
        this.switchPage('main');
        this.updateMainPage();
    }
    
    // 結果ページを表示
    showResultPage() {
        this.switchPage('result');
    }
    
    // ページ切り替え
    switchPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.classList.add('animate-fade-in');
        }
        
        this.currentPage = pageName;
    }
    
    // ゲームページを更新
    updateGamePage() {
        const questionData = gameManager.showQuestion();
        if (!questionData) {
            this.endGame();
            return;
        }
        
        // 進捗情報を更新
        document.getElementById('question-progress').textContent = 
            `${questionData.questionNumber}/${questionData.totalQuestions}`;
        document.getElementById('set-score').textContent = 
            `${questionData.currentScore}もんせいかい`;
        
        // 問題文を更新
        document.getElementById('question-text').innerHTML = questionData.formattedText;
        
        // 選択肢を更新
        document.querySelectorAll('.choice-btn').forEach((btn, index) => {
            btn.textContent = questionData.choices[index];
            btn.disabled = false;
            btn.className = 'choice-btn';
        });
    }
    
    // 回答選択
    selectAnswer(choiceIndex) {
        const result = gameManager.processAnswer(choiceIndex);
        if (!result) return;
        
        // ボタンの状態を更新
        document.querySelectorAll('.choice-btn').forEach((btn, index) => {
            btn.disabled = true;
            if (index === result.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === result.selectedAnswer && !result.isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // エフェクトを表示
        if (result.isCorrect) {
            this.showCorrectEffect();
        } else {
            this.showIncorrectEffect(result.correctText);
        }
        
        // 2秒後に次の問題または結果画面へ
        setTimeout(() => {
            this.processNextStep();
        }, 2000);
    }
    
    // 次のステップを処理
    processNextStep() {
        const nextQuestion = gameManager.nextQuestion();
        
        if (nextQuestion) {
            // 次の問題を表示
            this.updateGamePage();
        } else {
            // ゲーム終了
            this.endGame();
        }
    }
    
    // ゲーム終了
    endGame() {
        const result = gameManager.endGame();
        
        // 結果を表示
        document.getElementById('result-score-num').textContent = result.correctAnswers;
        document.getElementById('result-total-score').textContent = result.newTotalScore;
        
        // 新しいドラゴンが生まれた場合の特別演出
        if (result.newDragons && result.newDragons.length > 0) {
            this.showDragonBirthEffect(result.newDragons);
        }
        
        this.showResultPage();
    }
    
    // 正解エフェクト
    showCorrectEffect() {
        const message = characterManager.getCelebrationMessage();
        this.showEffect(message, 'correct');
        this.createParticles();
    }
    
    // 不正解エフェクト
    showIncorrectEffect(correctAnswer) {
        const encouragement = characterManager.getEncouragementMessage();
        const message = `${encouragement}\nせいかいは「${correctAnswer}」だよ`;
        this.showEffect(message, 'incorrect');
    }
    
    // エフェクト表示
    showEffect(message, type) {
        const overlay = document.getElementById('effect-overlay');
        const messageElement = document.getElementById('effect-message');
        
        messageElement.textContent = message;
        messageElement.className = `effect-message ${type}`;
        messageElement.classList.add('show-message');
        
        // 2秒後にエフェクトを隠す
        if (this.effectTimeout) {
            clearTimeout(this.effectTimeout);
        }
        
        this.effectTimeout = setTimeout(() => {
            messageElement.classList.remove('show-message');
        }, 2000);
    }
    
    // パーティクルエフェクト
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#98FB98'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            
            particlesContainer.appendChild(particle);
            
            // アニメーション終了後に削除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    }
    
    // ドラゴン誕生エフェクト
    showDragonBirthEffect(newDragons) {
        newDragons.forEach((dragon, index) => {
            setTimeout(() => {
                const message = `🎉 ${dragon.name}がうまれました！ 🎉`;
                this.showEffect(message, 'birth');
                this.createParticles();
            }, index * 1000);
        });
    }
    
    // たまごアニメーション
    animateEgg() {
        const egg = document.getElementById('dragon-egg');
        egg.style.transform = 'scale(1.1) rotate(5deg)';
        
        setTimeout(() => {
            egg.style.transform = 'scale(1) rotate(-5deg)';
        }, 100);
        
        setTimeout(() => {
            egg.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }
    
    // 背景エフェクト
    createBackgroundEffects() {
        // 雲のアニメーション
        setInterval(() => {
            this.createCloud();
        }, 8000);
        
        // 星のエフェクト
        setInterval(() => {
            this.createStar();
        }, 3000);
    }
    
    // 雲を作成
    createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = Math.random() * 30 + '%';
        cloud.style.width = Math.random() * 60 + 40 + 'px';
        cloud.style.height = Math.random() * 30 + 20 + 'px';
        cloud.style.left = '-100px';
        
        document.body.appendChild(cloud);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        }, 20000);
    }
    
    // 星を作成
    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = '⭐';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.fontSize = Math.random() * 20 + 10 + 'px';
        
        document.body.appendChild(star);
        
        // 3秒後に削除
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 3000);
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // エラーハンドリング
    window.addEventListener('error', (error) => {
        console.error('エラーが発生しました:', error);
    });
    
    // 未実装の音声機能のプレースホルダー
    window.playSound = (soundName) => {
        // 将来的に音声ファイルを再生する処理を追加
        console.log(`音声再生: ${soundName}`);
    };
});