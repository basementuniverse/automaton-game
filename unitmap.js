class UnitMap {
    game = null;
    map = {};

    constructor(game) {
        this.game = game;
    }

    clear() {
        this.map = {};
    }

    update(units) {
        this.map = {};
        for (let unit of units) {
            let h = vec.str(unit.position);
            if (!this.map[h]) {
                this.map[h] = [];
            }
            this.map[h].push(unit);

            // Special handling for trains
            if (unit instanceof Train && unit.moving) {
                h = vec.str(unit.targetPosition);
                if (!this.map[h]) {
                    this.map[h] = [];
                }
                this.map[h].push(unit);
            }
        }
    }

    getUnits(p) {
        const h = vec.str(p);
        if (!this.map[h]) {
            return [];
        }
        return this.map[h];
    }

    hasUnits(p) {
        const h = vec.str(p);
        if (!this.map[h]) {
            return false;
        }
        return this.map[h].length > 0;
    }

    canPlace(p, unit) {
        const terrain = config.terrain[this.game.terrain.get(p.x, p.y)];
        if (terrain.allowedUnits !== null && terrain.allowedUnits.indexOf(unit.constructor.name) === -1) {
            return false;
        }
        if (unit instanceof Pipe || unit instanceof Path) {
            const units = this.getUnits(p);
            return units.every(u => (
                (u instanceof Pipe || u instanceof Path) &&
                u.inputs[0] !== unit.inputs[0] &&
                u.inputs[0] !== unit.outputs[0] &&
                u.outputs[0] !== unit.inputs[0] &&
                u.outputs[0] !== unit.outputs[0]
            ));
        }
        return this.getUnits(p).every(unit.exclusivity);
    }
}
