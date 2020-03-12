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
    powerMap = null;
    paused = false;
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
        this.powerMap = new PowerMap(this);

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

    save() {
        return JSON.stringify(this.units.map(u => u.serialize()));
    }

    load(json) {
        const data = JSON.parse(json);
        this.clear();
        data.forEach(d => this.addUnit(Unit.deserialize(this, d)));
    }

    update() {
        Debug.show('ticks', this.ticks++);
        Debug.show('paused', this.paused ? 'PAUSED' : '', { colour: 'red', showLabel: false });
        
        // Update toolbar
        const oldTool = this.toolbar.tool;
        this.toolbar.update(this.input, this.canvas.width, this.canvas.height);

        // Handle line tool activation & disposal when the mode changes
        if (this.toolbar.tool !== oldTool) {
            if (this.lineTool) {
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
            if (this.toolbar.tool === 'path') {
                this.lineTool = new LineTool(this, (p, i, o) => {
                    this.addUnit(new Path(this, p, i, o));
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
                case 'storage': unit = new Storage(this, this.input.tilePosition); break;
                case 'factory': unit = new Factory(this, this.input.tilePosition); break;
                case 'refiner': unit = new Refiner(this, this.input.tilePosition); break;
                case 'train': unit = new Train(this, this.input.tilePosition); break;
                case 'consumer': unit = new Consumer(this, this.input.tilePosition); break;
                case 'cheatbox': unit = new CheatBox(this, this.input.tilePosition); break;
                case 'switch': unit = new Switch(this, this.input.tilePosition); break;
                case 'scope': unit = new Scope(this, this.input.tilePosition); break;
                case 'city': unit = new City(this, this.input.tilePosition); break;
                case 'powerstation': unit = new PowerStation(this, this.input.tilePosition); break;
                case 'pipe':
                case 'track':
                case 'path':
                    if (this.lineTool) {
                        this.lineTool.tapped(this.input.position, this.input.tilePosition, this.input.bufferPosition);
                    }
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

            // Update power map
            this.powerMap.update();
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
