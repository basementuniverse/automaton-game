class Scope extends Unit {
    type = 0;
    types = [
        'both',
        'products',
        'workers'
    ];
    productHistory = [];
    workerHistory = [];

    constructor(game, position, type = 0, productHistory = null, workerHistory = null) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.productCapacity = 5;
        this.workerCapacity = 5;
        this.tickRate = utility.ticks(config.times.itemThroughPipe);
        this.type = type;
        this.productHistory = productHistory || [];
        this.workerHistory = workerHistory || [];

        const layer = this.activeTile.addLayer(null, -1);
        layer.draw = this.draw.bind(this);

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    giveProduct(product) {
        super.giveProduct(product);
        this.productHistory.unshift({
            level: product.level,
            colour: product.colour
        });
        if (this.productHistory.length > this.productCapacity) {
            this.productHistory = this.productHistory.slice(0, this.productCapacity);
        }
    }

    giveWorker(worker) {
        super.giveWorker(worker);
        this.workerHistory.unshift({
            level: worker.level,
            colour: worker.colour
        });
        if (this.workerHistory.length > this.workerCapacity) {
            this.workerHistory = this.workerHistory.slice(0, this.workerCapacity);
        }
    }

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
    }

    tick(map) {
        if (this.productAmount < this.productCapacity || this.workerAmount < this.workerCapacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.productAmount > 0 && this.productAmount < this.productCapacity && (unit instanceof Pipe)) {
                    this.giveProduct(unit.takeProduct());
                }
                if (unit.workerAmount > 0 && this.workerAmount < this.workerCapacity && (unit instanceof Path)) {
                    this.giveWorker(unit.takeWorker());
                }
            }
        }
    }

    draw(context, elapsedTime, tileSize) {
        const offset = vec.mul(vec(0, -0.06), tileSize);
        context.save();
        context.translate(-tileSize / 2 + offset.x, -tileSize / 2 + offset.y);
        context.fillStyle = '#333';
        context.fillRect(0, 0, tileSize, tileSize);
        context.strokeStyle = 'white';
        context.lineWidth = 0.1 * tileSize;
        context.strokeRect(0, 0, tileSize, tileSize);
        context.restore();
        const t = this.types[this.type];
        if (t === 'both') {
            this.barChart(context, offset, tileSize, this.productHistory, this.productCapacity, 0.5);
            this.barChart(context, offset, tileSize, this.workerHistory, this.workerCapacity, 0.5, 0.5);
        }
        if (t === 'products') {
            this.barChart(context, offset, tileSize, this.productHistory, this.productCapacity);
        }
        if (t === 'workers') {
            this.barChart(context, offset, tileSize, this.workerHistory, this.workerCapacity);
        }
        context.save();
        context.fillStyle = 'white';
        context.font = `${Math.floor(tileSize / 5)}px sans-serif`;
        context.translate(-tileSize / 2 + offset.x, -tileSize / 2 + offset.y);
        context.fillText(this.types[this.type], 0.1 * tileSize, 0.2 * tileSize);
        context.restore();
    }

    barChart(context, offset, tileSize, history, capacity, barScale = 1, barOffset = 0) {
        const maxLevel = 5;
        const displaySize = 0.8 * tileSize;
        const barMargin = 0.01 * tileSize;
        const barWidth = displaySize / capacity - barMargin;
        const actualBarWidth = barWidth * barScale;
        const actualBarOffset = barWidth * barOffset;
        const unitHeight = displaySize / maxLevel;
        context.save();
        context.translate(-displaySize / 2 + offset.x, displaySize / 2 + offset.y);
        history.forEach(h => {
            const height = unitHeight * (Math.min(h.level, maxLevel - 1) + 1);
            context.fillStyle = h.colour ? utility.colourString(h.colour) : '#aaa';
            context.fillRect(actualBarOffset, -height, actualBarWidth, height);
            context.translate(barWidth + barMargin, 0);
        });
        context.restore();
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            history: this.history
        };
    }

    static deserialize(game, data) {
        return new Scope(game, data.position, data.type, data.history);
    }
}
