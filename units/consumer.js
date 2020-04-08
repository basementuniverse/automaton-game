class Consumer extends Unit {
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
    requirementBadge = null;
    powerBadge = null;

    constructor(game, position, requirement = 0, state = 0, lockedRequirements = null) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.outputs = ['t', 'b', 'l', 'r'];
        this.tickRate = utility.ticks(config.times.itemThroughStorage);
        this.productCapacity = 1;
        this.workerCapacity = 1;
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
        this.requirementBadge = layer2;

        const layer3 = this.activeTile.addLayer();
        layer3.centered = true;
        layer3.font = 'automaton';
        layer3.text = config.icons.power2;
        layer3.scale = vec(0.3);
        layer3.offset = vec(-0.4, 0.35);
        layer3.outline = '0.3 white';
        this.powerBadge = layer3;
        
        this.updateBadges();

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    tapped() {
        this.requirement++;
        if (this.requirement >= this.requirements.length) {
            this.requirement = 0;
        }
        this.updateBadges();
    }

    getActualRequirements() {
        const r = this.requirements[this.requirement];
        return this.lockedRequirements.map((c, i) => c === null ? r[i] : c);
    }

    updateBadges() {
        const c = this.getActualRequirements();
        if (c[0] === 0 && c[1] === 0 && c[2] === 0) {
            this.requirementBadge.foreground = '#333';
        } else {
            this.requirementBadge.foreground = utility.colourString(this.getActualRequirements());
        }
        this.powerBadge.foreground = ['#333', '#666', '#aaa'][this.powered];
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
            this.updateBadges();
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

    get powered() {
        const power = this.game.powerMap.getPowerState(this.position.x, this.position.y);
        if (!power.r && !power.g && !power.b) {
            return 0;
        }
        if (this.currentFood !== null) {
            const food = { r: this.currentFood.colour[0], g: this.currentFood.colour[1], b: this.currentFood.colour[2] };
            if (['r', 'g', 'b'].every(c => !food[c] || power[c])) {
                return 2;
            }
        }
        return 1;
    }

    get feedRate() {
        return utility.ticks([
            config.times.consumerFeedRateUnpowered,
            config.times.consumerFeedRate,
            config.times.consumerFeedRateOptimal
        ][this.powered]);
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
            } else if (this.state === 1) {  // also produce workers when neutral, but only level 0
                this.giveWorker(new Worker(this.game, 0));
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
