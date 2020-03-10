class Scope extends Unit {
    type = 0;
    types = [
        'a',
        'b',
        'c'
    ];
    history = [];

    constructor(game, position, type = 0, history = null) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.capacity = 5;
        this.tickRate = 8;
        this.type = type;
        this.history = history || [];

        const layer = this.activeTile.addLayer(null, -1);
        layer.draw = this.draw.bind(this);

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    give(product) {
        super.give(product);
        this.history.unshift({
            level: product.level,
            colour: product.colour
        });
        if (this.history.length > this.capacity) {
            this.history = this.history.slice(0, this.capacity);
        }
    }

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
    }

    tick(map) {
        if (this.amount < this.capacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.amount > 0 && this.amount < this.capacity && (unit instanceof Pipe)) {
                    this.give(unit.take());
                }
            }
        }
    }

    draw(context, elapsedTime, tileSize) {
        const maxLevel = 5;
        const displaySize = 0.8 * tileSize;
        const barMargin = 0.01 * tileSize;
        const barWidth = displaySize / this.capacity - barMargin;
        const unitHeight = displaySize / maxLevel;
        const offset = vec.mul(vec(0, -0.06), tileSize);
        context.save();
        context.translate(-tileSize / 2 + offset.x, -tileSize / 2 + offset.y);
        context.fillStyle = '#333';
        context.fillRect(0, 0, tileSize, tileSize);
        context.strokeStyle = 'white';
        context.lineWidth = 0.1 * tileSize;
        context.strokeRect(0, 0, tileSize, tileSize);
        context.restore();
        context.save();
        context.translate(-displaySize / 2 + offset.x, displaySize / 2 + offset.y);
        this.history.forEach(h => {
            const height = unitHeight * (Math.min(h.level, maxLevel - 1) + 1);
            context.fillStyle = utility.colourString(h.colour);
            context.fillRect(0, -height, barWidth, height);
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
