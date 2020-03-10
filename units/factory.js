class Factory extends Unit {
    productionRate = 60;
    progress = 0;
    product = null;

    constructor(game, position) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.capacity = 2;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.text = String.fromCharCode(8864);
        layer.scale = vec(config.unitScale);

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    dispose() {
        super.dispose();
        if (this.product) {
            this.product.dispose();
        }
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
        if (this.product === null && this.amount >= 2) {
            this.progress++;
        }
        if (this.progress >= this.productionRate) {
            this.progress = 0;
            const a = this.inventory.shift();
            const b = this.inventory.shift();
            this.product = a.combine(b);
            // this.product.activeTile.position = this.position;
            a.dispose();
            b.dispose();
        }
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
            progress: this.progress
        };
        if (this.product) {
            data.product = this.product.serialize();
        }
        return data;
    }

    static deserialize(game, data) {
        const unit = new Factory(game, data.position);
        if (data.product) {
            unit.product = Product.deserialize(game, data.product, unit);
        }
        return unit;
    }
}
