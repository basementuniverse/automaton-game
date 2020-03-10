// Little 2d vector library
const vec = (x, y) => (!x && !y ?
    { x: 0, y: 0 } : (typeof x == 'object' ?
        { x: x.x || 0, y: x.y || 0 } : (y === null || y === undefined ?
            { x: x, y: x } : { x: x, y: y })
    )
);
vec.components = a => [a.x, a.y];
vec.ux = () => vec(1, 0);
vec.uy = () => vec(0, 1);
vec.add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
vec.mul = (a, b) => ({ x: a.x * b,   y: a.y * b });
vec.sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
vec.len = a => Math.sqrt(a.x * a.x + a.y * a.y);
vec.manhattan = a => Math.abs(a.x) + Math.abs(a.y);
vec.nor = a => {
    let len = vec.len(a);
    return len ? { x: a.x / len, y: a.y / len } : vec();
};
vec.dot = (a, b) => a.x * b.x + a.y * b.y;
vec.rot = (a, r) => {
    let s = Math.sin(r),
        c = Math.cos(r);
    return { x: c * a.x - s * a.y, y: s * a.x + c * a.y };
}
vec.eq = (a, b) => a.x == b.x && a.y == b.y;
vec.rad = a => Math.atan2(a.y, a.x);
vec.cpy = a => vec(a);
vec.map = (a, f) => ({ x: f(a.x), y: f(a.y) });
vec.str = (a, s = ', ') => `${a.x}${s}${a.y}`;

// Little matrix library
const mat = (m = 4, n = 4, entries = []) => ({
    m, n,
    entries: entries.concat(Array(m * n).fill(0)).slice(0, m * n)
});
mat.identity = n => Array(n * n).fill(0).map((v, i) => +(Math.floor(i / n) == i % n));
mat.get = (a, i, j) => a.entries[(j - 1) + (i - 1) * a.n];
mat.set = (a, i, j, v) => { a.entries[(j - 1) + (i - 1) * a.n] = v; };
mat.row = (a, m) => {
    const s = (m - 1) * a.n;
    return a.entries.slice(s, s + a.n);
};
mat.col = (a, n) => Array.times(i => mat.get(a, (i + 1), n), a.m);
mat.add = (a, b) => a.m == b.m && a.n == b.n && mat.map(a, (v, i) => v + b.entries[i]);
mat.sub = (a, b) => a.m == b.m && a.n == b.n && mat.map(a, (v, i) => v - b.entries[i]);
mat.mul = (a, b) => {
    if (a.n !== b.m) { return false; }
    const result = mat(a.m, b.n);
    for (let i = 1; i <= a.m; i++) {
        for (let j = 1; j <= b.n; j++) {
            mat.set(result, i, j, Math.dot(mat.row(a, i), mat.col(b, j)));
        }
    }
    return result;
};
mat.scale = (a, b) => mat.map(a, v => v * b);
mat.trans = a => mat(a.n, a.m, Array.times(i => mat.col(a, (i + 1)), a.n).flat());
mat.minor = (a, i, j) => {
    if (a.m !== a.n) { return false; }
    const entries = [];
    for (let ii = 1; ii <= a.m; ii++) {
        if (ii == i) { continue; }
        for (let jj = 1; jj <= a.n; jj++) {
            if (jj == j) { continue; }
            entries.push(mat.get(a, ii, jj));
        }
    }
    return mat(a.m - 1, a.n - 1, entries);
};
mat.det = a => {
    if (a.m !== a.n) { return false; }
    if (a.m == 1) {
        return a.entries[0];
    }
    if (a.m == 2) {
        return a.entries[0] * a.entries[3] - a.entries[1] * a.entries[2];
    }
    let total = 0, sign = 1;
    for (let j = 1; j <= a.n; j++) {
        total += sign * a.entries[j - 1] * mat.det(mat.minor(a, 1, j));
        sign *= -1;
    }
    return total;
};
mat.nor = a => {
    if (a.m !== a.n) { return false; }
    const d = mat.det(a);
    return mat.map(a, i => i * d);
};
mat.adj = a => {
    const minors = mat(a.m, a.n);
    for (let i = 1; i <= a.m; i++) {
        for (let j = 1; j <= a.n; j++) {
            mat.set(minors, i, j, mat.det(mat.minor(a, i, j)));
        }
    }
    const cofactors = mat.map(minors, (v, i) => v * (i % 2 ? -1 : 1));
    return mat.trans(cofactors);
};
mat.inv = a => {
    if (a.m !== a.n) { return false; }
    const d = mat.det(a);
    if (d == 0) { return false; }
    return mat.scale(mat.adj(a), 1 / d);
};
mat.eq = (a, b) => a.m === b.m && a.n === b.n && mat.str(a) === mat.str(b);
mat.cpy = a => mat(a.m, a.n, [...a.entries]);
mat.map = (a, f) => mat(a.m, a.n, a.entries.map(f));
mat.str = (a, s = ' ') => a.entries.chunk(a.n).map(r => r.join(s)).join('');

// Useful math functions
Math.floatEquals = (a, b, p = Number.EPSILON) => Math.abs(a - b) < p;
Math.clamp = (a, min = 0, max = 1) => a < min ? min : (a > max ? max : a);
Math.frac = a => a >= 0 ? a - Math.floor(a) : a - Math.ceil(a);
Math.lerp = (a, b, i) => a + (b - a) * i;
Math.unlerp = (a, b, i) => (i - a) / (b - a);
Math.blerp = (c00, c10, c01, c11, ix, iy) => Math.lerp(Math.lerp(c00, c10, ix), Math.lerp(c01, c11, ix), iy);
Math.remap = (i, a1, a2, b1, b2) => b1 + (i - a1) * (b2 - b1) / (a2 - a1);
Math.smoothstep = (a, b, i) => Math.lerp(a, b, 3 * Math.pow(i, 2) - 2 * Math.pow(i, 3));
Math.radians = degrees => (Math.PI / 180) * degrees;
Math.degrees = radians => (180 / Math.PI) * radians;
Math.randomBetween = (min, max) => Math.random() * (max - min) + min;                       // Exclusive max
Math.randomIntBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;    // Inclusive max
Math.cltRandom = (mu = 0.5, sigma = 0.5, samples = 2) => {
    let total = 0;
    for (let i = samples; i--;) {
        total += Math.random();
    }
    return mu + (total - samples / 2) / (samples / 2) * sigma;
};
Math.cltRandomInt = (min, max) => min + Math.cltRandom(0.5, 0.5, 2) * (max - min);
Math.weightedRandom = w => {
    let total = w.reduce((a, i) => a + i, 0), n = 0;
    const r = Math.random() * total;
    while (total > r) {
        total -= w[n++];
    }
    return n - 1;
};
Math.lerpArray = (a, i) => {
    const s = i * (a.length - 1);
    const p = Math.clamp(Math.trunc(s), 0, a.length - 1);
    return Math.lerp(a[p] || 0, a[p + 1] || 0, Math.frac(s));
};
Math.dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);

// Useful array functions
Array.times = (f, n) => Array(n).fill().map((_, i) => f(i));
Array.range = n => Array.times(i => i, n);
Object.defineProperty(Array.prototype, 'at', { value: function(i) {
    const l = this.length;
    return this[i < 0 ? l - (Math.abs(i + 1) % l) - 1 : i % l];
} });
Object.defineProperty(Array.prototype, 'chunk', { value: function(n) {
    return Array.times(i => this.slice(i * n, i * n + n), Math.ceil(this.length / n));
} });
Object.defineProperty(Array.prototype, 'shuffle', { value: function() {
    return this.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
} });
