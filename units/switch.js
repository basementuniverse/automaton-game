class Switch extends Unit {
    mode = 0;
    modes = [
        'rotate',
        'r',
        'b',
        'l',
        't'
    ];
    rotation = 0;
    rotations = ['r', 'b', 'l', 't'];
    directions = {
        t: -Math.PI / 2,
        b: Math.PI / 2,
        l: Math.PI,
        r: 0
    };
    layer2 = null;
    layer3 = null;
    
    constructor(game, position, mode = 0, rotation = 0) {
        super(game, position);

        this.inputs = ['t', 'l', 'r', 'b'];
        this.outputs = [];
        this.productCapacity = 1;
        this.workerCapacity = 1;
        this.tickRate = utility.ticks(config.times.switchRotateTime);
        this.mode = mode;
        this.rotation = rotation;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.text = String.fromCharCode(8865);
        layer.scale = vec(config.unitScale);

        const layer2 = this.activeTile.addLayer();
        layer2.foreground = 'white';
        layer2.centered = true;
        layer2.text = String.fromCharCode(9656);
        layer2.offset = vec(0, -0.07);
        this.layer2 = layer2;

        const layer3 = this.activeTile.addLayer();
        layer3.foreground = 'yellow';
        layer3.centered = true;
        layer3.offset = vec(0, -0.4);
        layer3.text = '*';
        layer3.fontStyle = 'bold';
        layer3.outline = '0.3 black';
        layer3.scale = vec(0.4);
        this.layer3 = layer3;

        this.updateDirection();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    updateDirection() {
        if (this.mode > 0) { // locked
            this.rotation = this.rotations.findIndex(v => v == this.modes[this.mode]);
            this.layer3.opacity = 0;
        } else { // rotate
            this.layer3.opacity = 1;
        }
        this.outputs = [this.rotations[this.rotation]];
        this.layer2.animateRotation(
            this.directions[this.rotations[this.rotation]],
            {
                relative: false,
                time: config.times.switchRotateTime / 4
            }
        );
        // this.layer2.rotation = this.directions[this.rotations[this.rotation]];
    }

    tapped() {
        this.mode++;
        if (this.mode >= this.modes.length) {
            this.mode = 0;
        }
        this.updateDirection();
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
        if (this.mode == 0) {
            this.rotation++;
            if (this.rotation >= this.rotations.length) {
                this.rotation = 0;
            }
            this.updateDirection();
        }
    }

    serialize() {
        return {
            ...super.serialize(),
            mode: this.mode,
            rotation: this.rotation
        };
    }

    static deserialize(game, data) {
        return new Switch(game, data.position, data.mode, data.rotation);
    }
}
