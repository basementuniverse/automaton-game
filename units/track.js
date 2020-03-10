class Track extends Unit {
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

    exclusivity = u => (u instanceof Train);
    
    constructor(game, position, input, output) {
        super(game, position, 2);

        this.inputs = [input];
        this.outputs = [output];
        this.capacity = 0;

        const layer = this.activeTile.addLayer(null, -1);
        layer.foreground = '#888';
        layer.centered = true;
        layer.text = String.fromCharCode(this.icons[`${input}_${output}`]);
        layer.scale = vec(1.6, 1);
        if ((input == 't' && output == 'b') || (input == 'b' && output == 't')) {
            layer.offset = vec(0.075, 0);
        }

        // Hide amount readout
        this.debugLayer.opacity = 0;
    }

    static deserialize(game, data) {
        return new Track(game, data.position, data.inputs[0], data.outputs[0]);
    }
}
