// キャラクター管理
class CharacterManager {
    constructor() {
        this.dragonTypes = [
            { id: 1, name: 'ひりゅう', emoji: '🐉', color: '#FF6B6B', unlockScore: 50, image: 'images/dragons/dragon1.png' },
            { id: 2, name: 'みずりゅう', emoji: '🐲', color: '#4ECDC4', unlockScore: 100, image: 'images/dragons/dragon2.png' },
            { id: 3, name: 'かりゅう', emoji: '🔥', color: '#FF8E53', unlockScore: 150, image: 'images/dragons/dragon3.png' },
            { id: 4, name: 'でんりゅう', emoji: '⚡', color: '#FFD93D', unlockScore: 200, image: 'images/dragons/dragon4.png' },
            { id: 5, name: 'こおりりゅう', emoji: '❄️', color: '#6BCF7F', unlockScore: 250, image: 'images/dragons/dragon5.png' },
            { id: 6, name: 'きんりゅう', emoji: '✨', color: '#FFD700', unlockScore: 300, image: 'images/dragons/dragon6.png' },
            { id: 7, name: 'やみりゅう', emoji: '🌙', color: '#9B59B6', unlockScore: 350, image: 'images/dragons/dragon1.png' },
            { id: 8, name: 'ひかりりゅう', emoji: '🌟', color: '#F39C12', unlockScore: 400, image: 'images/dragons/dragon2.png' },
            { id: 9, name: 'じりゅう', emoji: '🌍', color: '#8B4513', unlockScore: 450, image: 'images/dragons/dragon3.png' },
            { id: 10, name: 'てんりゅう', emoji: '🌈', color: '#E91E63', unlockScore: 500, image: 'images/dragons/dragon4.png' }
        ];
        
        this.eggStages = [
            { stage: 1, emoji: '🥚', progress: 0 },
            { stage: 2, emoji: '🥚', progress: 25 },
            { stage: 3, emoji: '🐣', progress: 50 },
            { stage: 4, emoji: '🐤', progress: 75 },
            { stage: 5, emoji: '🐉', progress: 100 }
        ];
    }
    
    // 次のドラゴンまでの必要スコアを計算
    getScoreToNextDragon(currentScore) {
        const nextDragon = this.getNextDragon(currentScore);
        if (!nextDragon) {
            return 0; // すべてのドラゴンを解放済み
        }
        return nextDragon.unlockScore - currentScore;
    }
    
    // 次に解放されるドラゴンを取得
    getNextDragon(currentScore) {
        return this.dragonTypes.find(dragon => dragon.unlockScore > currentScore);
    }
    
    // 解放可能なドラゴンを取得
    getUnlockableDragons(currentScore) {
        const unlockedDragons = storageManager.getDragons().map(d => d.id);
        return this.dragonTypes.filter(dragon => 
            dragon.unlockScore <= currentScore && 
            !unlockedDragons.includes(dragon.id)
        );
    }
    
    // ドラゴンを解放
    unlockDragon(dragonId) {
        const dragonType = this.dragonTypes.find(d => d.id === dragonId);
        if (!dragonType) return null;
        
        const newDragon = {
            id: dragonType.id,
            name: dragonType.name,
            emoji: dragonType.emoji,
            color: dragonType.color,
            image: dragonType.image,
            unlockDate: new Date().toISOString(),
            level: 1,
            happiness: 100
        };
        
        const dragons = storageManager.addDragon(newDragon);
        return newDragon;
    }
    
    // 卵の状態を取得
    getEggState(currentScore) {
        const nextDragon = this.getNextDragon(currentScore);
        if (!nextDragon) {
            return {
                stage: 5,
                emoji: '🌟',
                progress: 100,
                message: 'すべてのドラゴンがそろいました！'
            };
        }
        
        const previousScore = nextDragon.unlockScore - 50;
        const progressScore = currentScore - previousScore;
        const progressPercent = Math.max(0, Math.min(100, (progressScore / 50) * 100));
        
        let stage = 1;
        if (progressPercent >= 75) stage = 4;
        else if (progressPercent >= 50) stage = 3;
        else if (progressPercent >= 25) stage = 2;
        
        const eggStage = this.eggStages[stage - 1];
        
        return {
            stage: stage,
            emoji: eggStage.emoji,
            progress: progressPercent,
            message: this.getEggMessage(stage, nextDragon),
            nextDragon: nextDragon
        };
    }
    
    // 卵の状態に応じたメッセージを取得
    getEggMessage(stage, nextDragon) {
        switch (stage) {
            case 1:
                return `${nextDragon.name}のたまごがちょっとうごいてる...`;
            case 2:
                return `${nextDragon.name}のたまごがもっとうごいてる！`;
            case 3:
                return `${nextDragon.name}がもうすぐうまれそう！`;
            case 4:
                return `${nextDragon.name}がいまにもうまれそう！！`;
            default:
                return `あたらしいともだちをまってるよ`;
        }
    }
    
    // ドラゴン誕生の演出をチェック
    checkForDragonBirth(oldScore, newScore) {
        const unlockableDragons = this.getUnlockableDragons(newScore);
        const newlyUnlocked = [];
        
        unlockableDragons.forEach(dragonType => {
            if (dragonType.unlockScore > oldScore && dragonType.unlockScore <= newScore) {
                const newDragon = this.unlockDragon(dragonType.id);
                if (newDragon) {
                    newlyUnlocked.push(newDragon);
                }
            }
        });
        
        return newlyUnlocked;
    }
    
    // ドラゴンギャラリー用のデータを取得
    getDragonsForGallery() {
        const dragons = storageManager.getDragons();
        return dragons.map(dragon => ({
            ...dragon,
            displayName: dragon.name,
            displayEmoji: dragon.emoji
        }));
    }
    
    // ドラゴンの詳細情報を取得
    getDragonDetails(dragonId) {
        const dragons = storageManager.getDragons();
        const dragon = dragons.find(d => d.id === dragonId);
        if (!dragon) return null;
        
        const dragonType = this.dragonTypes.find(d => d.id === dragonId);
        const daysOwned = Math.floor((Date.now() - new Date(dragon.unlockDate).getTime()) / (1000 * 60 * 60 * 24));
        
        return {
            ...dragon,
            type: dragonType,
            unlockDate: new Date(dragon.unlockDate).toLocaleDateString('ja-JP'),
            daysOwned: daysOwned,
            personalMessage: this.getDragonPersonalMessage(dragonType, dragon.happiness)
        };
    }
    
    // ドラゴンの個性的なメッセージを取得
    getDragonPersonalMessage(dragonType, happiness) {
        const messages = {
            1: [ // ひりゅう
                'こんにちは！きょうもがんばろうね！',
                'きみといっしょだとたのしいよ！',
                'かんじのべんきょう、がんばってるね！'
            ],
            2: [ // みずりゅう
                'みずのようにきれいなこころをもってるね！',
                'ながれるみずのように、まえにすすもう！',
                'みずはやさしく、つよい。きみもそうだよ！'
            ],
            3: [ // かりゅう
                'あつい きもちで がんばろう！',
                'ほのおのように、やるきをもやそう！',
                'きみのじょうねつが、ぼくをげんきにするよ！'
            ],
            4: [ // でんりゅう
                'でんきのようにすばやく かんがえよう！',
                'きらめく ひらめきを だいじにしてね！',
                'きみの のうりょくは でんこうせっか だね！'
            ],
            5: [ // こおりりゅう
                'つめたくても、こころは あたたかいよ！',
                'しずかに、おちついて かんがえよう！',
                'こおりのように とうめいな きもちでいこう！'
            ],
            6: [ // きんりゅう
                'きんきらきんの みらいが まってるよ！',
                'たからものよりも だいじなのは、きみのえがお！',
                'おうごんに かがやく きぼうを もとう！'
            ],
            7: [ // やみりゅう
                'やみの なかでも、ひかりを みつけよう！',
                'しずかな よるは、かんがえるのに ぴったりだね！',
                'ほしあかりのように、やさしく てらそう！'
            ],
            8: [ // ひかりりゅう
                'ひかりのように、みんなを てらそう！',
                'あかるい きもちが いちばん だいじ！',
                'きみの えがおが、せかいを あかるくするよ！'
            ],
            9: [ // じりゅう
                'だいちのように、しっかりと たとう！',
                'つちの なかから、あたらしい いのちが うまれるよ！',
                'やまのように たくましく、かわのように やさしく！'
            ],
            10: [ // てんりゅう
                'そらたかく とんで、ゆめを つかもう！',
                'にじのように、いろんな いろを たいせつに！',
                'てんごくのような ここちよさを、みんなに あげよう！'
            ]
        };
        
        const dragonMessages = messages[dragonType.id] || messages[1];
        let messageIndex = 0;
        
        // 幸福度と日数に応じてメッセージを選択
        if (happiness >= 80) {
            messageIndex = 0; // 元気なメッセージ
        } else if (happiness >= 50) {
            messageIndex = 1; // 普通のメッセージ
        } else {
            messageIndex = 2; // 励ましのメッセージ
        }
        
        return dragonMessages[messageIndex % dragonMessages.length];
    }
    
    // ドラゴンの幸福度を更新
    updateDragonHappiness(dragonId, change) {
        const dragons = storageManager.getDragons();
        const dragonIndex = dragons.findIndex(d => d.id === dragonId);
        
        if (dragonIndex !== -1) {
            dragons[dragonIndex].happiness = Math.max(0, Math.min(100, 
                dragons[dragonIndex].happiness + change));
            storageManager.setDragons(dragons);
            return dragons[dragonIndex];
        }
        
        return null;
    }
    
    // すべてのドラゴンの幸福度を少し上げる（正解時）
    celebrateWithDragons() {
        const dragons = storageManager.getDragons();
        const updated = dragons.map(dragon => ({
            ...dragon,
            happiness: Math.min(100, dragon.happiness + 2)
        }));
        storageManager.setDragons(updated);
        return updated;
    }
    
    // 励ましメッセージを取得（不正解時）
    getEncouragementMessage() {
        const messages = [
            'がんばって！',
            'つぎはできるよ！',
            'あきらめないで！',
            'もういちどちょうせん！',
            'きっとできるよ！',
            'ドラゴンたちがおうえんしてるよ！'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // 正解時のお祝いメッセージを取得
    getCelebrationMessage() {
        const messages = [
            'やったね！',
            'すごいよ！',
            'せいかい！',
            'よくできました！',
            'かんぺき！',
            'ドラゴンたちがよろこんでる！'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// グローバルインスタンス
const characterManager = new CharacterManager();