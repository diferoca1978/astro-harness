# harness/ — runtime-neutral agent generation

This scaffold is opened with two agent runtimes today — Claude Code and
opencode. The six specialist subagent roles (`coder`, `reviewer`, `research`,
`git-ops`, `memory-ops`, `spec-verifier`) are authored **once**, in `agents/`,
using the vocabularies below. `harness/bind-runtime.sh <runtime>` reads that
neutral source plus `harness/runtimes/<runtime>.json` and generates each
runtime's native agent format.

See `AGENTS.md` § "Orchestration model" for how these roles are used, and
`specs/02-agents-runtime-neutral.md` for why this exists.

## Tier vocabulary

Each role file declares exactly one `tier:` in its frontmatter — never a
concrete model string. The concrete string per tier lives once per runtime,
in `harness/runtimes/<runtime>.json`.

| Tier       | Meaning                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| `fast`     | Cheap, mechanical work — git operations, memory read/write, spec verification |
| `standard` | Everyday implementation and review work — writing code, research, refactors |
| `deep`     | Manual escalation only, for genuinely hard work that stays in the main session (ambiguous architecture, complex planning, advanced shader/Three.js work) — not assigned to any subagent role by default |

Why indirection instead of raw model IDs: per-role cost is a deliberate
property of this harness (the specialists run cheap on purpose so an
orchestrator session isn't the most expensive part of every run). Keeping the
tier→model mapping in one file per runtime means a model swap is a one-line
edit instead of a grep-and-replace across role prose.

## Capability vocabulary

Each role file may declare a `capabilities:` list in its frontmatter, using
only these seven values:

| Capability  | Meaning                                                        |
| ----------- | --------------------------------------------------------------- |
| `read`      | Read files (`Read`, `Grep`, `Glob`)                              |
| `edit`      | Write/modify files (`Edit`, `Write`, `NotebookEdit`)             |
| `exec`      | Run shell commands (`Bash`)                                      |
| `web`       | Fetch or search the web (`WebFetch`, `WebSearch`)                |
| `skills`    | Invoke packaged skills (`Skill`)                                  |
| `docs`      | Look up current library/framework documentation (Context7)       |
| `memory`    | Read/write persistent memory (Engram)                            |

A role that omits `capabilities` entirely inherits everything — this is how
`coder` behaves today (no `tools:` line in its Claude Code frontmatter) and
is preserved as-is.

**The mapping is lossy by design going into opencode.** opencode's
`permission` model is coarser than Claude Code's per-tool `tools:` list, so
`bind-runtime.sh` maps each capability to the closest opencode permission
grant rather than reproducing an exact tool list. This is a documented
degradation, not a bug — see `specs/02-agents-runtime-neutral.md` §
"Decisions made and discarded".

## Files

- `agents/*.md` — the runtime-neutral source. Frontmatter only:
  `description`, `tier`, `capabilities`. Bodies are prose, carried verbatim
  into every generated output.
- `harness/runtimes/claude-code.json`, `harness/runtimes/opencode.json` —
  per-runtime `agentDir` (where generated files land) and a `tiers` map
  (`fast` / `standard` / `deep` → a concrete model string for that runtime).
- `harness/bind-runtime.sh <runtime>` — generator. Reads `agents/*.md` +
  `harness/runtimes/<runtime>.json`, writes that runtime's native agent
  files. Run it again any time a role file or a runtime's model strings
  change; both `.claude/agents/` and `.opencode/agent/` are **committed**
  generated output, not gitignored (the provisioning flow that ships this
  scaffold to a client repo drops `.git` and everything uncommitted, so an
  ignored output directory would ship every new client with zero
  specialists).

## Adding a role or a runtime

- **New role:** add `agents/<role>.md` with a `tier` and (optionally)
  `capabilities`, then re-run `bind-runtime.sh` for every runtime.
- **New runtime:** add `harness/runtimes/<runtime>.json` and a matching
  `case` branch in `bind-runtime.sh`. An explicit `case` per runtime, not a
  templating engine, is deliberate for two runtimes — revisit only if a
  third or fourth appears.
