class Debug {
    static instance;
    values;
    settings = {
        order: 0,
        hide: false,
        position: null,
        colour: 'white',
        backgroundColour: 'rgba(0, 0, 0, 0.5)',
        font: '10pt Lucida Console, monospace',
        lineHeight: 12,
        showLabel: true,
        margin: 10,
        padding: 4
    };

    constructor() {
        this.values = {};
    }

    static initialise() {
        if (!Debug.instance) {
            Debug.instance = new Debug();
        }
    }

    static show(label, value, settings = {}) {
        Debug.instance.values[label] = {
            value: value,
            ...Debug.instance.settings,
            ...settings,
            order: settings.order || (Object.keys(Debug.instance.values).length + 1)
        };
    }
    
    static draw(context) {
        const debug = Debug.instance;

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const labels = Object.keys(debug.values).sort((a, b) => debug.values[a].order - debug.values[b].order);
        let row = 0, value, p;
        labels.forEach(label => {
            value = debug.values[label];
            p = value.position;
            if (value.hide) { return; }
            if (p === null) {
                row += (value.lineHeight + 2 * value.padding);
                p = vec(value.margin, row);
            }
            Debug.drawValue(context, label, value, p);
        });
        context.restore();
    }

    static drawValue(context, label, value, position) {
        context.save();
        context.font = value.font;
        context.textBaseline = "top";
        const text = value.showLabel ? `${label}: ${value.value}` : `${value.value}`;
        const backgroundSize = {
            x: context.measureText(text).width + value.padding * 2,
            y: value.lineHeight + value.padding * 2
        };
        context.fillStyle = value.backgroundColour;
        context.fillRect(
            position.x - value.padding,
            position.y - value.padding,
            backgroundSize.x,
            backgroundSize.y
        );
        context.fillStyle = value.colour;
        context.fillText(text, position.x, position.y);
        context.restore();
    }
}
