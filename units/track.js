class Track extends Unit {
    icons = {
        t_r: 9584,
        t_l: 9583,
        t_b: 9550,
        r_t: 9584,
        r_l: 9548,
        r_b: 9581,
        l_r: 9548,
        l_b: 9582,
        l_t: 9583,
        b_r: 9581,
        b_l: 9582,
        b_t: 9550,
    };

    exclusivity = u => (u instanceof Train);
    
    constructor(game, position, input, output) {
        super(game, position, 2);

        this.inputs = [input];
        this.outputs = [output];
        this.productCapacity = 0;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = '#888';
        layer.centered = true;
        layer.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer.scale = vec(1.6, 1);

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    static deserialize(game, data) {
        return new Track(game, data.position, data.inputs[0], data.outputs[0]);
    }
}
