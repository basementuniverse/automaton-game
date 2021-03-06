const utility = {
    index: (x, y, width) => x + y * width,
    position: (i, width) => vec(i % width, Math.floor(i / width)),
    colourString: (c, a = 1) => `rgb(${Math.floor(c[0] * 255 * a)}, ${Math.floor(c[1] * 255 * a)}, ${Math.floor(c[2] * 255 * a)})`,
    triangleWave(a, f, x) {
        let p = 0.5 / f;
        return (a / p) * (p - Math.abs(x % (2 * p) - p));
    },
    dotColour: (a, b) => a.r * b.r + a.g * b.g + a.b * b.b,
    ticks: t => Math.floor(t * config.updateRate),
    time: t => t / config.updateRate,
    maxNeighbour(n, c) {
        let m = -Infinity, j = -1;
        for (let i = 0; i < n.length; i++) {
            if (n[i][c] >= m) {
                m = n[i][c];
                j = i;
            }
        }
        return n[j];
    },
    hash: (x, y) => `${x}_${y}`
};
