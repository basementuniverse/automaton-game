class Terrain {
    game = null;
    layer = null;
    terrainMap = {};

    constructor(game) {
        this.game = game;
        this.layer = this.game.buffer.addLayer();
        this.fill();
    }

    fill() {
        this.clear();
        const t = config.terrain[0];
        this.layer.foreground = t.foreground;
        this.layer.background = t.background;
        this.layer.fill(t.icon);
    }

    generate(seed) {
        if (!seed) {
            seed = Math.randomIntBetween(1, 65536);
        }
        this.game.clear();
        config.terrain.forEach((t, i) => this.generateTerrainType(seed, t, i));
        this.generateResources();
    }
    
    clear() {
        this.terrainMap = {};
        this.layer.clear();
    }

    load(data) {
        this.clear();
        for (let i = 0; i < data.length; i++) {
            const p = utility.position(i, this.game.buffer.size.width);
            const t = config.terrain[data[i]];
            this.terrainMap[utility.hash(p.x, p.y)] = data[i];
            this.layer.setTile(p.x, p.y, t.icon, t.foreground, t.background);
        }
    }

    generateTerrainType(seed, type, index) {
        if (type.hide) { return; }
        noise.seed(seed + type.seed);
        for (let x = 0; x < this.game.buffer.size.width; x++) {
            for (let y = 0; y < this.game.buffer.size.height; y++) {
                const n = (noise.perlin2(x * type.scale, y * type.scale) + 1) * 0.5;
                if (n >= type.min && n <= type.max) {
                    this.terrainMap[utility.hash(x, y)] = index;
                    this.layer.setTile(x, y, type.icon, type.foreground, type.background);
                }
            }
        }
    }

    generateResources() {
        for (let x = 0; x < this.game.buffer.size.width; x++) {
            for (let y = 0; y < this.game.buffer.size.height; y++) {
                const t = config.terrain[this.terrainMap[utility.hash(x, y)]];
                if (Math.random() < t.resourceDensity) {
                    this.game.addUnit(new Resource(
                        this.game,
                        vec(x, y),
                        t.resourceColours[Math.randomIntBetween(0, t.resourceColours.length - 1)]
                    ));
                }
            }
        }
    }

    get(x, y) {
        return this.terrainMap[utility.hash(x, y)] || 0;
    }
    
    serialize() {
        const terrainMap = [];
        for (let y = 0; y < this.game.buffer.size.height; y++) {
            for (let x = 0; x < this.game.buffer.size.width; x++) {
                terrainMap.push(this.get(x, y));
            }
        }
        return terrainMap;
    }
}
