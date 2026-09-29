# harness/modules/ — optional modules, installed on demand

A **module** is a self-contained bundle of files a client project can opt
into after it needs them — starting with the planned blog module (spec 09).
Nothing under `harness/modules/` ships to a client by default:
`setup-client-project.sh` strips the whole directory on every clone. A
client gets a module only when someone runs
`~/scripts/add-module.sh <name> <path-to-client-project>`, which copies the
module's files into the target and patches the core's marked extension
points to wire them in. See `AGENTS.md` § "Modules" for when and why to use
one.

## Directory convention

A module lives at `harness/modules/<name>/` with two things:

- **`src/`** — mirrors the destination tree 1:1. Every file under
  `harness/modules/<name>/src/...` is copied to `<target>/src/...` in the
  client project, preserving the relative path. No manifest — the tree
  shape *is* the mapping.
- **`patch.json`** — an array of one-line patches:

  ```json
  [
    {
      "point": "llms-extra-sections",
      "file": "src/utils/llms.ts",
      "insert": "<the exact line to write>"
    }
  ]
  ```

  - `point` — the marker id the patch targets (see "Extension-point marker
    format" below).
  - `file` — the path, relative to the target project root, that carries
    that marker.
  - `insert` — the exact line `add-module.sh` writes in place of the line
    immediately after the marker.

## Extension-point marker format

A core file marks a patchable line by placing `// add-module:<point-id>` on
the line immediately above it. `add-module.sh` finds the marker, then
reads/replaces **only** the single line right after it — never anything
else in the file.

- A marker with no corresponding `patch.json` entry from an installed
  module is inert and causes no problem.
- A `patch.json` entry whose `point` has no marker in the target file makes
  the whole install abort before anything is copied or patched (verify
  every required point first, then apply).

## Registry of extension points that exist today

| Point id              | File                | Line it precedes                              | Added by                            |
| ---------------------- | ------------------- | ---------------------------------------------- | ------------------------------------ |
| `llms-extra-sections`  | `src/utils/llms.ts` | `export const EXTRA_SECTIONS: string[] = [];`   | spec 07 (marker added by spec 08)    |

## What this mechanism does not do

- **Remove a module.** Uninstall is manual today: delete the module's
  files, revert its patch, remove its line from the client's `MODULES.md`
  by hand.
- **Patch more than one line per extension point, or multiple files per
  patch entry.** A module that needs more than a single replaced line does
  not fit this mechanism as designed.
- **Overwrite a file `add-module.sh` already placed on a previous run.**
  Re-running is idempotent — it skips what is already there. There is no
  `--force` flag.
