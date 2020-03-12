class Worker {
    game = null;
    level = 0;

    constructor(game, level) {
        this.game = game;
        this.level = level;
    }

    dispose() {}

    work() {
        this.level--;
        if (this.level < 0) {
            this.dispose();
            return false;
        }
        return this.level;
    }

    serialize() {
        return {
            level: this.level
        };
    }

    static deserialize(game, data, container) {
        return new Worker(game, data.level);
    }
}
