class Extractor extends Unit {
    running = false;
    layer = null;

    constructor(game, position) {
        super(game, position);

        this.outputs = ['t', 'b', 'l', 'r'];
        this.productCapacity = 8;
        this.tickRate = utility.ticks(config.times.resourceExtraction);

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.font = 'automaton';
        layer.text = config.icons.extractor;
        layer.centered = true;
        this.layer = layer;
    }

    exclusivity = u => (u instanceof Resource);

    checkRunning(map) {
        return this.productAmount < this.productCapacity && map.getUnits(this.position).some(u => (u instanceof Resource));
    }

    update(map) {
        const oldRunning = this.running;
        this.running = this.checkRunning(map);
        if (oldRunning !== this.running) {
            if (this.running) {
                this.layer.animateRotation(Math.PI * 2, {
                    direction: 'cw',
                    time: utility.time(this.tickRate) * this.productCapacity,
                    repeat: true
                });
            } else {
                this.layer.animations = [];
            }
        }
        super.update(map);
    }

    tick(map) {
        if (this.running) {
            for (let unit of map.getUnits(this.position).filter(u => (u instanceof Resource))) {
                this.giveProduct(unit.takeProduct());
            }
        }
    }

    static deserialize(game, data) {
        return new Extractor(game, data.position);
    }
}
