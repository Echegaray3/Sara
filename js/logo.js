/* =========================================================
   Logo "SS" — El horno de Sara
   Dos eles S entrelazadas con los colores de la marca.
   Uso: createLogo({ size: 40 }) devuelve un <svg>.
   ========================================================= */
(function (root) {
  const COLORS = {
    cocoa: "#3b2418",
    caramel: "#c98a45",
    cream: "#f6e9d7",
  };

  // Trazo de una S en una caja de 40 x 60
  const S_PATH = "M33 13C29 5 9 4 9 17C9 31 33 28 33 43C33 57 12 56 7 47";

  function createLogo({ size = 40, bg = true, title = "El horno de Sara" } = {}) {
    const NS = "http://www.w3.org/2000/svg";
    const el = (name, attrs, parent) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    };

    const svg = el("svg", { viewBox: "0 0 64 64", width: size, height: size, role: "img", "aria-label": title });
    if (bg) el("rect", { width: 64, height: 64, rx: 16, fill: COLORS.cocoa }, svg);

    const stroke = { fill: "none", "stroke-width": 6.5, "stroke-linecap": "round", "stroke-linejoin": "round" };
    // S de atrás (caramelo) y S de delante (crema), desplazadas para entrelazarse
    el("path", { ...stroke, d: S_PATH, stroke: COLORS.caramel, transform: "translate(5 3) scale(.9)" }, svg);
    // "recorte" de la S de delante para que se lea el cruce
    el("path", { ...stroke, d: S_PATH, stroke: bg ? COLORS.cocoa : "none", "stroke-width": 10.5, transform: "translate(22 6) scale(.9)" }, svg);
    el("path", { ...stroke, d: S_PATH, stroke: COLORS.cream, transform: "translate(22 6) scale(.9)" }, svg);
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
