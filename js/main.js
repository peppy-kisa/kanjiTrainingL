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
        
        // モーダル関連
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeDragonModal();
        });
        
        // モーダル外クリックで閉じる
        document.getElementById('dragon-modal').addEventListener('click', (e) => {
            if (e.target.id === 'dragon-modal') {
                this.closeDragonModal();
            }
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
        
        // 進捗に応じて表示を変更
        if (eggState.progress > 90 && eggState.nextDragon) {
            // 90%以上で次のドラゴンのプレビューを表示
            eggElement.innerHTML = `<img src="${eggState.nextDragon.image}" alt="${eggState.nextDragon.name}" class="dragon-image" style="opacity: 0.8; filter: brightness(1.2);">`;
        } else if (eggState.progress > 75) {
            // 75%以上でひび割れ演出
            eggElement.innerHTML = '🐣';
        } else if (eggState.progress > 50) {
            // 50%以上でたまごが動く
            eggElement.innerHTML = '🥚';
        } else {
            // 通常のたまご
            eggElement.innerHTML = '🥚';
        }
        
        // たまごの進捗に応じてアニメーション
        const egg = document.getElementById('dragon-egg');
        if (eggState.progress > 75) {
            egg.classList.add('animate-heartbeat');
        } else {
            egg.classList.remove('animate-heartbeat');
        }
        
        // プログレスバーを更新
        this.updateProgressBar(eggState.progress);
        
        // ドラゴンギャラリーを更新
        this.updateDragonGallery();
    }
    
    // プログレスバーを更新
    updateProgressBar(progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        // 進捗に応じてアニメーション
        if (progress >= 100) {
            progressFill.classList.add('rainbow-text');
        } else {
            progressFill.classList.remove('rainbow-text');
        }
    }
    
    // ドラゴンギャラリーを更新
    updateDragonGallery() {
        const dragons = characterManager.getDragonsForGallery();
        const galleryGrid = document.getElementById('dragons-grid');
        
        galleryGrid.innerHTML = '';
        
        dragons.forEach(dragon => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'dragon-thumbnail';
            
            // 画像がある場合は画像を表示、ない場合は絵文字を表示
            if (dragon.image) {
                thumbnail.innerHTML = `<img src="${dragon.image}" alt="${dragon.displayName}" class="dragon-image">`;
            } else {
                thumbnail.innerHTML = dragon.displayEmoji;
            }
            
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
        
        // モーダルに情報を設定
        const avatarElement = document.getElementById('modal-dragon-avatar');
        
        // 画像がある場合は画像を表示、ない場合は絵文字を表示
        if (dragon.image) {
            avatarElement.innerHTML = `<img src="${dragon.image}" alt="${dragon.name}" class="dragon-image-large">`;
        } else {
            avatarElement.textContent = dragon.emoji;
            avatarElement.style.color = dragon.color;
        }
        
        document.getElementById('modal-dragon-name').textContent = dragon.name;
        document.getElementById('modal-dragon-birth').textContent = dragon.unlockDate;
        document.getElementById('modal-dragon-happiness').textContent = dragon.happiness;
        document.getElementById('modal-dragon-days').textContent = dragon.daysOwned;
        document.getElementById('modal-dragon-message').textContent = dragon.personalMessage;
        
        // モーダルを表示
        document.getElementById('dragon-modal').style.display = 'block';
    }
    
    // ドラゴンモーダルを閉じる
    closeDragonModal() {
        document.getElementById('dragon-modal').style.display = 'none';
    }
    
    // ゲーム開始
    startGame() {
        // ゲーム開始前にメインページの状態を更新
        this.updateMainPage();
        
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
            // 結果画面を表示してから少し待ってからドラゴン誕生演出
            this.showResultPage();
            setTimeout(() => {
                this.showDragonBirthEffect(result.newDragons);
            }, 1000);
        } else {
            // ドラゴン誕生がない場合は通常の結果画面
            this.showResultPage();
        }
        
        // メインページの状態を更新（累計正解数など）
        this.updateMainPage();
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
        // まず大きなお祝いメッセージを表示
        const celebrationMessage = `🎊 あたらしい ともだちが うまれたよ！ 🎊`;
        this.showEffect(celebrationMessage, 'birth');
        this.createCelebrationParticles();
        
        newDragons.forEach((dragon, index) => {
            setTimeout(() => {
                // 特別な誕生エフェクト
                this.createDragonBirthAnimation(dragon);
                
                const message = `🌟 ${dragon.name}が なかまに なったよ！ 🌟`;
                this.showEffect(message, 'birth');
                this.createCelebrationParticles();
                
                // ドラゴン誕生音を再生（将来実装）
                if (window.playSound) {
                    window.playSound('dragon-birth');
                }
                
                // 誕生後にメインページを更新
                setTimeout(() => {
                    this.updateMainPage();
                }, 3000);
            }, index * 2000 + 2000); // 最初のメッセージの後、2秒間隔で表示
        });
    }
    
    // ドラゴン誕生アニメーション
    createDragonBirthAnimation(dragon) {
        // 背景をちょっと暗くする
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 2999;
            animation: fadeIn 0.5s ease;
        `;
        document.body.appendChild(backdrop);
        
        const birthContainer = document.createElement('div');
        birthContainer.className = 'dragon-birth-container';
        birthContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle, rgba(255,215,0,0.3), rgba(255,192,203,0.3));
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 0 50px rgba(255,215,0,0.8);
        `;
        
        // 画像がある場合は画像を表示、ない場合は絵文字を表示
        if (dragon.image) {
            birthContainer.innerHTML = `
                <img src="${dragon.image}" alt="${dragon.name}" class="dragon-birth-image">
                <div style="font-size: 2em; color: #FF6B6B; font-weight: bold; margin-top: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ${dragon.name}
                </div>
            `;
        } else {
            birthContainer.innerHTML = `
                <div style="font-size: 8em; animation: dragonBirth 3s ease-out forwards;">
                    ${dragon.emoji}
                </div>
                <div style="font-size: 2em; color: #FF6B6B; font-weight: bold; margin-top: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ${dragon.name}
                </div>
            `;
        }
        
        document.body.appendChild(birthContainer);
        
        // 5秒後に削除
        setTimeout(() => {
            if (birthContainer.parentNode) {
                birthContainer.parentNode.removeChild(birthContainer);
            }
            if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
        }, 5000);
    }
    
    // お祝いパーティクル
    createCelebrationParticles() {
        const particlesContainer = document.getElementById('particles');
        const emojis = ['🎊', '🎉', '✨', '🌟', '💖', '🎈', '🌈', '🎆', '🎇', '💫'];
        
        // より多くのパーティクルを生成
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${Math.random() * 3 + 1}em;
                animation: celebrationFloat ${Math.random() * 3 + 4}s ease-out forwards;
                animation-delay: ${Math.random() * 1}s;
                z-index: 2500;
                pointer-events: none;
            `;
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            particlesContainer.appendChild(particle);
            
            // アニメーション終了後に削除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 7000);
        }
        
        // 追加で花火のような演出
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createFireworkParticle();
            }, i * 200);
        }
    }
    
    // 花火パーティクル
    createFireworkParticle() {
        const particlesContainer = document.getElementById('particles');
        const centerX = Math.random() * 80 + 10; // 10-90%の範囲
        const centerY = Math.random() * 60 + 20; // 20-80%の範囲
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${centerX}%;
                top: ${centerY}%;
                width: 4px;
                height: 4px;
                background: hsl(${Math.random() * 360}, 100%, 50%);
                border-radius: 50%;
                animation: fireworkExplode 1.5s ease-out forwards;
                transform: rotate(${i * 45}deg);
                z-index: 2500;
                pointer-events: none;
            `;
            
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
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