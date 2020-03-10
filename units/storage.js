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
        this.capacity = this.capacities[this.types[this.type]];
        this.tickRate = 8;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.storage;//String.fromCharCode(8862);
        // layer.scale = vec(config.unitScale);
    }

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
        this.capacity = this.capacities[this.types[this.type]];
        if (this.amount > this.capacity) {
            this.inventory = this.inventory.slice(0, this.capacity);
        }
    }

    tick(map) {
        if (this.amount < this.capacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.amount > 0 && this.amount < this.capacity && (unit instanceof Pipe)) {
                    this.give(unit.take());
                }
            }
        }
    }

    update(map) {
        super.update(map);
        this.debugLayer.text = `${this.amount} / ${this.capacity}`;
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
