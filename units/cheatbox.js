class CheatBox extends Unit {
    colour = 0;
    colours = [
        [1, 1, 1],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 0],
        [0, 1, 1],
        [1, 0, 1]
    ];
    layer = null;

    constructor(game, position, colour = 0) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.colour = colour;
        this.productCapacity = 1;
        this.workerCapacity = 1;
        this.tickRate = 4;

        const layer = this.activeTile.addLayer(null, -1);
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.star;
        this.layer = layer;
        this.setColour();
    }

    setColour() {
        const r = this.colours[this.colour];
        this.layer.foreground = utility.colourString(r);
    }

    tapped() {
        this.colour++;
        if (this.colour >= this.colours.length) {
            this.colour = 0;
        }
        this.setColour();
        this.clearProducts();
        this.clearWorkers();
    }

    tick(map) {
        const inputUnits = this.getInputs(map);
        for (let unit of inputUnits) {
            if (unit.productAmount > 0 && (unit instanceof Pipe)) {
                this.giveProduct(unit.takeProduct());
            }
            if (unit.workerAmount > 0 && (unit instanceof Path)) {
                this.giveWorker(unit.takeWorker());
            }
        }
    }

    get productAmount() {
        return 1;
    }

    get workerAmount() {
        return 1;
    }

    get level() {
        const p = this.productInventory.length > 0 ? (this.productInventory[0].level + 1) : 0;
        const w = this.workerInventory.length > 0 ? (this.workerInventory[0].level + 1) : 0;
        return Math.max(p, w);
    }

    giveProduct(product) {
        this.clearProducts();
        super.giveProduct(product);
    }

    takeProduct() {
        return new Product(this.game, this.level, this.colours[this.colour]);
    }

    giveWorker(worker) {
        this.clearWorkers();
        super.giveWorker(worker);
    }

    takeWorker() {
        return new Worker(this.game, this.level);
    }

    update(map) {
        super.update(map);
        this.debugLayer.text = `${this.level}`;
    }

    serialize() {
        return {
            ...super.serialize(),
            colour: this.colour
        };
    }

    static deserialize(game, data) {
        return new CheatBox(game, data.position, data.colour);
    }
}
