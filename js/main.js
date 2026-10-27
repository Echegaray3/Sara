/* =========================================================
   CONFIGURACIÓN — edita solo esta parte
   ========================================================= */
const CONFIG = {
  // Teléfono de WhatsApp de Sara: prefijo de país + número, sin + ni espacios.
  // Número real de Sara.
  whatsapp: "34610765097",
  instagram: "https://www.instagram.com/saraserodio/",
  // Días mínimos de antelación para un encargo
  leadDays: 2,
};

// Postres, tamaños y precios (en euros). Se muestran en la carta y en el formulario.
const PRODUCTS = {
  queso: {
    name: "Tarta de queso al horno",
    sizes: [
      { label: "17 cm", price: 24 },
      { label: "22,5 cm", price: 35 },
    ],
  },
  torta: {
    name: "Torta de chocolate",
    sizes: [
      { label: "17 cm", price: 28 },
      { label: "22,5 cm", price: 37 },
    ],
  },
  banoffee: {
    name: "Banoffee",
    sizes: [
      { label: "17 cm", price: 22 },
      { label: "22,5 cm", price: 32 },
    ],
  },
  "pan-queso": {
    name: "Pan de queso",
    sizes: [
      { label: "10 unidades congeladas (500 g)", price: 7 },
      { label: "10 unidades horneadas", price: 9 },
    ],
  },
};

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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

// Precios en la carta
const euros = (n) => `${n.toLocaleString("es-ES")} €`;
$$("[data-prices]").forEach((ul) => {
  ul.innerHTML = PRODUCTS[ul.dataset.prices].sizes
    .map((s) => `<li><span>${s.label}</span><strong>${euros(s.price)}</strong></li>`)
    .join("");
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
const fError = $("#f-error");
const fTotal = $("#f-total");

fProducto.innerHTML = Object.entries(PRODUCTS)
  .map(([id, p]) => `<option value="${id}">${p.name}</option>`)
  .join("");

function fillSizes() {
  const p = PRODUCTS[fProducto.value];
  fTamano.innerHTML = p.sizes
    .map((s, i) => `<option value="${i}">${s.label} — ${euros(s.price)}</option>`)
    .join("");
  updateTotal();
}

const qtyValue = () => Math.max(1, parseInt(fCantidad.value, 10) || 1);
const orderTotal = () => PRODUCTS[fProducto.value].sizes[+fTamano.value].price * qtyValue();
function updateTotal() {
  fTotal.textContent = `Total: ${euros(orderTotal())}`;
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
  const size = p.sizes[+fTamano.value];
  const qty = qtyValue();
  const [y, m, d] = fFecha.value.split("-");
  const notas = $("#f-notas").value.trim();

  const msg = [
    "¡Hola Sara! Quiero hacer un encargo:",
    "",
    `• ${qty} × ${p.name} — ${size.label} (${euros(size.price)})`,
    `• Total: ${euros(orderTotal())}`,
    `• Fecha: ${d}/${m}/${y}`,
    `• ${$("#f-entrega").value}`,
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
