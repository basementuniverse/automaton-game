class Storage extends Unit {
    type = 0;
    types = [
        'small',
        'medium',
        'large'
    ];
    capacities = {
        small: 16,
        medium: 32,
        large: 64
    };

    constructor(game, position, type = 2) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.type = type;
        this.productCapacity = this.capacities[this.types[this.type]];
        this.tickRate = utility.ticks(config.times.itemThroughStorage);

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.storage;
    }

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
        this.productCapacity = this.capacities[this.types[this.type]];
    }

    tick(map) {
        // Sometimes when storage has multiple inputs and it fills up, it will only take input from one of the inputs
        // This makes sure we only take input when we have enough room for all of it, so we always get a mix of inputs
        const inputUnits = this.getInputs(map).filter(u => (
            (u instanceof Pipe) &&
            u.productAmount > 0
        ));
        if ((this.productAmount + inputUnits.length) < this.productCapacity) {
            inputUnits.forEach(u => {
                this.giveProduct(u.takeProduct());
            });
        }
        // if (this.productAmount < this.productCapacity) {
        //     const inputUnits = this.getInputs(map);
        //     for (let unit of inputUnits) {
        //         if (unit.productAmount > 0 && this.productAmount < this.productCapacity && (unit instanceof Pipe)) {
        //             this.giveProduct(unit.takeProduct());
        //         }
        //     }
        // }
    }

    update(map) {
        super.update(map);
        this.debugLayer.text = `${this.productAmount} / ${this.productCapacity}`;
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type
        };
    }

    static deserialize(game, data) {
        return new Storage(game, data.position, data.type);
    }
}
