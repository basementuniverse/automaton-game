class LineTool {
    game = null;
    inputMode = true;
    inputCursor = null;
    outputCursor = null;
    inputDirection = 'l';
    outputDirection = 'r';
    directions = {
        t: Math.PI / 2,
        b: -Math.PI / 2,
        l: 0,
        r: Math.PI
    };
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
    inverses = {
        t: 'b',
        b: 't',
        l: 'r',
        r: 'l'
    };
    offsets = {
        t: vec(0, -1),
        b: vec(0, 1),
        l: vec(-1, 0),
        r: vec(1, 0)
    };
    callback = null;

    constructor(game, callback) {
        this.game = game;
        this.callback = callback;
        
        // Prepare input and output markers
        this.inputCursor = game.tily.activeBuffer.addActiveTile(new Tily.ActiveTile(0, 0, 10));
        const inputLayer = this.inputCursor.addLayer();
        inputLayer.foreground = 'yellow';
        inputLayer.text = String.fromCharCode(8227);
        inputLayer.centered = true;
        inputLayer.offset = vec(-0.3, 0.1);
        
        this.outputCursor = game.tily.activeBuffer.addActiveTile(new Tily.ActiveTile(0, 0, 10));
        this.outputCursor.opacity = 0;
        const outputLayer = this.outputCursor.addLayer();
        outputLayer.foreground = 'yellow';
        outputLayer.text = '';
        outputLayer.centered = true;
        outputLayer.scale = vec(1.6, 1);
    }

    setInput(d) {
        if (d !== this.inputDirection) {
            this.inputCursor.animateRotation(this.directions[d], { time: 0.1 });
            this.inputDirection = d;
        }
    }

    setOutput(d) {
        if (d === this.inputDirection) {
            d = this.inverses[d];
        }
        this.outputCursor.layers[0].text = String.fromCharCode(
            this.icons[`${this.inputDirection}_${this.outputDirection}`]
        );
        this.outputDirection = d;
    }

    dispose() {
        this.game.tily.activeBuffer.removeActiveTile(this.inputCursor);
        this.game.tily.activeBuffer.removeActiveTile(this.outputCursor);
    }

    tapped(position, tilePosition) {
        this.inputMode = !this.inputMode;
        if (!this.inputMode) {  // just switched to output mode
            this.inputCursor.position = tilePosition;
            this.outputCursor.position = tilePosition;
        } else {
            if (vec.eq(tilePosition, this.inputCursor.position)) { // click in same tile
                this.callback(this.inputCursor.position, this.inputDirection, this.outputDirection);
            } else { // click in another tile
                const t = Object.keys(this.offsets)
                .map(k => ({ offset: vec.add(this.offsets[k], this.inputCursor.position), direction: k }))
                .find(o => (    // check if the clicked tile is adjacent
                    vec.eq(tilePosition, o.offset) &&
                    o.direction !== this.inputDirection // prevent lines going back on themselves
                ));
                if (t !== undefined) {
                    this.callback(this.inputCursor.position, this.inputDirection, t.direction);
                    this.inputDirection = this.inverses[t.direction];
                    this.inputMode = true;
                    this.tapped(position, tilePosition);
                }
            }
        }
        this.inputCursor.animateOpacity(this.inputMode ? 1 : 0, { time: 0.1 });
        this.outputCursor.animateOpacity(this.inputMode ? 0 : 1, { time: 0.1 });
    }

    update(position, tilePosition) {
        if (this.inputMode) {
            this.inputCursor.position = tilePosition;
        }

        const buffer = this.game.tily.activeBuffer;
        const t1 = vec.sub(
            vec.add(buffer.offset, vec(0.5)),
            vec.mul(vec(buffer.viewSize.width, buffer.viewSize.height), 0.5)
        );
        const t2 = vec.add(t1, vec.mul(position, 1 / buffer.tileSize));
        const p = vec.sub(vec.map(t2, v => Math.frac(v)), vec(0.5));
        const d = Math.abs(p.x) > Math.abs(p.y) ? (p.x >= 0 ? 'r' : 'l') : (p.y >= 0 ? 'b' : 't');
        if (this.inputMode) {
            this.setInput(d);
        } else if (vec.eq(this.inputCursor.position, tilePosition)) {
            this.setOutput(d);
        }
    }
}
