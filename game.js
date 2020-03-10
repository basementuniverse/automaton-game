class Game {
    canvas = null;
    tily = null;
    input = null;
    loop = null;
    ticks = 0;
    buffer = null;
    units = [];
    unitMap = null;
    lineTool = null;
    paused = false;
    powerMap = {
        state: [],
        r: [],
        g: [],
        b: []
    };
    powerLayer = null;
    powerTicks = 0;
    powerRate = 2;
    width = 32;
    height = 32;
    toolbar = null;

    constructor(canvas) {
        Debug.initialise();

        this.toolbar = new Toolbar(this);

        // Set up canvas and tily for rendering
        this.canvas = canvas;
        this.tily = new Tily.Main(this.canvas, {
            afterDrawFunction: this.draw.bind(this),
            showFPS: config.debug
        });

        // Set up game world
        this.buffer = new Tily.Buffer(this.width, this.height, {
            clampCamera: true,
            initialScale: 24,
            minimumScale: 3,
            maximumScale: 200
        });
        this.tily.activateBuffer(this.buffer);

        // Setup input
        this.input = new Input(this);
        this.unitMap = new UnitMap();

        // Create power map layer
        this.powerLayer = this.buffer.addLayer();

        // Fill background grid
        const layer = this.buffer.addLayer();
        layer.foreground = 'white';
        layer.fill(String.fromCharCode(11034));
        layer.centered = true;
        layer.opacity = 0.1;        
    }

    addUnit(unit) {
        if (this.unitMap.canPlace(unit.position, unit)) {
            this.units.push(unit);
            this.tily.activeBuffer.addActiveTile(unit.activeTile);
            return true;
        }
        return false;
    }

    run() {
        if (this.loop === null) {
            this.loop = setInterval(this.update.bind(this), 1000 / config.tickRate);
        }
    }

    stop() {
        clearInterval(this.loop);
        this.loop = null;
    }

    clear() {
        this.units.forEach(u => u.dispose());
        this.unitMap.clear();
    }

    powerMapNeighbours(x, y) {
        const result = [];
        for (let xx = x - 1; xx <= x + 1; xx++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
                if (xx == x && yy == y) { continue; }
                result.push(this.getPowerMap(xx, yy));
            }
        }
        return result;
    }

    getPowerMap(x, y) {
        const i = utility.index(x, y, this.width);
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { state: '', r: 0, g: 0, b: 0 };
        }
        return {
            state: this.powerMap.state[i] || '',
            r: this.powerMap.r[i] || 0,
            g: this.powerMap.g[i] || 0,
            b: this.powerMap.b[i] || 0
        };
    }

    setPowerMap(x, y, state, r, g, b) {
        const i = utility.index(x, y, this.width);
        this.powerMap.state[i] = state;
        this.powerMap.r[i] = r;
        this.powerMap.g[i] = g;
        this.powerMap.b[i] = b;
    }

    save() {
        return JSON.stringify(this.units.map(u => u.serialize()));
    }

    load(json) {
        const data = JSON.parse(json);
        this.clear();
        data.forEach(d => this.addUnit(Unit.deserialize(this, d)));
    }

    update() {
        this.ticks++;// Debug.show('ticks', this.ticks++);
        
        // Update toolbar
        const oldTool = this.toolbar.tool;
        this.toolbar.update(this.input, this.canvas.width, this.canvas.height);

        // Handle line tool activation & disposal when the mode changes
        if (this.toolbar.tool !== oldTool) {
            if (oldTool === 'pipe' || oldTool === 'track') {
                this.lineTool.dispose();
                this.lineTool = null;
            }
            if (this.toolbar.tool === 'pipe') {
                this.lineTool = new LineTool(this, (p, i, o) => {
                    this.addUnit(new Pipe(this, p, i, o));
                });
            }
            if (this.toolbar.tool === 'track') {
                this.lineTool = new LineTool(this, (p, i, o) => {
                    this.addUnit(new Track(this, p, i, o));
                });
            }
        }
        if (this.lineTool) {
            this.lineTool.update(this.input.position, this.input.tilePosition, this.input.bufferPosition);
        }

        // Handle user input
        if (!this.toolbar.toolbarHovered && this.input.tapped) {
            let unit = null;
            switch (this.toolbar.tool) {
                case 'select':
                    for (let u of this.unitMap.getUnits(this.input.tilePosition)) {
                        u.tapped();
                    }
                    break;
                case 'delete':
                    for (let u of this.unitMap.getUnits(this.input.tilePosition)) {
                        u.dispose();
                    }
                    break;
                case 'resource': unit = new Resource(this, this.input.tilePosition); break;
                case 'miner': unit = new Miner(this, this.input.tilePosition); break;
                case 'pipe':
                    if (this.lineTool) {
                        this.lineTool.tapped(this.input.position, this.input.tilePosition, this.input.bufferPosition);
                    }
                    break;
                case 'storage': unit = new Storage(this, this.input.tilePosition); break;
                case 'factory': unit = new Factory(this, this.input.tilePosition); break;
                case 'refiner': unit = new Refiner(this, this.input.tilePosition); break;
                case 'track':
                    if (this.lineTool) {
                        this.lineTool.tapped(this.input.position, this.input.tilePosition, this.input.bufferPosition);
                    }
                    break;
                case 'train': unit = new Train(this, this.input.tilePosition); break;
                case 'consumer': unit = new Consumer(this, this.input.tilePosition); break;
                case 'cheatbox': unit = new CheatBox(this, this.input.tilePosition); break;
                case 'switch': unit = new Switch(this, this.input.tilePosition); break;
                case 'scope': unit = new Scope(this, this.input.tilePosition); break;
                default: break;
            }
            if (unit) {
                this.addUnit(unit);
            }
        }

        // Update units
        this.units = this.units.filter(u => !u.disposed);
        this.unitMap.update(this.units);
        if (!this.paused) {
            for (let unit of this.units) {
                unit.update(this.unitMap);
            }
        }

        // Update power map
        if (!this.paused) {
            if (this.powerTicks > this.powerRate) {
                this.powerTicks = 0;
                const newPowerMap = { state: [], r: [], g: [], b: [] };
                const cornerCoefficient = 0.5;
                const unitCoefficient = 0.35;
                const ns = 2; // attenuation amount per tile when no unit here, single neighbour close in value
                const us = ns * unitCoefficient; // unit here, single neighbour close in value
                const nm = ns * cornerCoefficient; // no unit here, multiple neighbours close in value
                const um = us * cornerCoefficient; // unit here, multiple neighbours close in value
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        let s = '', r = 0, g = 0, b = 0;
                        const i = utility.index(x, y, this.width);
                        const t = this.getPowerMap(x, y);
                        const neighbours = this.powerMapNeighbours(x, y);
                        if (t.state == '' && neighbours.some(n => n.state == 'h')) {
                            s = 'h';
                        }
                        if (t.state == 'h') {
                            s = 't';
                        }
                        if (t.state == 't') {
                            s = '';
                        }
                        r = Math.max(0, ...neighbours.map(n => n.r));
                        g = Math.max(0, ...neighbours.map(n => n.g));
                        b = Math.max(0, ...neighbours.map(n => n.b));
                        const u = this.unitMap.hasUnits(vec(x, y));
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
                        newPowerMap.state[i] = s;
                        newPowerMap.r[i] = r;
                        newPowerMap.g[i] = g;
                        newPowerMap.b[i] = b;
                        this.powerLayer.setTile(
                            x, y, ' ', null,
                            `rgb(${Math.clamp(Math.floor(r * 16), 0, 255)}, ${Math.clamp(Math.floor(g * 16), 0, 255)}, ${Math.clamp(Math.floor(b * 16), 0, 255)})`
                        );
                    }
                }
                this.powerMap = newPowerMap;
            }
            this.powerTicks++;
        }

        // Update input
        this.input.update();
    }

    draw(canvas, context, width, height, elapsedTime) {
        this.toolbar.draw(context, width, height);
        if (config.debug) {
            Debug.draw(context);
        }
    }
}
