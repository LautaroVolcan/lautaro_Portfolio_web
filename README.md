# lautaroferrandi.com

Portfolio de Lautaro Ferrandi. Sitio estático hecho con [Astro](https://astro.build), publicado en GitHub Pages con GitHub Actions.

## Trabajar en local

```bash
npm install
npm run dev       # http://localhost:4321 con recarga en vivo
npm run build     # genera dist/ (lo mismo que hace GitHub Actions)
npm run preview   # sirve dist/ para revisarlo antes de publicar
```

## Agregar un proyecto

1. Crea la carpeta `src/assets/projects/<slug>/` con la portada y las imágenes (JPG o PNG, máx. ~2400 px; Astro genera WebP/AVIF solo).
2. Crea `src/content/projects/<slug>.md`. El nombre del archivo es la URL: `control.md` → `/work/control/`.
3. Frontmatter (los campos con `?` son opcionales):

```md
---
title: Nombre del proyecto
summary: Una línea que explique qué es.
category: Documentary
year?: 2025
client?: Marca
role?: Dirección, edición
tools?: [Premiere Pro, After Effects]
order: 1                       # menor = aparece antes
cover: ../../assets/projects/mi-proyecto/cover.jpg
coverAlt: Descripción de la imagen
loop?: /video/mi-proyecto-loop.mp4    # 4–6 s, sin audio, < 2 MB, en public/video/ (se reproduce al pasar el mouse en la grilla)
video?: https://vimeo.com/123456789   # video principal, arriba de todo (Vimeo, YouTube, Behance/Adobe o Sketchfab)
videoRatio?: 9/16              # 16/9 por defecto; 9/16, 1/1, 3/4, 4/5 para verticales/cuadrados
blocks?:                       # el cuerpo del caso, en orden, después del texto principal
  - type: image
    src: ../../assets/projects/mi-proyecto/01.jpg
    alt: Frame del proceso
    wide?: true                # a todo el ancho
    caption?: Un pie de foto
  - type: images               # 2 o 3 imágenes lado a lado
    items:
      - src: ../../assets/projects/mi-proyecto/02.jpg
        alt: Antes
      - src: ../../assets/projects/mi-proyecto/03.jpg
        alt: Después
  - type: video
    url: https://www.youtube.com/watch?v=xxxx
    ratio?: 16/9
  - type: text
    body: Un párrafo entre imágenes.
draft?: true                   # lo oculta sin borrarlo
---

Texto principal del proyecto en Markdown: contexto → enfoque → resultado. Puedes usar `## Subtítulos`.
```

4. `git add`, commit, push a `main` → se publica solo en ~1 minuto.

**Loops para la grilla:** `ffmpeg -i pieza.mov -t 5 -vf scale=720:-2 -an -c:v libx264 -crf 24 -preset veryfast -movflags +faststart public/video/slug-loop.mp4`

**Videos largos:** no van al repo (GitHub bloquea archivos de más de 100 MB). Súbelos a Vimeo/YouTube y pon el link en `video`.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Textos de About, experiencia, capabilities, redes, link al CV y al reel | `src/data/site.ts` |
| Proyectos | `src/content/projects/*.md` |
| Estilos (colores, tipografías, layout) | `src/styles/global.css` |
| Hero | `src/components/Hero.astro` |
| Página de proyecto | `src/pages/work/[slug].astro` |
| Favicons, imagen para compartir (`og-image.jpg`), video del hero | `public/` |

Para el reel: pega el link en `reel` dentro de `src/data/site.ts` y aparece el botón "Watch reel" en el hero.

### Bloques extra para casos de estudio

- `heading`: título de sección dentro del proyecto (`label`, `title`, `text`).
- `nodes`: diagrama tipo tablero de nodos (columnas de izquierda a derecha, cada una con miniaturas). Ver `eight.md`.
- `caseStudy` en el frontmatter: `kind` (client / spec / pitch / concept), `brief`, `challenge`, `idea`, `process`, `deliverables`, `results`, `credits`. Ejemplo completo en `_case-study-example.md`.
