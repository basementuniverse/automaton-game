class Pipe extends Unit {
    icons = {
        t_r: 9495,
        t_l: 9499,
        t_b: 9475,
        r_t: 9495,
        r_l: 9473,
        r_b: 9487,
        l_r: 9473,
        l_b: 9491,
        l_t: 9499,
        b_r: 9487,
        b_l: 9491,
        b_t: 9475,
    };
    layer = null;
    layer2 = null;
    
    constructor(game, position, input, output) {
        super(game, position, 2);

        this.inputs = [input];
        this.outputs = [output];
        this.capacity = 1;
        this.tickRate = 8;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = '#bbb';
        layer.centered = true;
        layer.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer.scale = vec(1.6, 1);
        this.layer = layer;

        const layer2 = this.activeTile.addLayer(null);
        layer2.foreground = 'white';
        layer2.centered = true;
        layer2.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer2.scale = vec(1.6, 1);
        layer2.opacity = 0;
        this.layer2 = layer2;

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    tick(map) {
        if (this.amount < this.capacity) {
            const inputUnits = this.getInputs(map);
            for (let unit of inputUnits) {
                if (unit.amount > 0 && this.amount < this.capacity) {
                    this.give(unit.take());
                }
            }
        }
        if (this.layer2.animations.length <= 1) {
            let opacity = 0;
            let colour = [1, 1, 1];
            const minOpacity = 0.1;
            const maxLevel = 4;
            const animationTime = 0.3;
            if (this.amount > 0) {
                colour = this.inventory[0].colour;
                opacity = (Math.min(this.inventory[0].level, maxLevel) * (1 - minOpacity) / maxLevel) + minOpacity;
            }
            this.layer2.animateForeground(utility.colourString(colour), { time: animationTime });
            this.layer2.animateOpacity(opacity, { time: animationTime });
        }
    }

    static deserialize(game, data) {
        return new Pipe(game, data.position, data.inputs[0], data.outputs[0]);
    }
}
