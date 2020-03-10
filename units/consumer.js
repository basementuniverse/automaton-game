class Consumer extends Unit {
    feedRate = 90;
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
        'sad4'
    ];
    output = [0, 0, 0];
    layer = null;
    icons = {
        hungry: config.icons.hungry,
        sad4: config.icons.dead,
        sad3: config.icons.sad3,
        sad2: config.icons.sad2,
        sad1: config.icons.sad1,
        neutral: config.icons.neutral,
        happy1: config.icons.happy1,
        happy2: config.icons.happy2,
        happy3: config.icons.happy3,
        happy4: config.icons.star
    };
    layer2 = null;

    constructor(game, position, requirement = 0, state = 0) {
        super(game, position);

        this.inputs = ['t', 'b', 'l', 'r'];
        this.tickRate = 8;
        this.capacity = 1;
        this.requirement = requirement;
        this.state = state;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = 'white';
        layer.centered = true;
        layer.font = 'automaton';
        layer.text = this.icons[this.states[this.state]];
        layer.scale = vec(1.1);
        this.layer = layer;

        const layer2 = this.activeTile.addLayer(null);
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

    setRequirementBadge() {
        const r = this.requirements[this.requirement];
        this.layer2.foreground = utility.colourString(r);//`rgb(${r[0] * 255}, ${r[1] * 255}, ${r[2] * 255})`;
    }

    checkRequirements() {
        if (this.currentFood === null) {
            this.state = 0; // hungry
            this.output = [0, 0, 0];
        } else {
            // unhappy if getting nothing we require
            // neutral if getting some of what we require
            // happy if getting all of what we require
            const R = 0, G = 1, B = 2;
            const r = this.requirements[this.requirement];
            const f = this.currentFood.colour;
            
            let state = 1; // neutral
            if ([R, G, B].every(c => !r[c] || !f[c])) {
                state = Math.clamp(6 + this.currentFood.level, 6, 8); // sad
            }
            if ([R, G, B].every(c => !r[c] || f[c])) {
                state = Math.clamp(2 + this.currentFood.level, 2, 4); // happy
            }
            this.state = state;
            this.output = [R, G, B].map(c => (r[c] && f[c]) ? 1 : 0);
        }
        this.layer.text = this.icons[this.states[this.state]];
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
            if (unit.amount > 0 && this.amount < this.capacity && (unit instanceof Pipe)) {
                this.give(unit.take());
            }
        }
    }

    update(map) {
        super.update(map);
        if (this.currentFood === null && this.amount >= 1) {
            this.currentFood = this.inventory.shift();
            this.currentFood.dispose();
        }
        if (this.progress >= this.feedRate) {
            this.progress = 0;
            this.currentFood = null;
        }
        this.checkRequirements();
        if (this.currentFood) {
            const heartbeat = Math.max(0, utility.triangleWave(2, 1.5, this.ticks / config.tickRate) - 1);
            const spread = (this.currentFood.level * 2) + 4;
            this.game.setPowerMap(
                this.position.x, this.position.y,
                'h',
                this.output[0] * spread + heartbeat,// this.currentFood.colour[0] * spread + heartbeat,
                this.output[1] * spread + heartbeat,// this.currentFood.colour[1] * spread + heartbeat,
                this.output[2] * spread + heartbeat// this.currentFood.colour[2] * spread + heartbeat
            );
            this.progress++;
        }
    }

    serialize() {
        const data = {
            ...super.serialize(),
            progress: this.progress,
            requirement: this.requirement,
            state: this.state
        };
        if (this.currentFood) {
            data.currentFood = this.currentFood.serialize();
        }
        return data;
    }

    static deserialize(game, data) {
        const unit = new Consumer(game, data.position, data.requirement, data.state);
        if (data.currentFood) {
            unit.currentFood = Product.deserialize(game, data.currentFood, unit);
        }
        return unit;
    }
}
