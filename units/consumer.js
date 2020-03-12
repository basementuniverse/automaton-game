class Consumer extends Unit {
    baseFeedRate = 90;
    minFeedRate = 30;
    progress = 0;
    currentFood = null;
    requirement = 0;
    requirements = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 1]
    ];
    lockedRequirements = [null, null, null];
    state = 0;
    states = [
        'hungry',
        'neutral',
        'happy1',
        'happy2',
        'happy3',
        'happy4',
        'sad1',
        'sad2',
        'sad3',
        'sad4',
        'full'
    ];
    layer = null;
    layer2 = null;

    constructor(game, position, requirement = 0, state = 0, lockedRequirements = null) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.productCapacity = 1;
        this.workerCapacity = 8;
        this.requirement = requirement;
        this.state = state;
        this.lockedRequirements = lockedRequirements || [null, null, null];

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = config.icons[this.states[this.state]];
        layer.scale = vec(1.1);
        this.layer = layer;

        const layer2 = this.activeTile.addLayer();
        layer2.centered = true;
        layer2.text = String.fromCharCode(8226);
        layer2.offset = vec(0.4);
        layer2.outline = '0.1 white';
        this.layer2 = layer2;
        this.setRequirementBadge();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    tapped() {
        this.requirement++;
        if (this.requirement >= this.requirements.length) {
            this.requirement = 0;
        }
        this.setRequirementBadge();
    }

    getActualRequirements() {
        const r = this.requirements[this.requirement];
        return this.lockedRequirements.map((c, i) => c === null ? r[i] : c);
    }

    setRequirementBadge() {
        const c = this.getActualRequirements();
        if (c[0] === 0 && c[1] === 0 && c[2] === 0) {
            this.layer2.foreground = '#333';
        } else {
            this.layer2.foreground = utility.colourString(this.getActualRequirements());
        }
    }

    checkRequirements() {
        const oldState = this.state;
        if (this.workerAmount >= this.workerCapacity) {
            this.state = 10; // full
        } else if (this.currentFood === null) {
            this.state = 0; // hungry
            this.output = [0, 0, 0];
        } else {
            // unhappy if getting nothing we require
            // neutral if getting some of what we require
            // happy if getting all of what we require
            const R = 0, G = 1, B = 2;
            const r = this.getActualRequirements();
            const f = this.currentFood.colour;
            
            let state = 1; // neutral
            if ([R, G, B].every(c => !r[c] || !f[c])) {
                state = Math.clamp(6 + this.currentFood.level, 6, 9); // sad
            } else if ([R, G, B].every(c => !r[c] || f[c])) {
                state = Math.clamp(2 + this.currentFood.level, 2, 5); // happy
            }
            this.state = state;
        }
        if (this.state !== oldState) {
            if (this.state === 5) {  // happy 4, lock a channel to 1
                const r = this.getActualRequirements();
                for (let i = 0; i < r.length; i++) {
                    if (!r[i] && this.currentFood.colour[i]) {
                        this.lockedRequirements[i] = 1;
                        break;
                    }
                }
            }
            if (this.state === 9) {  // sad 4, lock a channel to 0
                const i = this.getActualRequirements().findIndex(r => r === 1);
                if (i > -1) {
                    this.lockedRequirements[i] = 0;
                }
            }
            this.setRequirementBadge();
        }
        this.layer.text = config.icons[this.states[this.state]];
    }

    dispose() {
        super.dispose();
        if (this.currentFood) {
            this.currentFood.dispose();
        }
    }

    tick(map) {
        const inputUnits = this.getInputs(map);
        for (let unit of inputUnits) {
            if (unit.productAmount > 0 && this.productAmount < this.productCapacity && (unit instanceof Pipe)) {
                this.giveProduct(unit.takeProduct());
            }
        }
    }

    takeProduct() {
        return null;
    }

    get feedRate() {
        if (this.currentFood === null) {
            return this.baseFeedRate;
        }
        const power = this.game.powerMap.get(this.position.x, this.position.y);
        const a = this.currentFood;
        const c = { r: a.colour[0], g: a.colour[1], b: a.colour[2] };
        return Math.max(this.minFeedRate, this.baseFeedRate - utility.dotColour(c, power));
    }

    update(map) {
        super.update(map);
        if (this.currentFood === null && this.productAmount >= 1 && this.workerAmount < this.workerCapacity) {
            this.currentFood = this.productInventory.shift();
            this.currentFood.dispose();
            this.checkRequirements();

            // If we're happy, produce a worker
            if (this.state >= 2 && this.state <= 5) {
                this.giveWorker(new Worker(this.game, this.currentFood.level));
            }
        }
        if (this.progress >= this.feedRate) {
            this.progress = 0;
            this.currentFood = null;
        }
        this.checkRequirements();
        if (this.currentFood) {
            this.progress++;
        }
    }

    serialize() {
        const data = {
            ...super.serialize(),
            progress: this.progress,
            requirement: this.requirement,
            lockedRequirements: this.lockedRequirements,
            state: this.state
        };
        if (this.currentFood) {
            data.currentFood = this.currentFood.serialize();
        }
        return data;
    }

    static deserialize(game, data) {
        const unit = new Consumer(game, data.position, data.requirement, data.state, data.lockedRequirements);
        if (data.currentFood) {
            unit.currentFood = Product.deserialize(game, data.currentFood, unit);
        }
        return unit;
    }
}
