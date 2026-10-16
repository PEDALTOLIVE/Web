# Pedaltolive — web

Proyecto Next.js (TypeScript + Tailwind CSS) generado a partir del diseño de Figma "Pedaltolive".

## Puesta en marcha

Abre una Terminal normal (no hace falta usar Claude) en esta carpeta y ejecuta:

```bash
npm install
npm run dev
```

Luego abre http://localhost:3000 en el navegador.

## Estado actual

Página maquetada por ahora:

- **Home** (`/`) — completa: Hero, About, mapa/globo interactivo (versión plana con puntos clicables), Guided trips, Route kits, Shop, Sponsors.

Páginas pendientes (ya diseñadas en Figma, siguiente en la lista):

- `/shop-trips`
- `/shop-kits`
- `/product-page/[slug]` (plantilla)
- `/news`
- `/article-page/[slug]` (plantilla)
- `/contact`
- `/policy`

Backend pendiente (fases siguientes): base de datos + panel de admin, pagos con Stripe, autenticación.

## Fotos

Faltan las fotos reales — mira `public/images/README.md` para la lista exacta de archivos que hay que añadir. El sitio funciona igualmente sin ellas (verás un color de fondo liso).

## Notas técnicas

- Colores y tipografías están tomados directamente de las variables de Figma (`tailwind.config.ts`): tipografía de titulares "Young Serif", texto "Inter", etiquetas "IBM Plex Mono"; color principal `#E75838`.
- El mapa interactivo de la Home es una versión simplificada (imagen plana + puntos clicables). Para el globo 3D que se puede arrastrar y girar (como en el brief original), el siguiente paso sería instalar `react-globe.gl` o `three-globe` — pendiente de una sesión futura.
- El header (`src/components/layout/Header.tsx`) está pensado para fondos oscuros (como el hero de Home). Al construir las páginas con fondo claro habrá que añadir la variante clara del nav.
