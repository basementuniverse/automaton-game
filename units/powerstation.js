class PowerStation extends Unit {
    running = false;
    powerRate = 0;
    progress = 0;
    currentProduct = null;
    currentWorker = null;
    layer = null;
    workerBadge = null;
    amountCoefficient = 2;
    amountOffset = 4;

    constructor(game, position) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.tickRate = utility.ticks(config.times.itemThroughStorage);
        this.powerRate = utility.ticks(config.times.powerStationFuelConsumption);
        this.productCapacity = 1;
        this.workerCapacity = 1;

        const layer = this.activeTile.addLayer();
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.power2;//config.icons.power1;
        this.layer = layer;

        const layer3 = this.activeTile.addLayer();
        layer3.centered = true;
        layer3.font = 'automaton';
        layer3.text = config.icons.worker;
        layer3.scale = vec(0.3);
        layer3.offset = vec(-0.4, 0.35);
        layer3.outline = '0.3 white';
        this.workerBadge = layer3;

        this.updateBadges();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    updateBadges() {
        if (this.currentWorker === null) {
            this.workerBadge.foreground = '#333';
        } else {
            this.workerBadge.foreground = '#aaa';
        }
    }

    dispose() {
        super.dispose();
        if (this.currentProduct) {
            this.currentProduct.dispose();
        }
        if (this.currentWorker) {
            this.currentWorker.dispose();
        }
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

    takeProduct() {
        return null;
    }

    takeWorker() {
        return null;
    }

    get colour() {
        return this.currentProduct !== null ? this.currentProduct.colour : [0, 0, 0];
    }

    get amount() {
        if (this.currentProduct === null) {
            return 0;
        }
        return this.amountOffset + this.amountCoefficient * this.currentProduct.level;
    }

    checkRunning() {
        return this.currentProduct !== null && this.currentWorker !== null;
    }

    update(map) {
        super.update(map);
        if (this.currentProduct === null && this.productAmount >= 1) {
            this.currentProduct = this.productInventory.shift();
        }
        if (this.currentWorker === null && this.workerAmount >= 1) {
            this.currentWorker = this.workerInventory.shift();
        }
        if (this.progress >= this.powerRate) {
            this.progress = 0;
            this.currentProduct.dispose();
            this.currentProduct = null;
            if (this.currentWorker.work() === false) {
                this.currentWorker = null;
            }
        }
        this.running = this.checkRunning();
        if (this.running) {
            const heartbeat = 0;//Math.max(0, utility.triangleWave(2, 1.5, this.ticks / config.updateRate) - 1);
            const colour = this.colour, amount = this.amount;
            this.game.powerMap.set(
                this.position.x, this.position.y,
                'h',
                colour[0] * amount + heartbeat,
                colour[1] * amount + heartbeat,
                colour[2] * amount + heartbeat
            );
            this.progress++;
        }
        this.updateBadges();
    }

    serialize() {
        const data = {
            ...super.serialize(),
            progress: this.progress
        };
        if (this.currentProduct) {
            data.currentProduct = this.currentProduct.serialize();
        }
        if (this.currentWorker) {
            data.currentWorker = this.currentWorker.serialize();
        }
        return data;
    }

    static deserialize(game, data) {
        const unit = new PowerStation(game, data.position);
        if (data.currentProduct) {
            unit.currentProduct = Product.deserialize(game, data.currentProduct, unit);
        }
        if (data.currentWorker) {
            unit.currentWorker = Worker.deserialize(game, data.currentWorker, unit);
        }
        return unit;
    }
}
