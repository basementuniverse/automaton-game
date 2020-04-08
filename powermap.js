class PowerMap {
    game = null;
    generationRate = 2;
    ticks = 0;
    map = {
        state: [],
        r: [], g: [], b: []
    };
    layer = null;
    cornerCoefficient = 0.5;
    unitCoefficient = 0.2;
    terrainCoefficient = 0.6;
    attenuationAmount = 3.8;
    colour = c => c > 0 ? 255 : 0;

    constructor(game) {
        this.game = game;
        this.layer = this.game.tily.activeBuffer.addLayer();
        this.layer.opacity = 0.5;
    }

    neighbours(x, y) {
        const result = [];
        for (let xx = x - 1; xx <= x + 1; xx++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
                if (xx == x && yy == y) { continue; }
                result.push(this.get(xx, yy));
            }
        }
        return result;
    }

    get(x, y) {
        const i = utility.index(x, y, this.game.width);
        if (x < 0 || x >= this.game.width || y < 0 || y >= this.game.height) {
            return { x, y, state: '', r: 0, g: 0, b: 0 };
        }
        return {
            x, y,
            state: this.map.state[i] || '',
            r: this.map.r[i] || 0,
            g: this.map.g[i] || 0,
            b: this.map.b[i] || 0
        };
    }

    set(x, y, state, r, g, b) {
        const i = utility.index(x, y, this.game.width);
        this.map.state[i] = state;
        this.map.r[i] = r;
        this.map.g[i] = g;
        this.map.b[i] = b;
    }

    getPowerState(x, y) {
        const p = this.get(x, y);
        return {
            r: +(p.r > 0),
            g: +(p.g > 0),
            b: +(p.b > 0)
        };
    }

    update() {
        if (this.ticks > this.generationRate) {
            this.ticks = 0;
            this.generation();
        }
        this.ticks++;
    }

    generation() {
        const map = { state: [], r: [], g: [], b: [] };
        const ns = this.attenuationAmount; // attenuation amount per tile when no unit here, single neighbour close in value
        const us = ns * this.unitCoefficient; // unit here, single neighbour close in value
        const nm = ns * this.cornerCoefficient; // no unit here, multiple neighbours close in value
        const um = us * this.cornerCoefficient; // unit here, multiple neighbours close in value
        for (let x = 0; x < this.game.width; x++) {
            for (let y = 0; y < this.game.height; y++) {
                let s = '', r = 0, g = 0, b = 0;
                const i = utility.index(x, y, this.game.width);
                const t = this.get(x, y);
                const terrain = this.game.terrain.get(x, y);
                const neighbours = this.neighbours(x, y);
                if (t.state == '' && neighbours.some(n => n.state == 'h')) {
                    s = 'h';
                }
                if (t.state == 'h') {
                    s = 't';
                }
                if (t.state == 't') {
                    s = '';
                }
                const mr = utility.maxNeighbour(neighbours, 'r');
                const mg = utility.maxNeighbour(neighbours, 'g');
                const mb = utility.maxNeighbour(neighbours, 'b');
                const u = this.game.unitMap.hasUnits(vec(x, y));
                r = mr.r;
                g = mg.g;
                b = mb.b;
                if (!u && this.game.terrain.get(mr.x, mr.y) !== terrain) {
                    r *= this.terrainCoefficient;
                }
                if (!u && this.game.terrain.get(mg.x, mg.y) !== terrain) {
                    g *= this.terrainCoefficient;
                }
                if (!u && this.game.terrain.get(mb.x, mb.y) !== terrain) {
                    b *= this.terrainCoefficient;
                }
                if (neighbours.filter(n => Math.floor(n.r) == Math.floor(r)).length > 1) { // corner
                    r -= u ? um : nm;
                } else { // edge
                    r -= u ? us : ns;
                }
                if (neighbours.filter(n => Math.floor(n.g) == Math.floor(g)).length > 1) {
                    g -= u ? um : nm;
                } else {
                    g -= u ? us : ns;
                }
                if (neighbours.filter(n => Math.floor(n.b) == Math.floor(b)).length > 1) {
                    b -= u ? um : nm;
                } else {
                    b -= u ? us : ns;
                }
                if (r + g + b <= 0) {
                    s = '';
                }
                r = Math.max(0, r);
                g = Math.max(0, g);
                b = Math.max(0, b);
                map.state[i] = s;
                map.r[i] = r;
                map.g[i] = g;
                map.b[i] = b;
                if (r > 0 || g > 0 || b > 0) {
                    this.layer.setTile(
                        x, y, String.fromCharCode(11034),
                        `rgb(${this.colour(r)}, ${this.colour(g)}, ${this.colour(b)})`, null
                    );
                } else {
                    this.layer.setTile(x, y, ' ', null, null);
                }
            }
        }
        this.map = map;
    }
}
