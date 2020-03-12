class City extends Unit {
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
        this.workerCapacity = this.capacities[this.types[this.type]];
        this.tickRate = 8;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.city;
        layer.scale = vec(1.2);
    }

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
        this.workerCapacity = this.capacities[this.types[this.type]];
    }

    tick(map) {
        if (this.workerAmount < this.workerCapacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.workerAmount > 0 && this.workerAmount < this.workerCapacity && (unit instanceof Path)) {
                    this.giveWorker(unit.takeWorker());
                }
            }
        }
    }

    update(map) {
        super.update(map);
        this.debugLayer.text = `${this.workerAmount} / ${this.workerCapacity}`;
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type
        };
    }

    static deserialize(game, data) {
        return new City(game, data.position, data.type);
    }
}
