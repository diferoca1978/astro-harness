# 08 — add-module-mechanism

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

Build the `add-module` mechanism: a way to copy an optional module's files into
a client project and patch the core's extension points with a single marked
line, so a client that needs a module (starting with the planned blog module,
spec 09) gets it without hand-editing shared files. This spec ships the
mechanism only — no real module. It also marks the one extension point that
already exists (`EXTRA_SECTIONS` in `src/utils/llms.ts`, from spec 07) so the
mechanism has a genuine target from day one.

## Scope

**In:**

- `harness/modules/README.md` (new): documents the module directory
  convention, the `patch.json` shape, the extension-point marker format, and
  the registry of extension points that exist today (`llms-extra-sections`).
- `src/utils/llms.ts`: one new marker-comment line, `// add-module:llms-extra-sections`,
  immediately above `export const EXTRA_SECTIONS: string[] = [];`.
- `~/scripts/add-module.sh` (new, outside this repo — same convention as
  `install-harness.sh`): copies a module's files into a target project and
  applies its patches, guarded by a clean/up-to-date check on the local
  `~/astro-harness` checkout.
- `~/scripts/setup-client-project.sh` (edit, outside this repo): one new line,
  `rm -rf harness/modules`, next to its existing `rm -rf .git`.
- `AGENTS.md`: a new "Modules" section, a Knobs map row, and two new
  "If you change X → update Y" rows.

**Out:**

- **The blog module itself.** Planned spec 09. This spec proves the mechanism
  with a throwaway probe module, never committed.
- **Any real, shipped module.** `harness/modules/` holds only its `README.md`
  after this spec — no module directory ships. A trivial example module was
  considered and rejected (see **Decisions**): it risks being mistaken for
  something a client should actually use.
- **Removing an installed module.** Per the plan's known risk, uninstall stays
  manual (delete the module's files, revert its patch, remove its `MODULES.md`
  line by hand). No `remove-module` command.
- **A `--force` overwrite flag on `add-module.sh`.** Re-running is idempotent
  (skip what is already there); there is no path that overwrites a file a
  previous run already placed.
- **Patching more than one line per extension point, or multiple files per
  patch entry.** The marker mechanism only ever replaces the single line
  after its marker. A module that needs more than that does not fit this
  mechanism as designed — that is a real constraint, not an oversight (see
  **Decisions**).
- **Solving how the blog module's dynamic post list actually reaches
  `EXTRA_SECTIONS`.** That is spec 09's problem to solve within the one-line
  constraint this spec fixes; this spec's own probe only proves the
  find-marker/replace-line/verify-first mechanics with a static string.
- **`install-harness.sh`.** Unrelated (legacy adaptation, no modules
  concept); untouched.
- **The relationship between `astro-harness` and the `diferoca1978/astro-boilerplate`
  template repo** that `setup-client-project.sh` clones from. Out of scope by
  explicit decision — the edit to that script is the one line named above,
  nothing else.
- **New `harness/check-seo.mjs` rules.** No module ships, so there is no new
  page shape to check yet; spec 09 revisits this if the blog module needs it.
- **Running `add-module` against legacy (non-scaffold-origin) projects.** Per
  the plan (decision 16), this mechanism applies only to projects created from
  the scaffold after spec 06.

## Files affected

- **`harness/modules/README.md`** (new). Documents, for whoever authors a
  module later (starting with spec 09):

  - **Directory convention:** a module lives at `harness/modules/<name>/`
    with two things:
    - `src/` — mirrors the destination tree 1:1. Every file under
      `harness/modules/<name>/src/...` is copied to `<target>/src/...` in the
      client project, preserving the relative path.
    - `patch.json` — an array of one-line patches:
      ```json
      [
        {
          "point": "llms-extra-sections",
          "file": "src/utils/llms.ts",
          "insert": "<the exact line to write>"
        }
      ]
      ```
      `point` is the marker id, `file` is the path (relative to the target
      project root) that carries that marker, and `insert` is the exact
      line `add-module.sh` writes in place of the line after the marker.
  - **Extension-point marker format:** a core file marks a patchable line by
    placing `// add-module:<point-id>` on the line immediately above it.
    `add-module.sh` finds the marker, then reads/replaces the line right
    after it — never anything else in the file. A marker with no
    corresponding `patch.json` entry from an installed module is inert and
    causes no problem; a `patch.json` entry whose `point` has no marker in
    the target file makes the whole install abort (see the script's
    behavior below).
  - **Registry of extension points that exist today:**

    | Point id              | File                | Line it precedes                              | Added by                            |
    | --------------------- | ------------------- | --------------------------------------------- | ----------------------------------- |
    | `llms-extra-sections` | `src/utils/llms.ts` | `export const EXTRA_SECTIONS: string[] = [];` | spec 07 (marker added by this spec) |

  - **What this mechanism does not do:** remove a module, patch more than one
    line per extension point, or overwrite a file `add-module.sh` already
    placed on a previous run.

- **`src/utils/llms.ts`** — one line added, immediately above the existing
  `export const EXTRA_SECTIONS: string[] = [];` (no other change to the
  file):

  ```ts
  // add-module:llms-extra-sections
  export const EXTRA_SECTIONS: string[] = [];
  ```

- **`~/scripts/add-module.sh`** (new). Usage:
  `add-module.sh <module-name> <path-to-client-project>`. Behavior, in
  order — each stage fully completes (or the whole run aborts with nothing
  changed) before the next starts:

  1. **Validate arguments:** both `<module-name>` and `<path-to-client-project>`
     given; the target looks like an Astro project (same `package.json`
     check `install-harness.sh` already uses); `harness/modules/<module-name>/`
     exists under the source checkout.
  2. **Guard the source checkout.** `HARNESS_SOURCE="${ADD_MODULE_SOURCE:-$HOME/astro-harness}"`
     (the `ADD_MODULE_SOURCE` override exists only so this spec's acceptance
     probes can point at a disposable temp clone instead of the real
     checkout — see **Decisions**; real usage always resolves to
     `$HOME/astro-harness`, same as `install-harness.sh`'s `HARNESS_SOURCE`).
     Abort, changing nothing, when either is true:
     - `git -C "$HARNESS_SOURCE" status --porcelain` is non-empty (dirty
       checkout);
     - `git -C "$HARNESS_SOURCE" rev-list HEAD..origin/main --count` is
       greater than `0` (local HEAD is behind `origin/main` — being _ahead_,
       i.e. unpushed local commits, is not a reason to block).
       There is no override flag for this guard (**Decisions**).
  3. **Verify every extension point the module needs, before touching
     anything.** For each entry in `harness/modules/<module-name>/patch.json`,
     confirm `<target>/<file>` exists and contains a line exactly
     `// add-module:<point>`. If any are missing, abort with nothing copied
     or patched, and the error names every missing `(point, file)` pair.
  4. **Copy files.** For every file under `harness/modules/<module-name>/src/`,
     copy it to `<target>/src/<same relative path>`, creating directories as
     needed. A destination that already exists is left alone and reported as
     skipped (idempotent — the same `copy_file` skip behavior
     `install-harness.sh` already has, no `--force`).
  5. **Apply patches.** For each `patch.json` entry, replace the line
     immediately after its marker in `<target>/<file>` with `insert`. If that
     line already equals `insert`, skip it (already applied — idempotent). If
     it equals neither the original core value nor `insert`, abort listing
     the file (it was hand-edited since the marker was added, and blind
     overwrite here would eat that edit).
  6. **Record the install.** Create `<target>/MODULES.md` if it does not
     exist yet, with a one-line header explaining the file (see its content
     below). Append one line for `<module-name>` unless a line for that
     module name is already present (idempotent — no duplicate on a
     re-run):
     `- <module-name> — installed from astro-harness@<short-sha> on <YYYY-MM-DD>`,
     where `<short-sha>` is `git -C "$HARNESS_SOURCE" rev-parse --short HEAD`.
  7. **Print a summary** (same emoji/section style as `install-harness.sh`):
     files copied vs. skipped, patches applied vs. skipped, and the
     `MODULES.md` line written (or "already recorded").
  8. **Never runs git in the target project.** It only writes files; the user
     reviews and commits as usual (same as `install-harness.sh`).

  `<target>/MODULES.md` header, written once on first install:

  ```markdown
  # Installed modules

  One line per module installed via `add-module.sh`. Removing a module is
  manual today: delete its files, revert its patch, remove its line here.
  ```

- **`~/scripts/setup-client-project.sh`** — one line added next to the
  existing `rm -rf .git` (today at line 92):

  ```bash
  rm -rf harness/modules
  ```

  No other change. `setup-client-project.sh` clones from the
  `diferoca1978/astro-boilerplate` template, not from a local `astro-harness`
  checkout; how that template repo relates to this one is out of scope here
  (**Scope → Out**).

- **`AGENTS.md`**
  - **New section, "## Modules — installed on demand with `add-module`"**
    (placed after "### Contact forms (manual, per client)", the closest
    existing precedent: infrastructure a client only gets when it actually
    needs it). Explains:
    - modules live in `harness/modules/<name>/` in this repo, and ship
      nothing to a client by default (`setup-client-project.sh` strips the
      folder from every clone);
    - a client gets one by running `~/scripts/add-module.sh <name> <path>`,
      which copies the module's files and patches the core's marked
      extension points;
    - installed modules are recorded in the client's own `MODULES.md`;
    - see `harness/modules/README.md` for the extension-point marker
      convention and the current registry.
  - **Knobs map:** a new row —
    > | Modules (e.g. a future blog) | `harness/modules/<name>/` (source, in this repo) · installed into a client via `~/scripts/add-module.sh` → files land in their normal `src/` location, tracked in the client's `MODULES.md` | `harness/modules/README.md`; run manually only when a client's brief needs the module |
  - **"If you change X → update Y":** two new rows —
    > | Add or change a module under `harness/modules/<name>/` | `harness/modules/README.md`, if the directory or `patch.json` convention itself changes |
    > | Add, remove or rename a core extension-point marker (`// add-module:<point-id>`) | `harness/modules/README.md`'s registry table · every module's `patch.json` that targets it |

**Unchanged on purpose:**

- `install-harness.sh`. No modules concept for legacy adaptation.
- `harness/check-seo.mjs`. No new page shape ships in this spec.
- `src/pages/llms.txt.ts`. It already reads `EXTRA_SECTIONS`; the marker
  comment added to `llms.ts` changes no behavior.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- No existing row covers adding a module mechanism or a core extension-point
  marker — this spec adds both rows itself (**Files affected**), the same
  move specs 06 and 07 made for their own new concepts.
- "Add, remove or rename a builder in `src/utils/llms.ts`... or change what
  `src/pages/llms.txt.ts` includes" (spec 07's row): not triggered — the
  marker comment changes no builder's signature or output.

## Decisions made and discarded

- **A module's files mirror the destination `src/` tree 1:1; no manifest for
  file copying.** Self-documenting, and matches `install-harness.sh`'s
  existing `copy_file`/`copy_dir` pattern.
  - _Discarded: a manifest of explicit src→dest pairs._ More flexible (could
    target outside `src/`) but adds a format with no real need yet — every
    module file this scaffold can imagine lands under `src/`.

- **A core extension point is marked with an inline `// add-module:<id>`
  comment, not a central registry file.** One file to read per point, no
  second source of truth that can drift from the code it describes.
  `harness/modules/README.md`'s table is documentation for humans, not a
  file the script reads.
  - _Discarded: `harness/extension-points.json`._ It would need to stay in
    sync with the marker's real location by hand, the same drift risk
    `AGENTS.md`'s own "Evolving the scaffold" section warns about for prose.

- **A module declares its patches as data (`patch.json`), not as a shell
  script.** The mechanism can verify every required point exists _before_
  changing anything, and review only ever has to read JSON, never audit
  arbitrary bash per module.
  - _Discarded: an `install.sh` per module._ More powerful, but it moves the
    "does this fit the target core" check from the shared script into each
    module's own hand-written logic — exactly the frailty the plan's known
    risk ("parchear archivos compartidos es frágil") warns about.

- **This spec marks `EXTRA_SECTIONS` now, not in spec 09.** It is a
  comment-only, non-behavioral edit to a file this spec is already touching
  conceptually (it is the one existing extension point), and it gives the
  acceptance probes a real target instead of a fabricated one.
  - _Discarded: leaving `llms.ts` untouched and inventing a fake marker only
    inside the probe's own temp copy._ That would prove the mechanism works
    on a file nothing real ever uses.

- **Re-running `add-module` for an already-installed module is idempotent
  (skip what's already there), not a hard refusal.** Safe to re-run after a
  partial failure (e.g. the guard tripped, or a later file failed to copy
  for an unrelated OS reason).
  - _Discarded: detect via `MODULES.md` and refuse outright._ It would turn
    a harmless re-run into a manual cleanup exercise.

- **Verify every required extension point before copying or patching
  anything (verify-then-apply), not best-effort inline.** Directly answers
  the plan's own flagged risk: "un módulo más reciente que el núcleo del
  cliente puede no encajar." A mismatched module must fail closed, before
  the target tree is touched at all.
  - _Discarded: best-effort, patch what you can._ Leaves a target with some
    module files copied and no patch applied — an install that is neither
    clearly done nor clearly untouched.

- **The install record is a new `MODULES.md` in the client project, not an
  addition to `client-gaps.md` or `CHECKPOINTS.md`.** It is install
  metadata (what got installed, from which scaffold commit), not a content
  gap or a pre-production checklist item.
  - _Discarded: `client-gaps.md`._ That file's whole point is "what the
    brief didn't answer"; a module install isn't a gap.

- **No override flag for the source-checkout guard.** Matches the
  scaffold's no-shortcuts convention (no `--no-verify` equivalent anywhere
  else in this repo's tooling). This is a low-frequency, manual, one-person
  operation — the guard costs nothing to keep unconditional.
  - _Discarded: `--allow-dirty`._ It is exactly the kind of flag that turns
    into muscle memory and defeats the guard's purpose.
  - **`ADD_MODULE_SOURCE` is a different knob, not a guard bypass.** It only
    changes _which_ checkout the (still fully enforced) guard checks —
    needed so this spec's own acceptance probes can run against a disposable
    temp clone instead of mutating the real `~/astro-harness` working tree.
    Real invocations never set it, so default behavior (`$HOME/astro-harness`,
    guarded, no bypass) is identical to having no override at all.

- **`harness/modules/` ships only its `README.md` in this spec — no real or
  example module.** A trivial example module was considered, to double as a
  living smoke test, and rejected: it risks being copied by a client by
  mistake, or mistaken for a real, supported feature. The mechanism is
  instead proven with a throwaway probe module built in a temp copy during
  implementation and verification, never committed — the same treatment
  specs 06 and 07 gave their own temp probes.

- **The `setup-client-project.sh` edit is the one line named above, nothing
  more.** That script clones from a separate template repo
  (`diferoca1978/astro-boilerplate`); reasoning about how that repo tracks
  `astro-harness` is a different problem, explicitly out of scope.

- **`AGENTS.md` gets a standalone "Modules" section, not just table rows.**
  The mechanism is a new, ongoing concept in the harness (like "Contact
  forms"), not merely a footnote on an existing table — someone reading
  `AGENTS.md` cold needs to learn that modules exist and where to look
  before the tables mean anything to them.

- **The one-line-patch constraint is kept as a hard limit of this mechanism,
  not relaxed to fit a guess at spec 09's needs.** How the blog module
  actually gets its dynamic content into `EXTRA_SECTIONS` within a single
  replaced line is spec 09's problem to solve; inventing that answer now
  would mean designing the blog module's data flow inside the spec that is
  only supposed to build the generic mechanism.

## Acceptance criteria

All probes run in disposable temp directories outside the repo, deleted
after use. `git status --short` in this repo must be empty when done.

**Source shape**

- [x] `harness/modules/README.md` exists and documents, checked by reading:
      the `src/` mirror convention, the `patch.json` shape (`point`, `file`,
      `insert`), the `// add-module:<point-id>` marker format, and a
      registry table naming `llms-extra-sections`.
- [x] `grep -c '// add-module:llms-extra-sections' src/utils/llms.ts` prints
      `1`, and the line immediately after it
      (`sed -n '/add-module:llms-extra-sections/{n;p}' src/utils/llms.ts`)
      is exactly `export const EXTRA_SECTIONS: string[] = [];`.
- [x] `~/scripts/add-module.sh` exists and is executable
      (`test -x ~/scripts/add-module.sh`).
- [x] `grep -c 'rm -rf harness/modules' ~/scripts/setup-client-project.sh`
      prints `1`.
- [x] `AGENTS.md`:
  - `grep -c '## Modules' AGENTS.md` prints at least `1`;
  - `grep -c 'add-module.sh' AGENTS.md` prints at least `2` (the new section
    plus the Knobs map row);
  - `grep -c 'harness/modules' AGENTS.md` prints at least `2` (the Knobs map
    row plus at least one "If you change X → update Y" row).

**Mechanism probes** (temp clone of this repo at current `HEAD`, used as
`ADD_MODULE_SOURCE`; a separate temp copy of the scaffold as the install
target, set up with `pnpm install --frozen-lockfile` the way spec 06's
`local`-profile probe already does)

- [x] **Happy path.** Add a throwaway probe module to the temp clone:
      `harness/modules/prueba/src/pages/prueba-modulo.astro` (trivial static
      content) and
      `harness/modules/prueba/patch.json`:
      `json
  [{ "point": "llms-extra-sections", "file": "src/utils/llms.ts", "insert": "export const EXTRA_SECTIONS: string[] = [linkList('Prueba', [{ title: 'Módulo de prueba' }])];" }]
  `
      Commit it in the temp clone (so the guard's dirty check passes; the
      clone is then ahead of, not behind, its own `origin/main`, which the
      guard allows). Run
      `ADD_MODULE_SOURCE=<temp-clone> add-module.sh prueba <target>`. Then,
      in `<target>`:
  - `src/pages/prueba-modulo.astro` exists with the copied content;
  - `src/utils/llms.ts`'s `EXTRA_SECTIONS` line equals the `insert` value
    above;
  - `MODULES.md` exists and its one line names `prueba` and the temp
    clone's short SHA;
  - `pnpm build` succeeds and `dist/llms.txt` contains `## Prueba`;
  - `node harness/check-seo.mjs --dist dist` exits `0`.
- [x] **Idempotent re-run.** Running the same command again against the same
      `<target>` exits `0`, changes no file (`git status --short` in
      `<target>` after the run, ignoring the untracked `dist/`, is unchanged
      from before the re-run), and `MODULES.md` still has exactly one line
      for `prueba`.
- [x] **Missing extension point.** In a fresh copy of the target (probe
      module unchanged), temporarily remove the
      `// add-module:llms-extra-sections` line from the copy's
      `src/utils/llms.ts`. The same command exits non-zero, names
      `llms-extra-sections` and `src/utils/llms.ts` in its error, and
      leaves the copy's `src/` tree and `MODULES.md` exactly as they were
      (nothing copied, nothing patched).
- [x] **Dirty source guard.** With the probe module still present, make an
      uncommitted change in the temp clone (e.g. touch a tracked file). The
      command exits non-zero before touching `<target>`, and its message
      says the source checkout is dirty.
- [x] **Stale source guard.** Revert the uncommitted change. Push the temp
      clone to a throwaway bare remote as its `origin`, then reset the temp
      clone's local `main` one commit behind that remote (so `HEAD` is
      behind `origin/main`). The command exits non-zero before touching
      `<target>`, and its message says the checkout is behind `origin/main`.
- [x] Delete the temp clone, the throwaway bare remote and the target copy.

**Gate**

- [x] `pnpm verify` exits `0` on the spec branch.
- [x] `git status --short` and `git diff dev --name-only`, together, list
      only these files:
  - `harness/modules/README.md`
  - `src/utils/llms.ts`
  - `AGENTS.md`
  - this spec

  (`~/scripts/add-module.sh` and `~/scripts/setup-client-project.sh` live
  outside this repo and so are not part of this diff — see "Harness tooling
  lives outside the repo.")

## Implementation plan

1. Create `feature/08-add-module-mechanism` from `dev`. `/spec-impl` does
   this per `specs/.spec-config.yml`. Confirm `git status` is clean.
2. Add the marker comment to `src/utils/llms.ts`. Run `pnpm build` to
   confirm the output is unchanged.
3. Write `harness/modules/README.md`: the directory convention, the
   `patch.json` shape, the marker format, and the registry table.
4. Write `~/scripts/add-module.sh`: argument validation, the source-checkout
   guard, verify-then-apply, file copy, patch application, `MODULES.md`
   handling, and the summary print.
5. Edit `~/scripts/setup-client-project.sh`: add the `rm -rf harness/modules`
   line.
6. Run the happy-path probe, then the idempotent re-run, the missing-point
   probe, the dirty-guard probe and the stale-guard probe, in that order.
   Delete every temp clone, remote and target copy afterward.
7. Apply the `AGENTS.md` edits: the new "Modules" section, the Knobs map
   row, and the two "If you change X → update Y" rows.
8. Run `pnpm verify`.
