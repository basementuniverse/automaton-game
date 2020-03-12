class Factory extends Unit {
    baseProductionRate = 60;
    minProductionRate = 15;
    progress = 0;
    product = null;
    currentWorker = null;
    layer2 = null;

    constructor(game, position) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.productCapacity = 2;
        this.workerCapacity = 1;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.text = String.fromCharCode(8864);
        layer.scale = vec(config.unitScale);

        const layer2 = this.activeTile.addLayer();
        layer2.centered = true;
        layer2.font = 'automaton';
        layer2.text = config.icons.worker;
        layer2.scale = vec(0.3);
        layer2.offset = vec(-0.4, 0.35);
        layer2.outline = '0.3 white';
        this.layer2 = layer2;
        this.updateBadge();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    dispose() {
        super.dispose();
        if (this.product) {
            this.product.dispose();
        }
        if (this.currentWorker) {
            this.currentWorker.dispose();
        }
    }

    updateBadge() {
        if (this.currentWorker === null) {
            this.layer2.foreground = '#333';
        } else {
            this.layer2.foreground = '#aaa';
        }
    }

    get productionRate() {
        if (this.productAmount < 2) {
            return this.baseProductionRate;
        }
        const power = this.game.powerMap.get(this.position.x, this.position.y);
        const a = this.productInventory[0], b = this.productInventory[1];
        const c = { r: a.colour[0] & b.colour[0], g: a.colour[1] & b.colour[1], b: a.colour[2] & b.colour[2] };
        return Math.max(this.minProductionRate, this.baseProductionRate - utility.dotColour(c, power));
    }

    tick(map) {
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

    update(map) {
        super.update(map);
        if (this.currentWorker === null && this.workerAmount >= 1) {
            this.currentWorker = this.workerInventory.shift();
        }
        if (this.product === null && this.productAmount >= 2 && this.currentWorker !== null) {
            this.progress++;
        }
        if (this.progress >= this.productionRate) {
            this.progress = 0;
            const a = this.productInventory.shift();
            const b = this.productInventory.shift();
            this.product = a.combine(b);
            a.dispose();
            b.dispose();
            if (this.currentWorker.work() === false) {
                this.currentWorker = null;
            }
        }
        this.updateBadge();
    }

    takeProduct() {
        if (this.product !== null) {
            const product = this.product;
            this.product = null;
            this.progress = 0;
            return product;
        }
        return null;
    }

    takeWorker() {
        return null;
    }

    serialize() {
        const data = {
            ...super.serialize(),
            progress: this.progress
        };
        if (this.product) {
            data.product = this.product.serialize();
        }
        if (this.currentWorker) {
            data.currentWorker = this.currentWorker.serialize();
        }
        return data;
    }

    static deserialize(game, data) {
        const unit = new Factory(game, data.position);
        if (data.product) {
            unit.product = Product.deserialize(game, data.product, unit);
        }
        if (data.currentWorker) {
            unit.currentWorker = Worker.deserialize(game, data.currentWorker, unit);
        }
        return unit;
    }
}
