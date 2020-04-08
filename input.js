class Input {
    game = null;
    position = vec();
    tilePosition = vec();
    tapped = false;
    panStart = null;
    pinchStart = null;
    keyboard = {};
    previousKeyboard = {};
    zoomAmount = 4;
    cursor = null;

    constructor(game) {
        this.game = game;

        // Prepare cursor active tile
        this.cursor = game.tily.activeBuffer.addActiveTile(new Tily.ActiveTile(0, 0, 10000));
        const cursorLayer = this.cursor.addLayer();
        cursorLayer.foreground = 'white';
        cursorLayer.text = String.fromCharCode(11034);
        cursorLayer.opacity = 0.3;
        // cursorLayer.centered = true;

        // Set up hammer input event handlers
        const hammer = new Hammer.Manager(game.canvas, { recognizers: [
			[Hammer.Tap],
			[Hammer.Pan],
			[Hammer.Pinch]
        ] });
        hammer.on('tap', e => {
            this.tapped = true;
            this.updatePosition(e.center);
        });
        hammer.on('panstart', e => {
            if (!game.tily.activeBuffer) { return; }
            const p = vec.mul(e.center, window.devicePixelRatio);
            this.panStart = vec.add(game.tily.activeBuffer.offsetPixels, p);
        });
        hammer.on('panend', e => {
            this.panStart = null;
        });
        hammer.on('pan', e => {
            if (!game.tily.activeBuffer) { return; }
            const p = vec.mul(e.center, window.devicePixelRatio);
            const t = game.tily.activeBuffer.getPosition(p.x, p.y);
            game.tily.activeBuffer.moveOffset(
                this.panStart.x - p.x,
                this.panStart.y - p.y,
                { unit: 'px' }
            );
        });
        hammer.on('pinchstart', e => {
            if (!game.tily.activeBuffer) { return; }
            this.pinchStart = game.tily.activeBuffer.scale;
        });
        hammer.on('pinchend', e => {
            this.pinchStart = null;
        });
        hammer.on('pinch', e => {
            if (!game.tily.activeBuffer) { return; }
            tily.activeBuffer.zoom(this.pinchStart / e.scale);
        });
        window.addEventListener('mousemove', e => {
            this.updatePosition(vec(e.offsetX, e.offsetY));
        });
        window.addEventListener('keydown', e => {
            this.keyboard[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keyboard[e.code] = false;
        });
        window.addEventListener('wheel', e => {
            if (!game.tily.activeBuffer) { return; }
            game.tily.activeBuffer.zoom(
                game.tily.activeBuffer.scale + (e.deltaY > 0 ? 1 : -1) * this.zoomAmount,
                { time: 1 }
            );
        });
    }

    updatePosition(p) {
        this.position = vec(p);
        if (this.game.tily.activeBuffer) {
            this.tilePosition = this.game.tily.activeBuffer.getPosition(p.x, p.y);
        } else {
            this.tilePosition = vec();
        }
        this.cursor.position = this.tilePosition;
    }

    keyDown(key = null) {
        if (!key) {
            for (let k of this.keyboard) {
                if (k) {
                    return true;
                }
            }
            return false;
        }
        return !!this.keyboard[key];
    }

    keyPressed(key = null) {
        if (!key) {
            for (let [k, v] of Object.entries(this.keyboard)) {
                if (v && !this.previousKeyboard[k]) {
                    return true;
                }
            }
            return false;
        }
        return this.keyboard[key] && !this.previousKeyboard[key];
    }

    update() {
        this.tapped = false;
        this.previousKeyboard = Object.assign({}, this.keyboard);
    }
}
