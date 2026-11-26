# Contributing

Thanks for being here. This repository is the home of the Farsify component source; the website (live previews, controls, interactive docs) is maintained separately. Only what a user actually copies into their project lives here.

## What this repository is

- **Is:** each component's source as a single file, its optional CSS, metadata (`meta.json`) and a short component guide.
- **Is not:** the website, its shell, brand fonts, demo images or internal tooling. Components depend on none of those.

## Before you start

Use the issue templates for a new component idea or a bug report:

- [Component request](https://github.com/mmdju/farsify/issues/new?template=component_request.yml)
- [Bug report](https://github.com/mmdju/farsify/issues/new?template=bug_report.yml)

## Adding a component

Create a folder named after the component in Latin kebab-case; that name is the `slug` and the install ID:

```
components/<slug>/
  <slug>.tsx      component source (required)
  <slug>.css      only when the component needs CSS
  meta.json       machine-readable metadata (required)
  README.md       short guide (required)
```

**What you really author is the component file, its CSS and the English translation** — that is what survives acceptance. The per-component `README.md` and `meta.json`, the `components/README.md` index and the counts in the root README are **regenerated** from the site's source when a PR is accepted. They must still exist and stay consistent so `node scripts/check.mjs` passes, but do not worry about their phrasing or formatting.

Write `meta.json` in exactly this shape:

```json
{
  "slug": "magnet",
  "name": "Magnet",
  "description": "One sentence about what the component does and how it feels.",
  "category": "actions",
  "dependencies": ["motion"],
  "interactionType": "Click / Keyboard",
  "interactionNotes": "Exactly what happens, in short sentences.",
  "props": [
    {
      "name": "size",
      "type": "\"sm\" | \"md\" | \"lg\"",
      "defaultValue": "\"md\"",
      "description": "Component size."
    }
  ],
  "tips": ["A note that prevents a common mistake."],
  "version": 1
}
```

Categories: `inputs`, `actions`, `navigation`, `status`, `showcase`. All documentation is in English.

English copy lives in `translations/en/<slug>.json` and is what generates each component page and `meta.json`. When you add or change a component, add the matching translation file with `description`, `interactionType`, `interactionNotes`, one entry per prop in `props`, and the same number of `tips` in the same order. The check script fails when a translation is missing, misaligned with `meta.json`, or contains non-English text.

## Component contract

These are not negotiable; the shipped code must respect them:

1. **RTL with logical properties.** Use `ms-`, `me-`, `start-`, `end-`, `text-start` instead of `ml-`, `mr-`, `left-`, `right-`, `text-left`. Directional icons (next/previous arrows) are mirrored; natural physics (slider drag, rotation) are not.
2. **Persian typography.**
   - No positive `tracking` on Persian text.
   - No alpha color on connected Persian text (`text-foreground/60`); use a solid token (`text-muted-foreground`) or `opacity` on the whole element.
   - `leading` never below `1.4`.
   - Display numbers go through `formatFa` / `toFaDigits`.
3. **shadcn tokens only.** No dependency on our website palette: `background`, `foreground`, `muted`, `muted-foreground`, `accent`, `card`, `border`, `primary`, `ring`. Raw hex in Tailwind classes (`bg-[#123456]`) is not allowed; component-specific variables use a prefix.
4. **No external requests.** No font, image, script or API is loaded from another domain at runtime.
5. **No demo images in the repository.** If a component needs images, accept them through props or a relative path and document it in the README.
6. **Self-contained.** The shipped file must not import `@/lib/utils` or any internal file; helper functions (`cn`, `formatFa`, `toFaDigits`, `groupNumber`) are inlined. `"use client"`, when needed, must be the first statement.
7. **Accessibility.** Correct roles and `aria-label`s, keyboard support, a visible focus state and respect for `prefers-reduced-motion`.
8. **Minimal dependencies.** New packages only after discussion. Allowed: `motion`, `lucide-react`, `clsx`, `tailwind-merge` (and `three` strictly loaded dynamically).
9. **No internal comments.** Shipped files are published without comments; put design notes in `meta.json` or the README.

## Try it locally

The repository holds source only. To see a component render, drop it into any React 19 + Tailwind v4 app:

```bash
npx create-next-app@latest try-farsify --yes
cd try-farsify
npx shadcn@latest init
npm i motion lucide-react
```

(Install only the packages your component's `meta.json` lists — commonly `motion` and/or `lucide-react`.)

Copy `<slug>.tsx` — and `<slug>.css`, if present — anywhere in the project, import it on a page, and set `<html dir="rtl" class="dark">`: RTL is the natural reading direction for the Persian labels, and the `dark` class shows the dark theme. Run `npm run dev` and use the browser device toolbar at `390px` for the mobile check. The console should stay clean.

## Component README

At minimum: a one-line introduction, the install command (`npx shadcn@latest add @farsify/<slug>`), a usage example, a props table and — when images are needed — the demo asset paths.

## Before opening a PR

```bash
node scripts/check.mjs
```

The script validates folder structure, `meta.json` completeness, unique slugs,
component counts in both READMEs, the component index, the absence of site-only tokens
and raw hex in component code, the Persian typography traps (positive tracking and alpha
text colors), and that every component has an English translation that matches it.

CI runs one more step this script cannot do without a dependency: it parses every
`components/*/*.tsx` with esbuild, so a file with invalid TSX syntax fails before review.
Physical-direction classes are printed as warnings, not failures; use logical
properties (`ms-`, `start-`, `text-start`) wherever the direction is not deliberate physics.

Then follow the checklist in the pull request template — themes, mobile width, console, keyboard and `prefers-reduced-motion` — and mention anything you could not test by hand in the PR notes.

## Review flow

Your PR is reviewed as a proposal. If accepted, the code is added to the project's main source (the site repository) and this repository is regenerated from it. That is why final formatting may differ slightly: it guarantees that what users get with `shadcn add` is always exactly what they saw on the site.
