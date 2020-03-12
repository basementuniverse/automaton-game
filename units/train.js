class Train extends Unit {
    moving = false;
    targetPosition = null;
    inverted = false;
    type = 0;
    types = [
        'slow',
        'fast'
    ];
    speeds = {
        slow: 64,
        fast: 15,
    };
    layer = null;
    layer2 = null;
    offsets = {
        t: vec(0, -1),
        b: vec(0, 1),
        l: vec(-1, 0),
        r: vec(1, 0)
    };
    inverses = {
        t: 'b',
        b: 't',
        l: 'r',
        r: 'l'
    };

    constructor(game, position, type = 0, inverted = false) {
        super(game, position);

        this.type = type;
        this.inverted = inverted;
        // this.activeTile.flip = this.inverted;

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.productCapacity = 16;
        this.workerCapacity = 16;
        this.tickRate = 8;
        this.moveRate = this.speeds[this.types[this.type]];

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons.train;
        this.layer = layer;

        const layer2 = this.activeTile.addLayer();
        layer2.foreground = 'yellow';
        layer2.centered = true;
        layer2.offset = vec(0, -0.3);
        layer2.text = '!';
        layer2.fontStyle = 'bold';
        layer2.outline = '0.3 black';
        layer2.scale = vec(0.4);
        layer2.opacity = this.type == 1 ? 1 : 0;
        this.layer2 = layer2;
    }

    exclusivity = u => (u instanceof Track);

    tapped() {
        this.type++;
        if (this.type >= this.types.length) {
            this.type = 0;
        }
        this.moveRate = this.speeds[this.types[this.type]];
        this.layer2.opacity = this.type == 1 ? 1 : 0;
    }

    tick(map) {
        if (this.productAmount < this.productCapacity || this.workerAmount < this.workerCapacity) {
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
    }

    move(offset) {
        const p = vec.add(this.position, offset);
        this.activeTile.animations = [];
        this.activeTile.offset = vec();
        this.moving = true;
        this.targetPosition = p;
        this.activeTile.animateOffset(offset.x, offset.y, { time: this.moveRate / config.tickRate }).then(() => {
            this.position = p;
            this.activeTile.position = p;
            this.activeTile.offset = vec();
            this.moving = false;
            this.targetPosition = null;
        });
    }

    update(map) {
        const inputs = this.inverted ? 'outputs' : 'inputs';
        const outputs = this.inverted ? 'inputs' : 'outputs';
        if (!this.moving) {
            const tracks = map.getUnits(this.position).filter(u => (u instanceof Track));
            if (tracks.length) {
                if (map.getUnits(vec.add(this.position, this.offsets[tracks[0][outputs][0]])).filter(u => (
                    u instanceof Track &&
                    u[inputs].some(i => this.inverses[tracks[0][outputs][0]])
                )).length) {
                    this.move(this.offsets[tracks[0][outputs][0]]);
                } else {
                    this.inverted = !this.inverted;
                }
            }
        }
        if (this.targetPosition) {
            this.layer.scale = this.targetPosition.x < this.position.x ? vec(-1, 1) : vec(1);
        }
        super.update(map);
        this.debugLayer.text = `${this.productAmount} : ${this.workerAmount}`;
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            inverted: this.inverted
        };
    }

    static deserialize(game, data) {
        return new Train(game, data.position, data.type, data.inverted);
    }
}
