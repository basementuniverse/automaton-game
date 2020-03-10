class Refiner extends Unit {
    filter = 0;
    filters = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    filterLabels = 'RGB';
    refiningRate = 60;
    progress = 0;
    product = null;
    layer2 = null;

    constructor(game, position, filter = 0) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.capacity = 1;
        this.filter = filter;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.text = String.fromCharCode(8863);
        layer.scale = vec(config.unitScale);

        const layer2 = this.activeTile.addLayer(null);
        layer2.centered = true;
        layer2.text = String.fromCharCode(8226);
        layer2.offset = vec(0.4);
        layer2.outline = '0.1 white';
        this.layer2 = layer2;
        this.setFilterBadge();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    setFilterBadge() {
        const r = this.filters[this.filter];
        this.layer2.foreground = utility.colourString(r);//`rgb(${r[0] * 255}, ${r[1] * 255}, ${r[2] * 255})`;
    }

    dispose() {
        super.dispose();
        if (this.product) {
            this.product.dispose();
        }
    }

    tapped() {
        this.filter++;
        if (this.filter >= this.filters.length) {
            this.filter = 0;
        }
        this.setFilterBadge();
    }

    tick(map) {
        const inputUnits = this.getInputs(map);
        for (let unit of inputUnits) {
            if (unit.amount > 0 && this.amount < this.capacity && (unit instanceof Pipe)) {
                this.give(unit.take());
            }
        }
    }

    update(map) {
        super.update(map);
        if (this.product === null && this.amount >= 1) {
            this.progress++;
        }
        if (this.progress >= this.refiningRate) {
            this.progress = 0;
            const unit = this.inventory.shift();
            this.product = unit.refine(this.filters[this.filter]);
            // this.product.activeTile.position = this.position;
            unit.dispose();
        }
        this.debugLayer.text = `${this.amount} : ${this.filterLabels[this.filter]}`;
    }

    take() {
        if (this.product !== null) {
            const product = this.product;
            this.product = null;
            this.progress = 0;
            return product;
        }
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
        return data;
    }

    static deserialize(game, data) {
        const unit = new Refiner(game, data.position, data.filter);
        if (data.product) {
            unit.product = Product.deserialize(game, data.product, unit);
        }
        return unit;
    }
}
