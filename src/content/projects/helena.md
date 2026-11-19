---
title: Helena von Arx
summary: An AI influencer designed from scratch — a 75-year-old Swiss woman you recognise in a thumbnail — and the content system that turns a short brief into a new post.
category: AI influencer & content system
section: commercial
client: Helena von Arx (fictional character)
year: 2026
role: Character design, creative direction, AI pipeline
tools: [Magnific Spaces, Google Nano Banana 2.1, Gemini Flash]
order: 2
cover: ../../assets/projects/helena/05-hero-portrait.jpg
coverAlt: Helena von Arx, a very tall 75-year-old woman with a towering white chignon with an emerald streak, feather-white eyebrows and emerald sunglasses, in a fuchsia cape over a tangerine dress, white opera gloves and a gold pocket watch, sitting in a blue velvet armchair.
gallery:
  - { src: ../../assets/projects/helena/08-post-zurich.jpg, alt: Helena on a cream sofa in Zürich, lowering her emerald sunglasses with a gloved finger, in a cobalt cape over a saffron dress, a crystal tumbler beside her. }
  - { src: ../../assets/projects/helena/05-hero-portrait.jpg, alt: Helena in a fuchsia cape and tangerine dress, seated upright in a blue velvet armchair. }
  - { src: ../../assets/projects/helena/06-watch.jpg, alt: Her saucer-sized gold pocket watch with an emerald enamel dial, fuchsia bezel and skeleton gears. }
  - { src: ../../assets/projects/helena/09-monaco.jpg, alt: A stone terrace over the Monaco harbour at golden hour. }
  - { src: ../../assets/projects/helena/07-drink.jpg, alt: A cut-crystal tumbler of an opaque, very dark red drink. }
  - { src: ../../assets/projects/helena/10-london.jpg, alt: A London members' club lounge with green panelling, chesterfields and oil portraits. }
  - { src: ../../assets/projects/helena/11-como.jpg, alt: A villa terrace on Lake Como with lemon trees and a wooden motorboat. }
caseStudy:
  kind: concept
  brief: >-
    Helena von Arx is an AI influencer I designed from zero: a 75-year-old Swiss woman who lives between Zürich,
    Monaco and St. Moritz. The brief I set myself: a character strong enough to carry an account on her own, and a
    system that turns a few lines of brief into a new post without her changing from one image to the next.
  challenge: >-
    A character has to be recognisable before anyone reads the caption, and an image model has to draw her the same
    way every time. Most of the work was deciding what makes her Helena — and writing it down so precisely that a model
    can't get it wrong.
  idea: Lock everything that makes her Helena. Change one thing per post — a short brief — and let the system do the rest.
  process:
    - title: Character
      text: Three passes at the character sheet, from a quiet classic lady to an elongated silhouette in saturated colour blocks — feather-white eyebrows, an emerald streak, emerald glasses. Then a hero portrait to fix her face.
    - title: Visual bible
      text: A written description of what never changes — body, face, signature pieces, colour rules — and a "never" list. Pale skin, bare hands, beige, smiles and logos are out.
    - title: Signature objects
      text: A saucer-sized gold pocket watch, always on her chest, and a crystal tumbler of an unnamed, almost black red drink that waiters bring and she never orders.
    - title: Locations
      text: Eight places written once, each with its own light — Zürich, Geneva, St. Moritz, London, Monaco, New York, Dubai and Lake Como.
    - title: The post
      text: A brief with pillar, location, action, outfit, watch, drink and framing. An LLM prompt writer combines it with the bible and the references and writes the image prompt; the 9:16 still comes out the other end. The line of copy goes in at the edit, never in the image.
  deliverables:
    - Character sheet and hero portrait
    - Visual bible with fixed traits and a "never" list
    - 2 signature objects — the watch and the drink
    - 8 written locations, 3 of them rendered
    - A post brief template and a prompt writer that turns it into a still
    - First post — a 9:16 still for stories and reels
  credits:
    - role: Character, creative direction & AI pipeline
      name: Lautaro Ferrandi
    - role: Image model
      name: Google Nano Banana 2.1 (via Magnific)
    - role: Prompt writer
      name: Gemini Flash (via Magnific)
blocks:
  - type: heading
    label: The system
    title: Five panels, one brief
    text: The first three panels are her identity and never change between posts. The fourth is the brief, the only thing I edit. The fifth writes the prompt and makes the image.
  - type: nodes
    columns:
      - label: Identity
        items:
          - { src: ../../assets/projects/helena/04-sheet-v3.jpg, label: Helena — Character sheet }
          - { src: ../../assets/projects/helena/05-hero-portrait.jpg, label: Helena — Hero portrait }
      - label: Objects & places
        items:
          - { src: ../../assets/projects/helena/06-watch.jpg, label: The watch }
          - { src: ../../assets/projects/helena/07-drink.jpg, label: The drink }
          - { src: ../../assets/projects/helena/09-monaco.jpg, label: Monaco — Location }
          - { src: ../../assets/projects/helena/10-london.jpg, label: London — Location }
      - label: Brief
        items:
          - { label: Post brief, text: "Pillar · location · action · outfit · watch · drink · framing" }
          - { label: Prompt writer, text: "Brief + visual bible + references → one image prompt" }
      - label: Post
        items:
          - { src: ../../assets/projects/helena/08-post-zurich.jpg, label: Still — 9:16 }
    caption: Simplified view of the Magnific Spaces board. Identity, objects and locations are fixed; only the brief changes.
  - type: heading
    label: 01 · Finding Helena
    title: Three sheets to a silhouette
    text: The first two versions were elegant and forgettable. The third pushes everything — height, eyebrows, hair, colour — until she reads as Helena from across the feed.
  - type: images
    items:
      - { src: ../../assets/projects/helena/02-sheet-v1.jpg, alt: "First character sheet: a white-haired woman in a black coat, black gloves and small black sunglasses." }
      - { src: ../../assets/projects/helena/03-sheet-v2.jpg, alt: "Second character sheet: an all-ivory look with a white dome chignon and ivory sunglasses." }
    caption: Versions 1 and 2 — classic, then monochrome.
  - type: image
    src: ../../assets/projects/helena/04-sheet-v3.jpg
    alt: "Final character sheet: Helena in fuchsia and tangerine, with details of the feather eyebrows, emerald glasses, emerald hair streak, pocket watch, ring over the glove, freckles and red lips."
    caption: Version 3 — the one that stayed.
  - type: heading
    label: 02 · Signature objects
    title: The watch and the drink
    text: Two objects that show up in every story. The watch is always on her chest; the drink only appears when the brief asks for it, and nobody ever says what it is.
  - type: images
    items:
      - { src: ../../assets/projects/helena/06-watch.jpg, alt: Saucer-sized gold pocket watch with an emerald enamel dial, fuchsia bezel and skeleton gears. }
      - { src: ../../assets/projects/helena/07-drink.jpg, alt: Low cut-crystal tumbler of an opaque, very dark red liquid. }
  - type: heading
    label: 03 · Locations
    title: Where she lives
    text: Eight places, each with a fixed description and light, so the same room looks the same in every post. These three are already rendered.
  - type: images
    items:
      - { src: ../../assets/projects/helena/09-monaco.jpg, alt: Stone terrace over the Monaco harbour at golden hour, a table set for two. }
      - { src: ../../assets/projects/helena/10-london.jpg, alt: Private members' club lounge in London, green panelling, chesterfields and oil portraits. }
      - { src: ../../assets/projects/helena/11-como.jpg, alt: Villa terrace on Lake Como with lemon trees, a stone balustrade and a wooden motorboat. }
  - type: heading
    label: 04 · One post
    title: From brief to still
    text: "The brief for the first post, as written in the board:"
  - type: text
    body: |-
      Pillar — Image as an asset. Location — her Zürich apartment. Action — she sits upright on the edge of the cream sofa and lowers her emerald sunglasses with one gloved finger, looking straight into the camera. Outfit — a cobalt-blue cape with a stiff high collar over a saffron-yellow column dress. Drink — yes, untouched on the side table. Framing — waist up, 9:16. Light — soft grey afternoon.

      Line added in the edit — "Appearance is the first negotiation."
  - type: images
    items:
      - { src: ../../assets/projects/helena/05-hero-portrait.jpg, alt: Hero portrait of Helena in fuchsia and tangerine, the reference for her face. }
      - { src: ../../assets/projects/helena/08-post-zurich.jpg, alt: The first post — Helena in Zürich lowering her sunglasses, cobalt cape over saffron dress. }
    caption: Left, the hero portrait that fixes her face. Right, the post the system made from the brief.
---

A character and the machine around her: everything that makes Helena recognisable is locked, so each new post is a few lines of brief away.
