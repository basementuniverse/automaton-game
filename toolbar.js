class Toolbar {
    game = null;
    tool = 'select';
    buttons = [
        {
            icon: config.icons.new,
            label: 'Clear',
            click: game => {
                game.clear();
            }
        },
        {
            icon: config.icons.map,
            label: 'New map',
            click: game => {
                game.terrain.generate();
            }
        },
        {
            icon: config.icons.save,
            label: 'Save to local storage',
            shortcut: 'KeyS',
            click: game => {
                window.localStorage.setItem(window.prompt('name'), game.save());
            }
        },
        {
            icon: config.icons.load,
            label: 'Load from local storage',
            shortcut: 'KeyL',
            click: game => {
                let data = null;
                if ((data = window.localStorage.getItem(window.prompt('name'))) !== null) {
                    game.load(data);
                }
            }
        },
        {
            icon: config.icons.download,
            label: 'Save as JSON',
            click: game => {
                const data = 'data:text/json;charset=utf-8,' + escape(game.save());
                const anchor = document.querySelector('a#download');
                anchor.setAttribute('href', data);
                anchor.setAttribute('download', `${window.prompt('name')}.json`);
                anchor.click();
            }
        },
        {
            icon: config.icons.upload,
            label: 'Load from JSON',
            click: game => {
                const input = document.querySelector('input#upload');
                input.addEventListener('change', e => {
                    if (e.target.files && e.target.files.length) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (function(f) {
                            return function(e) {
                                const data = e.target.result;
                                if (data) {
                                    game.load(data);
                                }
                            };
                        })(file);
                        reader.readAsText(file);
                    }
                }, false);
                input.click();
            }
        },
        {
            icon: config.icons.select,
            label: 'Select',
            tool: 'select',
            shortcut: 'KeyA',
            click: game => {
                this.tool = 'select';
            }
        },
        {
            icon: config.icons.delete,
            label: 'Delete',
            tool: 'delete',
            shortcut: 'KeyD',
            click: game => {
                this.tool = 'delete';
            }
        },
        {
            icon: config.icons.play,
            label: 'Play',
            shortcut: 'Space',
            click: game => {
                game.pause();
            }
        },
        {
            icon: String.fromCharCode(8226),
            label: 'Resource',
            tool: 'resource',
            shortcut: 'Digit1',
            click: game => {
                this.tool = 'resource';
            }
        },
        {
            icon: config.icons.extractor,
            label: 'Extractor',
            tool: 'extractor',
            shortcut: 'Digit2',
            click: game => {
                this.tool = 'extractor';
            }
        },
        {
            icon: String.fromCharCode(9474),
            label: 'Pipe',
            tool: 'pipe',
            shortcut: 'Digit3',
            click: game => {
                this.tool = 'pipe';
            }
        },
        {
            icon: config.icons.storage,
            label: 'Storage',
            tool: 'storage',
            shortcut: 'Digit4',
            click: game => {
                this.tool = 'storage';
            }
        },
        {
            icon: String.fromCharCode(8864),
            label: 'Factory',
            tool: 'factory',
            shortcut: 'Digit5',
            click: game => {
                this.tool = 'factory';
            }
        },
        {
            icon: String.fromCharCode(8863),
            label: 'Refiner',
            tool: 'refiner',
            shortcut: 'Digit6',
            click: game => {
                this.tool = 'refiner';
            }
        },
        {
            icon: String.fromCharCode(9550),
            label: 'Road',
            tool: 'track',
            shortcut: 'Digit7',
            click: game => {
                this.tool = 'track';
            }
        },
        {
            icon: config.icons.train,
            label: 'Truck',
            tool: 'train',
            shortcut: 'Digit8',
            click: game => {
                this.tool = 'train';
            }
        },
        {
            icon: config.icons.happy1,
            label: 'Consumer',
            tool: 'consumer',
            shortcut: 'Digit9',
            click: game => {
                this.tool = 'consumer';
            }
        },
        {
            icon: String.fromCharCode(8865),
            label: 'Switch',
            tool: 'switch',
            shortcut: 'Digit0',
            click: game => {
                this.tool = 'switch';
            }
        },
        {
            icon: config.icons.scope,
            label: 'Scope',
            tool: 'scope',
            click: game => {
                this.tool = 'scope';
            }
        },
        {
            icon: String.fromCharCode(9475),
            label: 'Path',
            tool: 'path',
            click: game => {
                this.tool = 'path';
            }
        },
        {
            icon: config.icons.city,
            label: 'City',
            tool: 'city',
            click: game => {
                this.tool = 'city';
            }
        },
        {
            icon: config.icons.power2,
            label: 'Power station',
            tool: 'powerstation',
            click: game => {
                this.tool = 'powerstation';
            }
        },
        {
            icon: config.icons.star,
            label: 'Cheatbox',
            tool: 'cheatbox',
            click: game => {
                this.tool = 'cheatbox';
            }
        }
    ];
    iconSize = 30;
    toolbarHeight = 50;
    buttonMargin = 3;
    buttonWidth = 50;
    toolbarHovered = false;
    hovered = null;

    constructor(game) {
        this.game = game;
    }

    update(input, width, height) {
        this.toolbarHovered = input.position.y > (height - this.toolbarHeight);
        this.hovered = (
            this.toolbarHovered &&
            input.position.x < (this.buttons.length * this.buttonWidth)
        ) ? Math.floor(input.position.x / this.buttonWidth) : null;
        if (this.hovered !== null && input.tapped) {
            this.buttons[this.hovered].click.call(this, this.game);
        }
        this.buttons.forEach(b => {
            if (b.shortcut && input.keyPressed(b.shortcut)) {
                b.click.call(this, this.game);
            }
        });
        const i = this.buttons.findIndex(b => (b.label == 'Play' || b.label == 'Pause'));
        this.buttons[i].label = this.game.paused ? 'Pause' : 'Play';
        this.buttons[i].icon = this.game.paused ? config.icons.pause : config.icons.play;
        Debug.show(
            'tool',
            this.hovered !== null ? this.buttonLabel(this.buttons[this.hovered]) : '',
            {
                position: input.position,
                backgroundColour: 'black',
                showLabel: false,
                hide: this.hovered === null
            }
        );
    }

    buttonLabel(b) {
        return b.label + (b.shortcut ? ` (${b.shortcut})` : '');
    }

    draw(context, width, height) {
        context.save();
        context.translate(0, height - this.toolbarHeight);
        context.fillStyle = 'rgba(100, 150, 255, 0.1)';
        context.fillRect(0, 0, width, this.toolbarHeight);
        this.buttons.forEach((b, i) => {
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            const h = (this.hovered === i || (b.tool && this.tool == b.tool));
            const m = this.buttonMargin, m2 = 2 * m;
            context[h ? 'fillStyle' : 'strokeStyle'] = 'rgba(255, 255, 255, 0.3)';
            context[h ? 'fillRect' : 'strokeRect'](m, m, this.buttonWidth - m2, this.buttonWidth - m2);
            context.save();
            context.translate(this.buttonWidth / 2, this.toolbarHeight / 2);
            context.fillStyle = 'white';
            context.font = `${this.iconSize}px automaton`;
            context.fillText(b.icon, 0, 0);
            context.restore();
            context.translate(this.buttonWidth, 0);
        });
        context.restore();
    }
}
