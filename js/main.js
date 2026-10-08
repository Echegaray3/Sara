/* =========================================================
   CONFIGURACIÓN — edita solo esta parte
   ========================================================= */
const CONFIG = {
  // Teléfono de WhatsApp de Sara: prefijo de país + número, sin + ni espacios.
  // TODO: cambiar por el número real (ahora es un ejemplo).
  whatsapp: "34600000000",
  // TODO: cambiar por el usuario real de Instagram
  instagram: "https://www.instagram.com/",
  // Días mínimos de antelación para un encargo
  leadDays: 2,
};

// Precios orientativos en euros. TODO: sustituir por los precios reales de Sara.
const PRODUCTS = {
  "queso-pistacho": {
    name: "Tarta de queso y pistacho",
    sizes: [["Pequeña (6–8 raciones)", 24], ["Grande (10–12 raciones)", 34]],
  },
  queso: {
    name: "Tarta de queso al horno",
    sizes: [["Pequeña (6–8 raciones)", 20], ["Grande (10–12 raciones)", 30]],
  },
  chocolate: {
    name: "Tarta de chocolate",
    sizes: [["Pequeña (6–8 raciones)", 22], ["Grande (10–12 raciones)", 32]],
  },
  corona: {
    name: "Corona de chocolate",
    sizes: [["Entera (10–12 raciones)", 22]],
  },
  banoffee: {
    name: "Banoffee",
    sizes: [["Entera (8 raciones)", 26], ["Porción individual", 4]],
  },
  cookies: {
    name: "Cookies con trozos",
    sizes: [["Caja de 4", 10], ["Caja de 6", 14]],
  },
};

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const euro = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0 });
const waBase = `https://wa.me/${CONFIG.whatsapp}`;

// Enlaces generales
$$("[data-wa-link]").forEach((a) => {
  a.href = `${waBase}?text=${encodeURIComponent("¡Hola Sara! Me gustaría hacer un encargo.")}`;
  a.target = "_blank";
  a.rel = "noopener";
});
$$("[data-ig-link]").forEach((a) => (a.href = CONFIG.instagram));
$$("[data-lead]").forEach((el) => (el.textContent = CONFIG.leadDays));
$("#year").textContent = new Date().getFullYear();

// Precio "desde" en las tarjetas
$$("[data-from]").forEach((el) => {
  const p = PRODUCTS[el.dataset.from];
  if (p) el.textContent = `Desde ${euro(Math.min(...p.sizes.map((s) => s[1])))}`;
});

// Menú móvil
const toggle = $(".nav-toggle");
const nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Formulario de pedido
const form = $("#order-form");
const fProducto = $("#f-producto");
const fTamano = $("#f-tamano");
const fCantidad = $("#f-cantidad");
const fFecha = $("#f-fecha");
const fTotal = $("#f-total");
const fError = $("#f-error");

fProducto.innerHTML = Object.entries(PRODUCTS)
  .map(([id, p]) => `<option value="${id}">${p.name}</option>`)
  .join("");

function fillSizes() {
  const p = PRODUCTS[fProducto.value];
  fTamano.innerHTML = p.sizes.map(([label, price], i) => `<option value="${i}">${label} · ${euro(price)}</option>`).join("");
  updateTotal();
}
function updateTotal() {
  const p = PRODUCTS[fProducto.value];
  const price = p.sizes[+fTamano.value]?.[1] ?? 0;
  const qty = Math.max(1, parseInt(fCantidad.value, 10) || 1);
  fTotal.textContent = euro(price * qty);
}
fProducto.addEventListener("change", fillSizes);
fTamano.addEventListener("change", updateTotal);
fCantidad.addEventListener("input", updateTotal);
fillSizes();

// Fecha mínima = hoy + antelación
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const minDate = new Date();
minDate.setDate(minDate.getDate() + CONFIG.leadDays);
fFecha.min = toISO(minDate);
$("#f-fecha-hint").textContent = `Mínimo ${CONFIG.leadDays} días de antelación.`;

// Botones "Pedir" de las tarjetas
$$("[data-order]").forEach((btn) =>
  btn.addEventListener("click", () => {
    fProducto.value = btn.dataset.order;
    fillSizes();
    $("#pedido").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => fFecha.focus({ preventScroll: true }), 600);
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fError.hidden = true;
  const nombre = $("#f-nombre").value.trim();
  if (!nombre || !fFecha.value) {
    fError.textContent = "Indica tu nombre y la fecha que quieres.";
    fError.hidden = false;
    return;
  }
  if (fFecha.value < fFecha.min) {
    fError.textContent = `Necesito al menos ${CONFIG.leadDays} días de antelación. Elige una fecha posterior.`;
    fError.hidden = false;
    return;
  }
  const p = PRODUCTS[fProducto.value];
  const [sizeLabel, price] = p.sizes[+fTamano.value];
  const qty = Math.max(1, parseInt(fCantidad.value, 10) || 1);
  const [y, m, d] = fFecha.value.split("-");
  const notas = $("#f-notas").value.trim();

  const msg = [
    "¡Hola Sara! Quiero hacer un encargo:",
    "",
    `• ${qty} × ${p.name} — ${sizeLabel}`,
    `• Fecha: ${d}/${m}/${y}`,
    `• ${$("#f-entrega").value}`,
    `• Total orientativo: ${euro(price * qty)}`,
    notas ? `• Notas: ${notas}` : null,
    "",
    `Mi nombre: ${nombre}`,
  ].filter((l) => l !== null).join("\n");

  window.open(`${waBase}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// Galería con ampliación
const lb = $("#lightbox");
const lbImg = $("img", lb);
$$(".g").forEach((b) =>
  b.addEventListener("click", () => {
    lbImg.src = b.dataset.full;
    lbImg.alt = b.dataset.alt || "";
    lb.showModal();
  })
);
lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbImg) lb.close(); });

// Aparición suave al hacer scroll
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".card, .steps li, .about, .order, details").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}
