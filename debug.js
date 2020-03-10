class Debug {
    static instance;
    values;
    settings = {
        margin: 10,
        padding: 4,
        lineHeight: 12,
        font: '10pt Lucida Console, monospace',
        textColour: 'white',
        backgroundColour: 'rgba(0, 0, 0, 0.5)'
    };

    constructor() {
        this.values = [];
    }

    static initialise() {
        if (!Debug.instance) {
            Debug.instance = new Debug();
        }
    }

    static show(label, value, colour = null, showLabel = true) {
        Debug.instance.values[label] = {
            label: label,
            value: value,
            colour: colour,
            showLabel: showLabel
        };
    }
    
    static draw(context) {
        const debug = Debug.instance;

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        let y = debug.settings.margin;
        for (const i in debug.values) {
            if (!debug.values.hasOwnProperty(i)) {
                continue;
            }

            Debug.drawValue(context, debug.settings.margin, y, debug.values[i], debug.settings);
            y += (debug.settings.lineHeight + debug.settings.padding * 2);
        }

        context.restore();
    }

    static drawValue(context, x, y, value, settings) {
        context.save();
        context.font = settings.font;
        context.textBaseline = "top";

        const text = value.showLabel ? `${value.label}: ${value.value}` : `${value.value}`;
        const backgroundSize = {
            x: context.measureText(text).width + settings.padding * 2,
            y: settings.lineHeight + settings.padding * 2
        };
        context.fillStyle = settings.backgroundColour;
        context.fillRect(
            x - settings.padding,
            y - settings.padding,
            backgroundSize.x,
            backgroundSize.y
        );
        context.fillStyle = value.colour || settings.textColour;
        context.fillText(text, x, y);
        context.restore();
    }
}
