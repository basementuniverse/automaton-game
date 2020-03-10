class Unit {
    game = null;
    position = vec();
    activeTile = null;
    inputs = [];
    outputs = [];
    capacity = 0;
    inventory = [];
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
    debugLayer = null;
    tickRate = 1;
    ticks = 0;
    disposed = false;
    
    constructor(game, position, z = 3) {
        this.game = game;
        this.position = vec(position);
        this.activeTile = new Tily.ActiveTile(this.position.x, this.position.y, z);
        
        // TEMP
        this.debugLayer = this.activeTile.addLayer(new Tily.ActiveTileLayer());
        this.debugLayer.foreground = 'white';
        this.debugLayer.font = 'monospace';
        this.debugLayer.fontStyle = 'bold';
        this.debugLayer.outline = '0.3 black';
        this.debugLayer.text = `${this.amount}`;
        this.debugLayer.scale = vec(0.3);
        this.debugLayer.offset = vec(-0.5);
    }

    get amount() {
        return this.inventory.length;
    }

    clearInventory() {
        this.inventory.forEach(i => i.dispose());
        this.inventory = [];
    }

    exclusivity = u => false;

    dispose() {
        this.clearInventory();
        this.game.tily.activeBuffer.removeActiveTile(this.activeTile);
        this.disposed = true;
    }

    getInputs(map) {
        const result = [];

        // Get a list of adjacent units that have outputs pointing into this unit's inputs
        for (let input of this.inputs) {
            result.push(...map.getUnits(vec.add(this.position, this.offsets[input])).filter(u => (
                u.outputs.some(o => o == this.inverses[input])
            )));
        }
        return result;
    }

    getOutputs(map) {
        const result = [];

        // Get a list of adjecent units that have inputs pointing into this unit's outputs
        for (let output of this.outputs) {
            result.push(...map.getUnits(vec.add(this.position, this.offsets[output])).filter(u => (
                u.inputs.some(o => o == this.inverses[output])
            )));
        }
        return result;
    }

    tapped() {}

    tick(map) {}

    give(product) {
        if (product) {
            this.inventory.push(product);
            // product.activeTile.position = this.position;
        }
    }

    take() {
        if (this.amount > 0) {
            return this.inventory.shift();
        }
    }

    update(map) {
        this.debugLayer.text = `${this.amount}`;
        if (this.ticks <= 0) {
            this.tick(map);
            this.ticks = this.tickRate;
        }
        this.ticks--;
    }

    serialize() {
        return {
            _type: this.constructor.name,
            position: this.position,
            inputs: this.inputs,
            outputs: this.outputs,
            capacity: this.capacity,
            inventory: this.inventory.map(p => p.serialize()),
            ticks: this.ticks
        };
    }

    static deserialize(game, data) {
        let unit = null;
        switch (data._type) {
            case 'Resource': unit = Resource.deserialize(game, data); break;
            case 'Miner': unit = Miner.deserialize(game, data); break;
            case 'Pipe': unit = Pipe.deserialize(game, data); break;
            case 'Storage': unit = Storage.deserialize(game, data); break;
            case 'Factory': unit = Factory.deserialize(game, data); break;
            case 'Refiner': unit = Refiner.deserialize(game, data); break;
            case 'Track': unit = Track.deserialize(game, data); break;
            case 'Train': unit = Train.deserialize(game, data); break;
            case 'Consumer': unit = Consumer.deserialize(game, data); break;
            case 'CheatBox': unit = CheatBox.deserialize(game, data); break;
            case 'Switch': unit = Switch.deserialize(game, data); break;
            case 'Scope': unit = Scope.deserialize(game, data); break;
            default: break;
        }
        if (unit) {
            unit.ticks = data.ticks || 0;
            for (let p of data.inventory.map(d => Product.deserialize(game, d, unit))) {
                unit.give(p);
            }
            return unit;
        }
        return null;
    }
}
