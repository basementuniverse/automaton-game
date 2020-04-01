class Pipe extends Unit {
    icons = {
        t_r: 9492,
        t_l: 9496,
        t_b: 9474,
        r_t: 9492,
        r_l: 9472,
        r_b: 9484,
        l_r: 9472,
        l_b: 9488,
        l_t: 9496,
        b_r: 9484,
        b_l: 9488,
        b_t: 9474,
    };
    layer2 = null;
    scale = vec(1.6, 1);
    
    constructor(game, position, input, output) {
        super(game, position, 2);

        this.inputs = [input];
        this.outputs = [output];
        this.productCapacity = 1;
        this.tickRate = utility.ticks(config.times.itemThroughPipe);

        const layer = this.activeTile.addLayer();
        layer.foreground = '#bbb';
        layer.centered = true;
        layer.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer.scale = this.scale;

        const layer2 = this.activeTile.addLayer();
        layer2.foreground = 'white';
        layer2.centered = true;
        layer2.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer2.scale = this.scale;
        layer2.opacity = 0;
        this.layer2 = layer2;

        if ((input == 't' && output == 'b') || (input == 'b' && output == 't')) {
            layer.offset = layer2.offset = vec(0.075, 0);
        }

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    tick(map) {
        if (this.productAmount < this.productCapacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.productAmount > 0 && this.productAmount < this.productCapacity) {
                    this.giveProduct(unit.takeProduct());
                }
            }
        }
        if (this.layer2.animations.length <= 1) {
            let opacity = 0;
            let colour = [1, 1, 1];
            const minOpacity = 0.1;
            const maxLevel = 4;
            const animationTime = config.times.itemThroughPipe;
            if (this.productAmount > 0) {
                colour = this.productInventory[0].colour;
                opacity = (Math.min(this.productInventory[0].level, maxLevel) * (1 - minOpacity) / maxLevel) + minOpacity;
            }
            this.layer2.animateForeground(utility.colourString(colour), { time: animationTime });
            this.layer2.animateOpacity(opacity, { time: animationTime });
        }
    }

    static deserialize(game, data) {
        return new Pipe(game, data.position, data.inputs[0], data.outputs[0]);
    }
}
