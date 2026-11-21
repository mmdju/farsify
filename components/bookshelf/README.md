# Bookshelf

A shelf of book spines; click one and the book flies onto the table, its cover opens with real physics, and the pages turn with real paper geometry. With Esc or a click outside, it goes back to the shelf.

- **Category:** Showcase
- **Interaction:** Click / Drag / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/bookshelf](https://farsifyui.ir/components/bookshelf)
- **Install ID:** `bookshelf`

## Install

```bash
npx shadcn@latest add @farsify/bookshelf
```

Or copy `components/bookshelf/bookshelf.tsx` and `components/bookshelf/bookshelf.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Bookshelf } from "@/components/farsify/bookshelf";

export function ReadingCorner() {
  return <Bookshelf />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* کتاب‌های خودت — هر پارچه، هر فویل و هر متنی */}
      <Bookshelf
        books={[
          {
            id: "diary",
            title: "دفترِ روزانه",
            author: "خودم",
            cloth: "#3b4a6b",
            foil: "#e9d7a8",
            blurb: "یک سال نوشتن، بی هیچ قاعده‌ای.",
            content: <p>هر بلندی که به کتاب بدهی، خودش درست صفحه‌بندی می‌شود.</p>,
          },
        ]}
      />

      {/* قفسهٔ جمع‌وجورتر */}
      <Bookshelf count={3} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `books` | `ShelfBook[]` | — | — | The shelf's books (`title`, `author`, `cloth`, `foil`, `blurb`, `content` and optional `height`/`width`/`label`); defaults to the component's own five books with Persian text. |
| `series` | `string` | `"اتاقِ مطالعه"` | — | Series name; the header of the right-hand pages and the foot of each back cover. |
| `count` | `number` | — | — | How many of the first books on the shelf are shown; without it all of them, and `0` also means all (not none). |
| `autoOpen` | `boolean` | — | — | Open the first book automatically — for the site's auto preview. |

## Tips

- It has no dependencies — not even `motion`; everything is hand-rolled physics on requestAnimationFrame plus pure CSS: covers with a heavy-swing hinge equation, pages with folded-paper geometry (the fold is the perpendicular bisector of the line from the corner to the target).
- The geometry is fully mirrored for a Persian book: spine on the right, first page on the left and turning from left to right — not a visual trick; the math itself is mirrored.
- Text is paginated with CSS columns and any text of any length paginates correctly by itself; the page numbers are in Persian.
- Each book's cover and spine are set with `cloth` and `foil`; the physical colors (cream paper, shelf wood) don't change with the theme but are variables `--bs-*` in `bookshelf.css` — it's a book, but its color is in your hands.
- On wide screens it expands as a two-page spread and on phones as single-page; the return to the shelf flies with `offset-path` and until it settles, its spine rotates into the row.
- With `prefers-reduced-motion` the book opens without animation and the flights are removed; the pages still turn.

