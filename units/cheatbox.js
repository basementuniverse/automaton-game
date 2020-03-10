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
        this.capacity = 1;
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
        this.layer.foreground = utility.colourString(r);//`rgb(${r[0] * 255}, ${r[1] * 255}, ${r[2] * 255})`;
    }

    tapped() {
        this.colour++;
        if (this.colour >= this.colours.length) {
            this.colour = 0;
        }
        this.setColour();
        this.clearInventory();
    }

    tick(map) {
        const inputUnits = this.getInputs(map);
        for (let unit of inputUnits) {
            if (unit.amount > 0 && (unit instanceof Pipe)) {
                this.give(unit.take());
            }
        }
    }

    get amount() {
        return 1;
    }

    get level() {
        return this.inventory.length > 0 ? (this.inventory[0].level + 1) : 0;
    }

    give(product) {
        this.clearInventory();
        super.give(product);
    }

    take() {
        return new Product(this.game, this.level, this.colours[this.colour]);
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
