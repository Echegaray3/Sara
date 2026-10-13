/* =========================================================
   Logo "SS" — El horno de Sara
   Dos eles S caligráficas (cacao, oro y rosa) con una espiga de trigo,
   un batidor y una hoja. Las cintas se dibujan con ancho variable.
   Uso: createLogo({ size: 40 }) devuelve un <svg> de 40 px de alto.
        createLogo({ size: 64, bg: "#fbf5ec" }) lo dibuja sobre un cuadrado redondeado.
   ========================================================= */
(function (root) {
  const W = 106, H = 70; // caja del logo

  // Cintas de una S, en una caja de ~46 x 66. Cada una: tramos Bézier cúbicos
  // [x0,y0, c1x,c1y, c2x,c2y, x1,y1] encadenados + ancho [t, ancho] (t de 0 a 1).
  const SWASH = {
    // Cinta clara: lágrima arriba a la derecha, vuelta por arriba y diagonal central
    light: {
      segs: [
        [44, 25, 47, 12, 42, 4, 31, 5],
        [31, 5, 22, 5, 13, 8, 12, 17],
        [12, 16, 10, 27, 24, 32, 36, 44],
      ],
      width: [[0, 0.2], [0.1, 7], [0.24, 6.2], [0.42, 2.4], [0.62, 6.5], [0.8, 7], [1, 0]],
    },
    // Cinta oscura: fina por fuera, gruesa en la curva de abajo y rematada en espiral
    dark: {
      segs: [
        [20, 2.5, 8, 3, 3, 12, 4, 22],
        [4, 22, 5, 34, 30, 36, 38, 48],
        [38, 48, 46, 58, 32, 66, 20, 64],
        [20, 64, 8, 62, 2, 52, 8, 48],
        [8, 48, 14, 43, 22, 48, 19, 54],
      ],
      width: [[0, 0.3], [0.1, 1.8], [0.2, 2.2], [0.35, 2.4], [0.5, 4.5], [0.6, 7], [0.7, 6], [0.8, 3.5], [0.9, 2], [1, 2.6]],
    },
    // Media luna interior
    accent: {
      segs: [[8, 57, 3, 49, 10, 43, 18, 45]],
      width: [[0, 0], [0.5, 2.6], [1, 0]],
    },
  };

  let uid = 0;

  function cubic(s, u) {
    const m = 1 - u;
    const a = m * m * m, b = 3 * m * m * u, c = 3 * m * u * u, d = u * u * u;
    const dx = 3 * m * m * (s[2] - s[0]) + 6 * m * u * (s[4] - s[2]) + 3 * u * u * (s[6] - s[4]);
    const dy = 3 * m * m * (s[3] - s[1]) + 6 * m * u * (s[5] - s[3]) + 3 * u * u * (s[7] - s[5]);
    return [a * s[0] + b * s[2] + c * s[4] + d * s[6], a * s[1] + b * s[3] + c * s[5] + d * s[7], dx, dy];
  }

  function widthAt(keys, t) {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, w0] = keys[i - 1], [t1, w1] = keys[i];
        const k = (t - t0) / (t1 - t0 || 1);
        const e = k * k * (3 - 2 * k); // suavizado
        return w0 + (w1 - w0) * e;
      }
    }
    return keys[keys.length - 1][1];
  }

  // Convierte una línea central con ancho variable en un contorno relleno
  function ribbon({ segs, width }, steps = 28) {
    const L = [], R = [];
    segs.forEach((s, i) => {
      for (let j = i ? 1 : 0; j <= steps; j++) {
        const u = j / steps;
        const [x, y, dx, dy] = cubic(s, u);
        const len = Math.hypot(dx, dy) || 1;
        const w = widthAt(width, (i + u) / segs.length) / 2;
        const nx = -dy / len, ny = dx / len;
        L.push([x + nx * w, y + ny * w]);
        R.push([x - nx * w, y - ny * w]);
      }
    });
    const pts = L.concat(R.reverse());
    return "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join("L") + "Z";
  }

  function createLogo({ size = 40, bg = null, title = "El horno de Sara" } = {}) {
    const NS = "http://www.w3.org/2000/svg";
    const el = (name, attrs, parent) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };
    const id = "logo" + uid++;
    const vbW = bg ? 100 : W, vbH = bg ? 100 : H;
    const svg = el("svg", {
      viewBox: `0 0 ${vbW} ${vbH}`, width: size * vbW / vbH, height: size, role: "img", "aria-label": title,
    });
    if (bg) el("rect", { width: 100, height: 100, rx: 24, fill: bg }, svg);

    const defs = el("defs", {}, svg);
    const grad = (name, from, to) => {
      const g = el("linearGradient", { id: `${id}-${name}`, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
      el("stop", { offset: 0, "stop-color": from }, g);
      el("stop", { offset: 1, "stop-color": to }, g);
    };
    grad("gold", "#f2d88e", "#b98a3c");
    grad("rose", "#efc7b6", "#bf8470");
    grad("cocoa", "#6e4128", "#46261a");

    const root = el("g", { transform: bg ? "translate(2.5 18.5) scale(.9) translate(6 0)" : "translate(6 0)" }, svg);

    const drawS = (tx, light) => {
      const g = el("g", { transform: `translate(${tx} 2)` }, root);
      el("path", { d: ribbon(SWASH.dark), fill: `url(#${id}-cocoa)` }, g);
      el("path", { d: ribbon(SWASH.light), fill: `url(#${id}-${light})` }, g);
      el("path", { d: ribbon(SWASH.accent), fill: "#e9b9a8" }, g);
      el("circle", { cx: 19, cy: 54, r: 1.9, fill: "#46261a" }, g);
      return g;
    };

    // S izquierda (oro) con espiga y hoja
    const left = drawS(7, "gold");
    const wheat = el("g", { transform: "translate(28 19) rotate(-38) scale(.85)" }, left);
    el("path", { d: "M0 20L0 -9", stroke: "#b98a3c", "stroke-width": 0.9, "stroke-linecap": "round", fill: "none" }, wheat);
    for (let i = 0; i < 5; i++) {
      [-1, 1].forEach((side) =>
        el("ellipse", { cx: side * 2.1, cy: -8 + i * 3.1 + (side > 0 ? 1.2 : 0), rx: 1, ry: 2.4, fill: "#d2a24a",
          transform: `rotate(${side * 28} ${side * 2.1} ${-8 + i * 3.1})` }, wheat));
    }
    el("ellipse", { cx: 0, cy: -11.5, rx: 0.9, ry: 2.2, fill: "#d2a24a" }, wheat);
    el("path", { d: "M3 38C-7 37 -10 28 -8 21C0 22 6 29 3 38Z", fill: `url(#${id}-gold)` }, left);
    el("path", { d: "M3 38C4 42 7 45 11 47", stroke: "#46261a", "stroke-width": 0.9, fill: "none", "stroke-linecap": "round" }, left);

    // S derecha (rosa) con batidor
    const right = drawS(47, "rose");
    const whisk = el("g", { transform: "translate(29 21) rotate(-35) scale(.85)", fill: "none", stroke: "#a96e5a", "stroke-linecap": "round" }, right);
    el("path", { d: "M0 6L0 19", "stroke-width": 1.4 }, whisk);
    [-3.2, -1.6, 0, 1.6, 3.2].forEach((x) =>
      el("path", { d: `M0 6C${x * 2.2} 2 ${x * 2.2} -8 0 -11C${-x * 0} -8 ${x * 0} 2 0 6`, "stroke-width": 0.7, transform: `scale(${x ? 1 : 1})` }, whisk));
    el("ellipse", { cx: 0, cy: -2.5, rx: 5.2, ry: 8.6, "stroke-width": 0.7 }, whisk);
    return svg;
  }

  function renderLogos() {
    document.querySelectorAll("[data-logo]").forEach((host) => {
      host.replaceChildren(createLogo({ size: Number(host.dataset.logo) || 40 }));
    });
  }

  root.createLogo = createLogo;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderLogos);
    else renderLogos();
  }
})(typeof window !== "undefined" ? window : globalThis);
