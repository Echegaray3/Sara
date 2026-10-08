# Postres de Sara · Alcoy

Web estática (HTML + CSS + JS, sin dependencias) para vender los postres caseros de Sara en Alcoy.
Los pedidos se envían por WhatsApp con el mensaje ya redactado.

## Ver en local

```bash
python3 -m http.server 8000   # y abrir http://localhost:8000
```

## Qué hay que personalizar (todo en `js/main.js`, arriba del todo)

- `CONFIG.whatsapp`: número de WhatsApp de Sara (formato `34600123456`). **Ahora es un número de ejemplo.**
- `CONFIG.instagram`: enlace a su Instagram.
- `CONFIG.leadDays`: días mínimos de antelación para un encargo.
- `PRODUCTS`: nombres, tamaños y **precios (ahora son orientativos/inventados)**.

Además, revisar los textos de `index.html` (sección "Sara", preguntas frecuentes, conservación,
formas de pago, punto de recogida) para que reflejen cómo trabaja realmente.

## Estructura

```
index.html      página única
css/styles.css  estilos
js/main.js      configuración, formulario de pedido, galería
img/            fotos de los postres
favicon.svg
```

## Publicar

Es un sitio estático: sirve en GitHub Pages, Netlify, Cloudflare Pages o cualquier hosting.
