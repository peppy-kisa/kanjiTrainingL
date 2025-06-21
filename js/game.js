// ゲームロジック
class GameManager {
    constructor() {
        this.questions = [];
        this.currentQuestionSet = [];
        this.currentQuestionIndex = 0;
        this.currentSetScore = 0;
        this.isGameActive = false;
        this.selectedAnswer = null;
        this.answeredQuestions = [];
        
        this.loadQuestions();
    }
    
    // 問題データを読み込み
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
        } catch (error) {
            console.error('問題データの読み込みに失敗しました:', error);
            // フォールバック用の基本問題
            this.questions = [
                {
                    id: 1,
                    sentence: "今日は{学校}に行きます。",
                    targetKanji: "学校",
                    choices: ["がっこう", "がくこう", "まなびや", "けんがく"],
                    correct: 0,
                    level: 1
                }
            ];
        }
    }
    
    // ゲーム開始
    startGame() {
        this.isGameActive = true;
        this.currentQuestionIndex = 0;
        this.currentSetScore = 0;
        this.selectedAnswer = null;
        this.answeredQuestions = [];
        
        // 5問をランダムに選択
        this.currentQuestionSet = this.selectRandomQuestions(5);
        
        // 最初の問題を表示
        this.showQuestion();
        
        return this.currentQuestionSet;
    }
    
    // ランダムに問題を選択
    selectRandomQuestions(count) {
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // 現在の問題を取得
    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestionSet.length) {
            return null;
        }
        return this.currentQuestionSet[this.currentQuestionIndex];
    }
    
    // 問題文をフォーマット（漢字をハイライト、ふりがな付き）
    formatQuestionText(sentence, targetKanji) {
        // ふりがな付き漢字を処理
        let formattedText = sentence;
        
        // {漢字|ふりがな} 形式を処理
        formattedText = formattedText.replace(/\{([^|{}]+)\|([^}]+)\}/g, (match, kanji, furigana) => {
            if (kanji === targetKanji) {
                // 対象漢字の場合：ハイライト表示、ふりがなは非表示
                return `<span class="furigana-container target-kanji">
                    <span class="furigana">${furigana}</span>
                    <span class="highlight-kanji kanji-with-furigana">${kanji}</span>
                </span>`;
            } else {
                // その他の漢字：ふりがな表示
                return `<span class="furigana-container">
                    <span class="furigana">${furigana}</span>
                    <span class="kanji-with-furigana">${kanji}</span>
                </span>`;
            }
        });
        
        // {漢字} 形式（ふりがななし）を処理
        formattedText = formattedText.replace(/\{([^|{}]+)\}/g, (match, kanji) => {
            if (kanji === targetKanji) {
                // 対象漢字の場合：ハイライト表示
                return `<span class="highlight-kanji">${kanji}</span>`;
            } else {
                // その他の漢字：通常表示
                return kanji;
            }
        });
        
        return formattedText;
    }
    
    // 問題を表示
    showQuestion() {
        const question = this.getCurrentQuestion();
        if (!question) return null;
        
        const formattedText = this.formatQuestionText(question.sentence, question.targetKanji);
        
        return {
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.currentQuestionSet.length,
            formattedText: formattedText,
            choices: question.choices,
            currentScore: this.currentSetScore
        };
    }
    
    // 回答を処理
    processAnswer(choiceIndex) {
        if (!this.isGameActive) return null;
        
        const question = this.getCurrentQuestion();
        if (!question) return null;
        
        const isCorrect = choiceIndex === question.correct;
        this.selectedAnswer = choiceIndex;
        
        // 回答を記録
        this.answeredQuestions.push({
            question: question,
            selectedAnswer: choiceIndex,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        if (isCorrect) {
            this.currentSetScore++;
        }
        
        return {
            isCorrect: isCorrect,
            correctAnswer: question.correct,
            correctText: question.choices[question.correct],
            selectedAnswer: choiceIndex,
            currentScore: this.currentSetScore,
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.currentQuestionSet.length
        };
    }
    
    // 次の問題に進む
    nextQuestion() {
        this.currentQuestionIndex++;
        this.selectedAnswer = null;
        
        if (this.currentQuestionIndex >= this.currentQuestionSet.length) {
            // ゲーム終了
            return this.endGame();
        }
        
        return this.showQuestion();
    }
    
    // ゲーム終了
    endGame() {
        this.isGameActive = false;
        
        const oldScore = storageManager.getTotalScore();
        const newTotalScore = storageManager.addScore(this.currentSetScore);
        
        // ドラゴンの誕生チェック
        const newDragons = characterManager.checkForDragonBirth(oldScore, newTotalScore);
        
        // すべてのドラゴンを喜ばせる
        if (this.currentSetScore > 0) {
            characterManager.celebrateWithDragons();
        }
        
        // ゲーム結果を保存
        const gameResult = {
            totalQuestions: this.currentQuestionSet.length,
            correctAnswers: this.currentSetScore,
            questions: this.answeredQuestions,
            newTotalScore: newTotalScore,
            newDragons: newDragons
        };
        
        storageManager.addGameResult(gameResult);
        
        return gameResult;
    }
    
    // ゲームを中断
    pauseGame() {
        this.isGameActive = false;
    }
    
    // ゲームを再開
    resumeGame() {
        this.isGameActive = true;
    }
    
    // ゲームをリセット
    resetGame() {
        this.isGameActive = false;
        this.currentQuestionIndex = 0;
        this.currentSetScore = 0;
        this.selectedAnswer = null;
        this.answeredQuestions = [];
        this.currentQuestionSet = [];
    }
    
    // 現在のゲーム状態を取得
    getGameState() {
        return {
            isActive: this.isGameActive,
            currentQuestionIndex: this.currentQuestionIndex,
            currentSetScore: this.currentSetScore,
            totalQuestions: this.currentQuestionSet.length,
            selectedAnswer: this.selectedAnswer,
            progress: this.currentQuestionSet.length > 0 ? 
                (this.currentQuestionIndex / this.currentQuestionSet.length) * 100 : 0
        };
    }
    
    // 問題の難易度を取得
    getQuestionDifficulty(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        return question ? question.level : 1;
    }
    
    // 特定の難易度の問題を取得
    getQuestionsByLevel(level) {
        return this.questions.filter(q => q.level === level);
    }
    
    // 統計情報を取得
    getGameStats() {
        return storageManager.getStats();
    }
    
    // 回答履歴を取得
    getAnswerHistory() {
        return this.answeredQuestions;
    }
    
    // 最後の回答が正解かどうか
    isLastAnswerCorrect() {
        if (this.answeredQuestions.length === 0) return false;
        return this.answeredQuestions[this.answeredQuestions.length - 1].isCorrect;
    }
    
    // 連続正解数を取得
    getConsecutiveCorrect() {
        let consecutive = 0;
        for (let i = this.answeredQuestions.length - 1; i >= 0; i--) {
            if (this.answeredQuestions[i].isCorrect) {
                consecutive++;
            } else {
                break;
            }
        }
        return consecutive;
    }
    
    // 問題セットの進捗率を取得
    getProgressPercentage() {
        if (this.currentQuestionSet.length === 0) return 0;
        return Math.round((this.currentQuestionIndex / this.currentQuestionSet.length) * 100);
    }
}

// グローバルインスタンス
const gameManager = new GameManager();