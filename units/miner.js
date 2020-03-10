class Miner extends Unit {
    running = false;
    layer = null;

    constructor(game, position) {
        super(game, position);

        this.outputs = ['t', 'b', 'l', 'r'];
        this.capacity = 8;
        this.tickRate = 30;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.font = 'automaton';
        layer.text = config.icons.miner;//String.fromCharCode(9676);
        layer.centered = true;
        // layer.scale = vec(config.unitScale);
        this.layer = layer;
    }

    exclusivity = u => (u instanceof Resource);

    checkRunning(map) {
        return this.amount < this.capacity && map.getUnits(this.position).some(u => (u instanceof Resource));
    }

    update(map) {
        const oldRunning = this.running;
        this.running = this.checkRunning(map);
        if (oldRunning !== this.running) {
            if (this.running) {
                this.layer.animateRotation(Math.PI * 2, { direction: 'cw', time: 1, repeat: true });
            } else {
                this.layer.rotation = 0;
                this.layer.animations = [];
            }
        }
        super.update(map);
    }

    give(product) {
        super.give(product);
        if (product) {
            // product.activeTile.opacity = 0;
        }
    }

    take() {
        const product = super.take();
        if (product) {
            // product.activeTile.opacity = 1;
        }
        return product;
    }

    tick(map) {
        if (this.running) {
            for (let unit of map.getUnits(this.position).filter(u => (u instanceof Resource))) {
                this.give(unit.take());
            }
        }
    }

    static deserialize(game, data) {
        return new Miner(game, data.position);
    }
}
