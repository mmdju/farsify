# Task List

A card-style task list that fills in, checks off, strikes through, and gives a tiny shake as each task is completed; finished tasks also move to the bottom so open ones stay on top.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/task-list](https://farsifyui.ir/components/task-list)
- **Install ID:** `task-list`

## Install

```bash
npx shadcn@latest add @farsify/task-list
```

Or copy `components/task-list/task-list.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { TaskList, type Task } from "@/components/farsify/task-list";

const initial: Task[] = [
  { id: "deps", label: "نصبِ وابستگی‌ها", done: true },
  { id: "registry", label: "ساختِ رجیستری" },
  { id: "rtl", label: "بازبینیِ راست‌چین" },
  { id: "release", label: "انتشارِ نسخه" },
];

export function ReleaseChecklist() {
  const [tasks, setTasks] = useState(initial);

  return (
    <TaskList
      aria-label="کارهای راه‌اندازی"
      tasks={tasks}
      onTasksChange={setTasks}
    />
  );
}

// اندازه‌ی بزرگ‌تر با رنگِ دلخواه برای خانه و تیک
<TaskList
  size="lg"
  defaultTasks={initial}
  accent="#0a84ff"
  checkColor="#ffffff"
/>

// یک ردیفِ تنها، بدونِ بازچینش و بدونِ اعلانِ صفحه‌خوان
import { TaskItem } from "@/components/farsify/task-list";

<TaskItem
  label="انتشارِ نسخه"
  defaultChecked={false}
  onCheckedChange={(done) => console.log(done)}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tasks` | `Task[]` | `[{ id: "a", label: "خرید نان", done: true }]` | — | The list in controlled mode. Each task is `{ id, label, done? }`; `id` is the key used for reordering. |
| `defaultTasks` | `Task[]` | `[]` | — | The initial list in uncontrolled mode; it only seeds the state. |
| `onTasksChange` | `(tasks: Task[]) => void` | — | — | Returns the full, updated list on every check/uncheck. |
| `size` | `"sm" | "md" | "lg"` | `"md"` | — | Row and font size; text comes from the project scale, not a raw number. |
| `accent` | `string` | `currentColor` | — | Fill color of the box. Any CSS value works; it defaults to the row's text color, so it changes with the theme. |
| `checkColor` | `string` | `var(--page, #ffffff)` | — | Color of the check itself, on the filled box. It must contrast with `accent` — it defaults to the page color. |
| `className` | `string` | — | — | Outer class on the `ul`; set the list width here. |

## Tips

- For a single row, export `TaskItem` directly — it has the same state machine, without reordering and without the `aria-live` announcement.
- `accent` is the box color and `checkColor` is the check color; the two play separate roles. With the defaults it is legible in both themes, so you do not need to pass anything.
- A finished task really does move to the bottom of the DOM, so the focus order matches what you see; if you want a fixed order, make the list controlled and sort it yourself.
- The strike is drawn from the start side (from the right in right-to-left) and the row's shake is mirrored too; do not mirror anything by hand.
- Each stage waits for the previous animation to finish rather than a timer, so the order stays correct under `prefers-reduced-motion` too, just without motion.

