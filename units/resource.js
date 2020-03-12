class Resource extends Unit {
    hasResource = false;
    layer = null;
    growing = false;
    growTime = 1;
    colour = null;
    colours = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    constructor(game, position, colour = null, hasResource = false) {
        super(game, position);

        this.colour = colour || this.colours[Math.randomIntBetween(0, this.colours.length - 1)];
        this.hasResource = hasResource;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = utility.colourString(this.colour, this.hasResource ? 1 : 0.3);
        layer.centered = true;
        layer.offset = vec(0, 0.055);
        layer.text = String.fromCharCode(8226);
        this.layer = layer;
        
        this.tickRate = 30;

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    exclusivity = u => (u instanceof Miner);

    tick(map) {
        if (!this.hasResource && !this.growing) {
            this.growing = true;
            this.layer.animateForeground(utility.colourString(this.colour), { time: this.growTime }).then(() => {
                this.growing = false;
                this.hasResource = true;
            });
        }
    }

    takeProduct() {
        if (!this.hasResource) {
            return null;
        }
        this.hasResource = false;
        this.layer.animateForeground(utility.colourString(this.colour, 0.3), { time: 0.25 });
        return new Product(this.game, 0, this.colour);
    }

    serialize() {
        return {
            ...super.serialize(),
            hasResource: this.hasResource,
            colour: this.colour
        };
    }

    static deserialize(game, data) {
        const unit = new Resource(game, data.position, data.colour, data.hasResource);
        return unit;
    }
}
