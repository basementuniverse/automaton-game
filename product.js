class Product {
    game = null;
    level = 0;
    colour = [1, 0, 0];

    constructor(game, level, colour) {
        this.game = game;
        this.level = level;
        this.colour = colour;
    }

    dispose() {}

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
        return new Product(game, data.level, data.colour);
    }
}
