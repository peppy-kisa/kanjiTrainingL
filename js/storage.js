// データ保存管理
class StorageManager {
    constructor() {
        this.keys = {
            TOTAL_SCORE: 'kanjiDragon_totalScore',
            DRAGONS: 'kanjiDragon_dragons',
            SETTINGS: 'kanjiDragon_settings',
            GAME_HISTORY: 'kanjiDragon_gameHistory'
        };
        
        this.initializeData();
    }
    
    // 初期データの設定
    initializeData() {
        if (!this.getTotalScore()) {
            this.setTotalScore(0);
        }
        
        if (!this.getDragons()) {
            this.setDragons([]);
        }
        
        if (!this.getSettings()) {
            this.setSettings({
                soundEnabled: true,
                difficulty: 'normal'
            });
        }
        
        if (!this.getGameHistory()) {
            this.setGameHistory([]);
        }
    }
    
    // 累計正解数の取得・設定
    getTotalScore() {
        return parseInt(localStorage.getItem(this.keys.TOTAL_SCORE)) || 0;
    }
    
    setTotalScore(score) {
        localStorage.setItem(this.keys.TOTAL_SCORE, score.toString());
    }
    
    addScore(points) {
        const currentScore = this.getTotalScore();
        const newScore = currentScore + points;
        this.setTotalScore(newScore);
        return newScore;
    }
    
    // ドラゴンデータの取得・設定
    getDragons() {
        const data = localStorage.getItem(this.keys.DRAGONS);
        return data ? JSON.parse(data) : [];
    }
    
    setDragons(dragons) {
        localStorage.setItem(this.keys.DRAGONS, JSON.stringify(dragons));
    }
    
    addDragon(dragon) {
        const dragons = this.getDragons();
        dragons.push(dragon);
        this.setDragons(dragons);
        return dragons;
    }
    
    // 設定データの取得・設定
    getSettings() {
        const data = localStorage.getItem(this.keys.SETTINGS);
        return data ? JSON.parse(data) : null;
    }
    
    setSettings(settings) {
        localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
    }
    
    // ゲーム履歴の取得・設定
    getGameHistory() {
        const data = localStorage.getItem(this.keys.GAME_HISTORY);
        return data ? JSON.parse(data) : [];
    }
    
    setGameHistory(history) {
        localStorage.setItem(this.keys.GAME_HISTORY, JSON.stringify(history));
    }
    
    addGameResult(result) {
        const history = this.getGameHistory();
        history.push({
            ...result,
            timestamp: new Date().toISOString()
        });
        
        // 履歴は最大100件まで保持
        if (history.length > 100) {
            history.shift();
        }
        
        this.setGameHistory(history);
        return history;
    }
    
    // 統計情報の取得
    getStats() {
        const history = this.getGameHistory();
        const totalGames = history.length;
        
        if (totalGames === 0) {
            return {
                totalGames: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                accuracy: 0
            };
        }
        
        const totalQuestions = history.reduce((sum, game) => sum + game.totalQuestions, 0);
        const correctAnswers = history.reduce((sum, game) => sum + game.correctAnswers, 0);
        const bestScore = Math.max(...history.map(game => game.correctAnswers));
        const averageScore = correctAnswers / totalGames;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        return {
            totalGames,
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore,
            totalQuestions,
            correctAnswers,
            accuracy: Math.round(accuracy * 100) / 100
        };
    }
    
    // データの完全リセット
    resetAllData() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeData();
    }
    
    // データのエクスポート
    exportData() {
        const data = {};
        Object.entries(this.keys).forEach(([name, key]) => {
            data[name] = localStorage.getItem(key);
        });
        return JSON.stringify(data);
    }
    
    // データのインポート
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            Object.entries(this.keys).forEach(([name, key]) => {
                if (data[name]) {
                    localStorage.setItem(key, data[name]);
                }
            });
            return true;
        } catch (error) {
            console.error('データのインポートに失敗しました:', error);
            return false;
        }
    }
}

// グローバルインスタンス
const storageManager = new StorageManager();