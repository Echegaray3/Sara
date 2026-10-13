/* =========================================================
   Logo "SS" — El horno de Sara
   Dos eles S entrelazadas, en cacao, oro y rosa pastel.
   Uso: createLogo({ size: 40 }) devuelve un <svg>.
        createLogo({ size: 64, bg: "#fbf5ec" }) lo dibuja sobre un cuadrado redondeado.
   ========================================================= */
(function (root) {
  const COLORS = {
    cocoa: "#4a2a1a",
    gold: "#c9a24b",
    goldLight: "#e6c985",
    rose: "#e9b4a6",
  };

  // Trazo de una S en una caja de 80 x 80 (bola decorativa en cada extremo)
  const S_PATH = "M43 19C40 7 14 7 14 24C14 41 44 37 44 55C44 72 16 72 12 59";
  const ENDS = [[43, 19], [12, 59]];
  // La S de atrás esconde su extremo superior bajo la de delante
  const BACK_PATH = "M36 11C30 8 14 7 14 24C14 41 44 37 44 55C44 72 16 72 12 59";

  let uid = 0;

  function createLogo({ size = 40, bg = null, title = "El horno de Sara" } = {}) {
    const NS = "http://www.w3.org/2000/svg";
    const el = (name, attrs, parent) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };
    const id = "logo-mask-" + uid++;
    const round = { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
    const FRONT = "translate(27 0)";

    const svg = el("svg", { viewBox: "0 0 80 80", width: size, height: size, role: "img", "aria-label": title });
    if (bg) el("rect", { width: 80, height: 80, rx: 20, fill: bg }, svg);

    // La S de delante "recorta" a la de atrás para que se lea el entrelazado
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 80, height: 80 }, el("defs", {}, svg));
    el("rect", { width: 80, height: 80, fill: "#fff" }, mask);
    el("path", { ...round, d: S_PATH, stroke: "#000", "stroke-width": 10, transform: FRONT }, mask);

    // S de atrás: cacao con vena dorada y rosa
    const back = el("g", { mask: `url(#${id})` }, svg);
    el("path", { ...round, d: BACK_PATH, stroke: COLORS.cocoa, "stroke-width": 8 }, back);
    el("path", { ...round, d: BACK_PATH, stroke: COLORS.gold, "stroke-width": 3.4 }, back);
    el("path", { ...round, d: BACK_PATH, stroke: COLORS.rose, "stroke-width": 1.2 }, back);
    el("circle", { cx: ENDS[1][0], cy: ENDS[1][1], r: 4.4, fill: COLORS.cocoa }, back);

    // S de delante: oro con vena cacao y rosa
    const front = el("g", { transform: FRONT }, svg);
    el("path", { ...round, d: S_PATH, stroke: COLORS.gold, "stroke-width": 8 }, front);
    el("path", { ...round, d: S_PATH, stroke: COLORS.cocoa, "stroke-width": 3.4 }, front);
    el("path", { ...round, d: S_PATH, stroke: COLORS.rose, "stroke-width": 1.2 }, front);
    ENDS.forEach(([cx, cy]) => el("circle", { cx, cy, r: 4.4, fill: COLORS.gold }, front));
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
