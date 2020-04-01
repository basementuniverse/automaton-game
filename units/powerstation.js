class PowerStation extends Unit {
    running = false;
    powerRate = 120;
    progress = 0;
    currentProduct = null;
    currentWorker = null;
    layer = null;
    layer2 = null;
    layer3 = null;
    amountCoefficient = 2;
    amountOffset = 4;

    constructor(game, position) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.productCapacity = 1;
        this.workerCapacity = 1;

        const layer = this.activeTile.addLayer();
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.power1;
        this.layer = layer;

        const layer2 = this.activeTile.addLayer();
        layer2.centered = true;
        // layer2.font = 'automaton';
        // layer2.text = config.icons.power2;
        layer2.text = String.fromCharCode(8226);
        // layer2.scale = vec(0.3);
        // layer2.offset = vec(0.4);
        layer2.offset = vec(-0.1, 0.4);
        // layer2.outline = '0.3 white';
        layer2.outline = '0.1 white';
        this.layer2 = layer2;

        const layer3 = this.activeTile.addLayer();
        layer3.centered = true;
        layer3.font = 'automaton';
        layer3.text = config.icons.worker;
        layer3.scale = vec(0.3);
        layer3.offset = vec(-0.4, 0.35);
        layer3.outline = '0.3 white';
        this.layer3 = layer3;

        this.updateBadges();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    updateBadges() {
        if (this.currentProduct === null) {
            this.layer2.foreground = '#333';
        } else {
            this.layer2.foreground = utility.colourString(this.currentProduct.colour);
        }
        if (this.currentWorker === null) {
            this.layer3.foreground = '#333';
        } else {
            this.layer3.foreground = '#aaa';
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
        const oldRunning = this.running;
        this.running = this.checkRunning();
        if (this.running) {
            const heartbeat = 0;//Math.max(0, utility.triangleWave(2, 1.5, this.ticks / config.tickRate) - 1);
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
        if (oldRunning !== this.running) {
            if (this.running) {
                this.layer.animateRotation(Math.PI * 2, { direction: 'cw', time: 1, repeat: true });
            } else {
                this.layer.rotation = 0;
                this.layer.animations = [];
            }
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
