class Refiner extends Unit {
    filter = 0;
    filters = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    filterLabels = 'RGB';
    progress = 0;
    product = null;
    filterBadge = null;
    workerBadge = null;
    powerBadge = null;
    currentWorker = null;

    constructor(game, position, filter = 0) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = utility.ticks(config.times.itemThroughStorage);
        this.productCapacity = 1;
        this.workerCapacity = 1;
        this.filter = filter;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.text = String.fromCharCode(8863);
        layer.scale = vec(config.unitScale);

        const layer2 = this.activeTile.addLayer();
        layer2.centered = true;
        layer2.text = String.fromCharCode(8226);
        layer2.offset = vec(0.4);
        layer2.outline = '0.1 white';
        this.filterBadge = layer2;

        const layer3 = this.activeTile.addLayer();
        layer3.centered = true;
        layer3.font = 'automaton';
        layer3.text = config.icons.worker;
        layer3.scale = vec(0.3);
        layer3.offset = vec(-0.4, 0.35);
        layer3.outline = '0.3 white';
        this.workerBadge = layer3;

        const layer4 = this.activeTile.addLayer();
        layer4.centered = true;
        layer4.font = 'automaton';
        layer4.text = config.icons.power2;
        layer4.scale = vec(0.3);
        layer4.offset = vec(-0.15, 0.35);
        layer4.outline = '0.3 white';
        this.powerBadge = layer4;

        this.updateBadges();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    updateBadges() {
        const r = this.filters[this.filter];
        this.filterBadge.foreground = utility.colourString(r);
        this.workerBadge.foreground = this.currentWorker === null ? '#333' : '#aaa';
        this.powerBadge.foreground = ['#333', '#666', '#aaa'][this.powered];
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

    tapped() {
        this.filter++;
        if (this.filter >= this.filters.length) {
            this.filter = 0;
        }
    }

    get powered() {
        const power = this.game.powerMap.getPowerState(this.position.x, this.position.y);
        if (!power.r && !power.g && !power.b) {
            return 0;
        }
        if (this.productAmount > 0) {
            const a = this.productInventory[0];
            const product = { r: a.colour[0], g: a.colour[1], b: a.colour[2] };
            if (['r', 'g', 'b'].every(c => !product[c] || power[c])) {
                return 2;
            }
        }
        return 1;
    }

    get refiningRate() {
        return utility.ticks([
            1000000,
            config.times.productRefinement,
            config.times.productRefinementOptimal
        ][this.powered]);
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
        if (this.product === null && this.productAmount >= 2 && this.currentWorker !== null && this.powered > 0) {
            this.progress++;
        }
        if (this.progress >= this.refiningRate) {
            this.progress = 0;
            const unit = this.productInventory.shift();
            this.product = unit.refine(this.filters[this.filter]);
            unit.dispose();
            if (this.currentWorker.work() === false) {
                this.currentWorker = null;
            }
        }
        this.updateBadges();
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
            filter: this.filter,
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
        const unit = new Refiner(game, data.position, data.filter);
        if (data.product) {
            unit.product = Product.deserialize(game, data.product, unit);
        }
        if (data.currentWorker) {
            unit.currentWorker = Worker.deserialize(game, data.currentWorker, unit);
        }
        return unit;
    }
}
