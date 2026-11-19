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

1. Guarda la imagen de portada en `src/assets/projects/` (cuadrada, ≥ 1200 px; PNG o JPG; Astro genera WebP/AVIF solo).
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
cover: ../../assets/projects/mi-proyecto.jpg
coverAlt: Descripción de la imagen
loop?: /video/mi-proyecto-loop.mp4    # 4–6 s, sin audio, < 2 MB, en public/video/
video?: https://vimeo.com/123456789   # pieza completa (Vimeo o YouTube)
gallery?:
  - src: ../../assets/projects/mi-proyecto-02.jpg
    alt: Frame del proceso
external?:
  label: Archive on Behance
  url: https://www.behance.net/...
draft?: true                   # lo oculta sin borrarlo
---

Texto del proyecto en Markdown: contexto → enfoque → resultado.
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
