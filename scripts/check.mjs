/*
 * Repository validation — no dependencies.
 *
 *   node scripts/check.mjs
 *
 * Checks:
 *   • component folder structure (tsx, optional CSS, meta.json, README)
 *   • meta.json completeness, field types and unique slugs
 *   • one English translation per component
 *   • component counts in the READMEs and the component index
 *   • no site-only tokens or raw hex classes in component code
 *   • Persian typography traps: positive tracking and alpha text colors
 *   • documentation is English-only (code fences/spans excluded)
 *   • referenced image files exist
 *
 * CI also parses every TSX with esbuild; this script never installs anything.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = path.join(ROOT, "components");
const TRANSLATIONS = path.join(ROOT, "translations", "en");
const CATEGORIES = ["inputs", "actions", "navigation", "status", "showcase"];
const SITE_TOKENS = [
  "text-fg-",
  "bg-fg-",
  "border-fg-",
  "bg-surface",
  "surface-hover",
  "preview-border",
  "bg-preview",
  "bg-page",
  "--brand",
  "--hairline",
  "--fg-",
];
const PERSIAN = /[\u0600-\u06FF]/;

/* Typography traps. `tracking-wide` and alpha text colors break Persian text. */
const POSITIVE_TRACKING_CLASSES = /\btracking-(wide|wider|widest)\b/;
const ARBITRARY_TRACKING_CLASS = /tracking-\[([^\]]+)\]/g;
const ALPHA_TEXT_CLASS =
  /\btext-(?!(?:xs|sm|base|lg|xl|[2-9]xl)\b)[a-z0-9[\]#-]+\/\d{1,3}\b/;
const PHYSICAL =
  /(?<![-\w])(?:ml|mr|pl|pr|left|right|text-left|text-right|rounded-[lr]|border-[lr])-[a-z0-9[\]-]+/;
const CENTERING_IDIOM = /left-1\/2/;

/*
 * Two known CSS lines predate this check and sit in the site's RTL baseline.
 * They are allowed by exact snippet; anything new fails.
 */
const CSS_ALPHA_ALLOW = new Set([
  "glide-select|color: color-mix(in srgb, var(--gs-text) 55%, transparent);",
  "refine-frame|color: color-mix(in srgb, var(--rf-ink) 80%, transparent);",
]);

const problems = [];
const warnings = [];
const fail = (message) => problems.push(message);
const read = (file) => readFileSync(file, "utf8");

/** True when the arbitrary tracking value is positive; tight/negative is fine. */
const isPositiveTracking = (value) => {
  const numeric = Number.parseFloat(value.replace(/[a-z%]+$/i, ""));
  return Number.isFinite(numeric) && numeric > 0;
};

/** Lines that belong to a comment (`//`, `/* *\/`, `{/* *\/}`), across lines. */
function commentLines(lines) {
  const inside = new Array(lines.length).fill(false);
  let open = false;
  lines.forEach((line, index) => {
    const trimmed = line.trimStart();
    if (open) {
      inside[index] = true;
      if (line.includes("*/")) open = false;
      return;
    }
    if (trimmed.startsWith("//")) {
      inside[index] = true;
      return;
    }
    const startsBlock = trimmed.startsWith("/*") || trimmed.startsWith("{/*");
    if (!startsBlock) return;
    inside[index] = true;
    const opened = trimmed.lastIndexOf("/*");
    const closed = trimmed.indexOf("*/", opened + 2);
    if (closed === -1) open = true;
  });
  return inside;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Documentation must read in English; code examples may contain Persian UI copy. */
function englishOnly(file, text) {
  const withoutCode = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
  if (PERSIAN.test(withoutCode)) fail(`${file}: documentation is not English-only.`);
}

if (!existsSync(COMPONENTS)) fail("components/ is missing.");
const dirs = existsSync(COMPONENTS)
  ? readdirSync(COMPONENTS).filter((name) =>
      statSync(path.join(COMPONENTS, name)).isDirectory(),
    )
  : [];

const seen = new Set();
const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));

for (const slug of dirs) {
  const dir = path.join(COMPONENTS, slug);
  const metaFile = path.join(dir, "meta.json");
  const tsxFile = path.join(dir, `${slug}.tsx`);
  const readmeFile = path.join(dir, "README.md");
  const translationFile = path.join(TRANSLATIONS, `${slug}.json`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail(`${slug}: folder name must be Latin kebab-case.`);
  }
  if (!existsSync(tsxFile)) fail(`${slug}: ${slug}.tsx is missing.`);
  if (!existsSync(readmeFile)) fail(`${slug}: README.md is missing.`);
  if (!existsSync(translationFile)) fail(`${slug}: translations/en/${slug}.json is missing.`);
  if (!existsSync(metaFile)) {
    fail(`${slug}: meta.json is missing.`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(read(metaFile));
  } catch {
    fail(`${slug}: meta.json is not valid JSON.`);
    continue;
  }

  if (meta.slug !== slug) fail(`${slug}: "slug" does not match the folder name.`);
  if (seen.has(meta.slug)) fail(`${slug}: duplicate slug.`);
  seen.add(meta.slug);

  for (const key of ["name", "description", "interactionType", "interactionNotes"]) {
    if (typeof meta[key] !== "string" || meta[key].trim() === "") {
      fail(`${slug}: "${key}" is empty or invalid.`);
    }
  }
  if (PERSIAN.test(`${meta.name}\n${meta.description}\n${meta.interactionNotes}`)) {
    fail(`${slug}: meta.json documentation is not English-only.`);
  }
  if (!CATEGORIES.includes(meta.category)) {
    fail(`${slug}: category "${meta.category}" is invalid.`);
  } else {
    byCategory[meta.category] += 1;
  }
  if (!Array.isArray(meta.dependencies)) fail(`${slug}: dependencies must be an array.`);
  if (!Array.isArray(meta.props)) {
    fail(`${slug}: props must be an array.`);
  } else {
    for (const prop of meta.props) {
      if (!prop.name || !prop.type || !prop.description) {
        fail(`${slug}: incomplete prop (name/type/description).`);
      }
      if (PERSIAN.test(prop.description)) {
        fail(`${slug}: prop "${prop.name}" description is not English.`);
      }
    }
  }

  /* A missing or malformed translation must fail cleanly, not crash the run. */
  let translation = null;
  if (existsSync(translationFile)) {
    try {
      translation = JSON.parse(read(translationFile));
    } catch {
      fail(`${slug}: translations/en/${slug}.json is not valid JSON.`);
    }
  }
  if (translation) {
    for (const key of ["description", "interactionType", "interactionNotes"]) {
      if (typeof translation[key] !== "string" || translation[key].trim() === "") {
        fail(`${slug}: translation "${key}" is empty.`);
      }
    }
    const translatedProps = Object.keys(translation.props ?? {}).sort();
    const metaProps = (meta.props ?? []).map((prop) => prop.name).sort();
    if (JSON.stringify(translatedProps) !== JSON.stringify(metaProps)) {
      fail(`${slug}: translation props do not match meta.json props.`);
    }
    const metaTips = (meta.tips ?? []).length;
    const translatedTips = (translation.tips ?? []).length;
    if (metaTips !== translatedTips) {
      fail(`${slug}: translation has ${translatedTips} tips, meta.json has ${metaTips}.`);
    }
    if (PERSIAN.test(JSON.stringify(translation))) {
      fail(`${slug}: translation contains non-English text.`);
    }
  }

  const cssFile = path.join(dir, `${slug}.css`);
  if (Boolean(meta.hasCss) !== existsSync(cssFile)) {
    fail(`${slug}: hasCss does not match the presence of a CSS file.`);
  }

  const code = read(tsxFile);
  if (code.trim() === "") fail(`${slug}: component file is empty.`);
  for (const token of SITE_TOKENS) {
    if (code.includes(token)) fail(`${slug}: site-only token in code ("${token}").`);
  }
  if (/\[#[0-9a-fA-F]{3,8}\]/.test(code)) fail(`${slug}: raw hex inside Tailwind classes.`);

  /* Typography traps in the TSX. */
  {
    const lines = code.split(/\r?\n/);
    const inComment = commentLines(lines);
    lines.forEach((line, index) => {
      if (inComment[index]) return;
      const arbitrary = [...line.matchAll(ARBITRARY_TRACKING_CLASS)];
      if (
        POSITIVE_TRACKING_CLASSES.test(line) ||
        arbitrary.some((match) => isPositiveTracking(match[1]))
      ) {
        fail(`${slug}:${index + 1}: positive tracking on Persian text.`);
      }
      if (ALPHA_TEXT_CLASS.test(line)) {
        fail(`${slug}:${index + 1}: alpha text color on Persian text.`);
      }
      if (!CENTERING_IDIOM.test(line) && PHYSICAL.test(line)) {
        warnings.push(`${slug}:${index + 1}: physical direction class`);
      }
    });
  }

  /* Typography traps in the CSS. */
  if (existsSync(cssFile)) {
    const lines = read(cssFile).split(/\r?\n/);
    const inComment = commentLines(lines);
    lines.forEach((line, index) => {
      if (inComment[index]) return;
      const spacing = line.match(/\bletter-spacing\s*:\s*([^;]+)/);
      if (
        spacing &&
        isPositiveTracking(spacing[1].trim()) &&
        !spacing[1].includes("var(")
      ) {
        fail(`${slug}:${index + 1}: positive letter-spacing in CSS.`);
      }
      const alpha = /(^|[;{\s])color\s*:\s*[^;]*color-mix\([^;]*transparent/.test(line);
      if (alpha && !CSS_ALPHA_ALLOW.has(`${slug}|${line.trim()}`)) {
        fail(`${slug}:${index + 1}: alpha color on text in CSS.`);
      }
    });
  }

  if (existsSync(readmeFile)) {
    const readme = read(readmeFile);
    if (!readme.includes(`@farsify/${slug}`)) {
      fail(`${slug}: README has no install command.`);
    }
    if (!readme.includes("## Props")) fail(`${slug}: README has no props table.`);
    englishOnly(`${slug}/README.md`, readme);
  }
}

/* Component counts in the root README */
const total = dirs.length;
const readme = read(path.join(ROOT, "README.md"));
const countMatch = readme.match(/\*\*([0-9]+) components\*\*/);
if (!countMatch) {
  fail("README.md: component count pattern not found.");
} else if (Number(countMatch[1]) !== total) {
  fail(`README.md: says ${countMatch[1]} components, found ${total}.`);
}

/* The README badge carries the same number and drifts just as easily. */
const badgeMatch = readme.match(/badge\/components-([0-9]+)-/);
if (badgeMatch && Number(badgeMatch[1]) !== total) {
  fail(`README.md: the components badge says ${badgeMatch[1]}, found ${total}.`);
}
for (const category of CATEGORIES) {
  const match = readme.match(new RegExp(`\\| [^|]+ \\| \`${category}\` \\| ([0-9]+) \\|`));
  if (!match) {
    fail(`README.md: missing the "${category}" category row.`);
    continue;
  }
  if (Number(match[1]) !== byCategory[category]) {
    fail(`README.md: category "${category}" says ${match[1]}, found ${byCategory[category]}.`);
  }
}
/* The component index must list every folder and the same counts. */
const indexFile = path.join(COMPONENTS, "README.md");
if (!existsSync(indexFile)) {
  fail("components/README.md is missing.");
} else {
  const index = read(indexFile);
  const listed = [...index.matchAll(/\]\(([a-z0-9-]+)\/\)/g)].map((match) => match[1]);
  const uniqueListed = new Set(listed);
  if (listed.length !== uniqueListed.size) {
    fail("components/README.md: duplicate entries.");
  }
  const missing = dirs.filter((slug) => !uniqueListed.has(slug));
  const unknown = [...uniqueListed].filter((slug) => !dirs.includes(slug));
  if (missing.length) fail(`components/README.md: missing ${missing.join(", ")}.`);
  if (unknown.length) fail(`components/README.md: unknown ${unknown.join(", ")}.`);

  const totalClaim = index.match(/\*\*([0-9]+) components\*\*/);
  if (!totalClaim) {
    fail("components/README.md: component count pattern not found.");
  } else if (Number(totalClaim[1]) !== total) {
    fail(`components/README.md: says ${totalClaim[1]} components, found ${total}.`);
  }

  const labels = {
    Inputs: "inputs",
    Buttons: "actions",
    Navigation: "navigation",
    "Loaders & status": "status",
    Showcase: "showcase",
  };
  for (const [label, id] of Object.entries(labels)) {
    const match = index.match(new RegExp(`^## ${label} \\((\\d+)\\)$`, "m"));
    if (!match) {
      fail(`components/README.md: missing the "${label}" section.`);
    } else if (Number(match[1]) !== byCategory[id]) {
      fail(`components/README.md: "${label}" says ${match[1]}, found ${byCategory[id]}.`);
    }
  }
}

englishOnly("README.md", readme);
englishOnly("CONTRIBUTING.md", read(path.join(ROOT, "CONTRIBUTING.md")));
englishOnly("components/README.md", read(indexFile));

/* Image references in the root README */
for (const match of readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
  const src = match[1];
  if (src.startsWith("https://img.shields.io/")) continue;
  if (src.startsWith("http")) fail(`README.md: external image ("${src}").`);
  else if (!existsSync(path.join(ROOT, src))) fail(`README.md: image "${src}" is missing.`);
}

/* Legal and contribution files */
for (const file of ["LICENSE.md", "CONTRIBUTING.md"]) {
  if (!existsSync(path.join(ROOT, file))) fail(`${file} is missing.`);
}

/* Template files must be English too */
for (const file of walk(path.join(ROOT, ".github"))) {
  if (!/\.(md|yml|yaml)$/.test(file)) continue;
  englishOnly(path.relative(ROOT, file), read(file));
}

const files = existsSync(COMPONENTS) ? walk(COMPONENTS).length : 0;

/* Physical direction is a warning: drag physics and centering use it on purpose. */
if (warnings.length) {
  console.log(
    `\u26a0 ${warnings.length} physical-direction warning(s), not gating:`,
  );
  for (const warning of warnings.slice(0, 10)) console.log(`  - ${warning}`);
  if (warnings.length > 10) console.log(`  ... ${warnings.length - 10} more`);
}

if (problems.length) {
  console.error(`\u2717 ${problems.length} problem(s) found:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `\u2713 All good — ${total} components in ${CATEGORIES.length} categories, ${files} files.`,
);
