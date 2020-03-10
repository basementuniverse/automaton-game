class Product {
    game = null;
    level = 0;
    colour = [1, 0, 0];
    activeTile = null;
    icons = [
        9679,
        10122,
        10123,
        10124,
        10125,
        10126,
        10127,
        10128,
        10129,
        10130,
        10131,
        10026
    ];

    constructor(game, level, colour) {
        this.game = game;
        this.level = level;
        this.colour = colour;

        // this.activeTile = game.tily.activeBuffer.addActiveTile(new Tily.ActiveTile(0, 0, 4));
        // const layer = this.activeTile.addLayer(null, -1);
        // layer.foreground = utility.colourString(this.colour);
        // layer.centered = true;
        // layer.offset = vec(0, -0.05);
        // layer.scale = vec(0.3);
        // layer.text = String.fromCharCode(this.icons[Math.clamp(this.level, 0, 11)]);
        // layer.outline = '0.3 black';
    }

    dispose() {
        // this.game.tily.activeBuffer.removeActiveTile(this.activeTile);
    }

    combine(product) {
        let level = this.level == product.level ? (this.level + 1) : Math.max(this.level, product.level);
        let colour = [
            Math.clamp(this.colour[0] + product.colour[0]),
            Math.clamp(this.colour[1] + product.colour[1]),
            Math.clamp(this.colour[2] + product.colour[2])
        ];
        return new Product(this.game, level, colour);
    }

    refine(filterColour) {
        let level = Math.max(0, this.level - 1);
        let colour = [
            Math.clamp(this.colour[0] - filterColour[0]),
            Math.clamp(this.colour[1] - filterColour[1]),
            Math.clamp(this.colour[2] - filterColour[2])
        ];
        return new Product(this.game, level, colour);
    }

    serialize() {
        return {
            level: this.level,
            colour: this.colour
        };
    }

    static deserialize(game, data, container) {
        const product = new Product(game, data.level, data.colour);
        // product.activeTile.position = container.position;
        return product;
    }
}
