# 02 — agents-runtime-neutral

**Status:** Approved <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

This scaffold is worked on with **two agent runtimes today** — Claude Code and
opencode — but its six specialist subagents exist in exactly one of them.
`AGENTS.md` § "Orchestration model" (lines 242-291) describes an orchestrator
that delegates to `coder`, `reviewer`, `research`, `git-ops`, `memory-ops`
and `spec-verifier`, and states they "live in `.claude/agents/` and travel
with every clone". Verified against the real environment:

- opencode reads `AGENTS.md` **natively** (no `CLAUDE.md` pointer needed), so
  it receives that whole contract.
- `~/.config/opencode/` has `commands/git-workflow.md` and an `opencode.jsonc`
  — but **no `agent/` or `agents/` directory**, globally or per-project.
- This repo has no `.opencode/` at all.

So when this scaffold is opened with opencode, the contract promises an
orchestration model that does not exist in that runtime. That is the bug this
spec fixes. It is present today, not a future concern.

A second, smaller problem shares the same root: the model name for each role
is written in six separate files (`.claude/agents/*.md:4`), plus twice more in
`AGENTS.md` prose (lines 255-266, 285-291) and once in `coder.md:61`. That
violates this repo's own Knobs-map rule — _"one home per per-client thing
(never duplicate) … that creates drift"_ — and it is the same failure shape
that already bit a client repo once, documented in `AGENTS.md` § "Evolving the
scaffold": _"exactly how a past client repo ended up with `AGENTS.md` still
describing GSAP after it had already been removed from `package.json`."_

Both are fixed by the same move: make `agents/` the single neutral source and
generate each runtime's native format from it.

## Scope

**In:**

- New `agents/` directory: the six role files with runtime-neutral frontmatter
  (`description`, `tier`, `capabilities`). Bodies carried over **verbatim** —
  they already contain no vendor-specific content.
- New `harness/runtimes/claude-code.json` and `harness/runtimes/opencode.json`:
  per-runtime `agentDir` plus a `tiers` map (`fast` / `standard` / `deep` →
  a concrete model string).
- New `harness/bind-runtime.sh <runtime>`: reads `agents/*.md` + the runtime's
  JSON, emits that runtime's native agent files.
- Generated `.claude/agents/*.md` and `.opencode/agent/*.md`, **both committed**
  (see Decisions).
- Replace raw MCP tool IDs in role prose with capability phrasing
  (`agents/research.md`, `agents/spec-verifier.md`).
- Replace the `/model opus` escalation instruction in `agents/coder.md:61`
  with tier language.
- `AGENTS.md`: routing-table `Model` column → `Tier`; de-vendor the
  "Orchestrator model" block; add a Knobs-map row for "model per role"; add an
  "If you change X → update Y" row for role changes.
- `harness/README.md`: document the tier and capability vocabularies.

**Out:**

- **Any Engram fallback work.** The original design assumed Engram was
  Claude-Code-only and needed a `docs/decisions.md` fallback. Verified false:
  `~/.config/opencode/opencode.jsonc` declares `engram` as a local MCP server.
  Engram already runs on both runtimes; `AGENTS.md` § "Where state & memory
  live" is correct as written and is not touched.
- **Context7 availability work.** Same finding — it is declared as a remote
  MCP server in the same file. Only the _tool-ID naming_ in role prose is in
  scope, not the integration.
- Codex CLI, Gemini CLI, Cursor, or any third runtime. The generator gets a
  `case` per runtime; adding a third is a later, cheap change.
- Re-deciding which tier each role belongs to. The current haiku/sonnet split
  is preserved exactly as-is; this spec changes how it is _expressed_, not
  what it _says_.
- Rotating the Context7 API key currently in cleartext at
  `~/.config/opencode/opencode.jsonc`. Real, but outside this repo.
- `install-harness.sh` / the `adapt-harness` skill path for legacy projects.

## Files affected

**New:**

- `agents/{coder,reviewer,research,git-ops,memory-ops,spec-verifier}.md`
- `harness/runtimes/claude-code.json`, `harness/runtimes/opencode.json`
- `harness/bind-runtime.sh`
- `harness/README.md` (tier + capability vocabularies)
- `.opencode/agent/*.md` (generated, committed)

**Modified:**

- `.claude/agents/*.md` — become generated output. Bodies must survive
  byte-identical; frontmatter is rewritten by the generator.
- `AGENTS.md`:
  - line 242 — `## Orchestration model (Claude Code subagents)` → drop the
    parenthetical; the note below it should name Claude Code **and** opencode
    as runtimes with real subagents.
  - lines 255-266 — "Orchestrator model" block: replace Sonnet/Opus naming and
    `/model opus` with tier language, pointing at `harness/runtimes/`.
  - lines 285-291 — routing table: `Model` column → `Tier`; `haiku`/`sonnet`
    values → `fast`/`standard`.
  - Knobs map (~line 120) — add the missing row.
  - "If you change X → update Y" (~line 330) — add the missing row.
- `.gitignore` — **unchanged on purpose.** Explicitly not adding `.claude/`
  or `.opencode/` (see Decisions).

**Match against `AGENTS.md`'s "If you change X → update Y" table:** none of
the existing rows cover this. The closest, _"Change folder conventions →
Components section · the structure note in `front-end-astro` SKILL.md"_, is
about `src/` layout, not the agent apparatus. This change must therefore add
a row as part of itself:

> | Add or change a subagent role, its tier, or add a runtime | `agents/<role>.md` · `harness/runtimes/*.json` · re-run `bind-runtime.sh` for **every** runtime · commit the regenerated output · **Orchestration model** routing table |

## Decisions made and discarded

- **Tier indirection over raw model IDs.** Roles declare `tier: fast |
standard | deep`; the concrete string lives once per runtime.
  _Discarded — Option B: delete every `model:` line_ so each runtime uses its
  session default. Simpler (ten minutes, no generator at all), and it is
  already the de-facto state on opencode, whose `opencode.jsonc` pins no
  model. Rejected because it throws away an explicit, reasoned position in
  `AGENTS.md:257`: _"the specialists already run on cheaper models — an Opus
  orchestrator would be the single most expensive part of every session for a
  small-business landing site."_ Per-role cost is a deliberate property of
  this harness; Option B silently discards it. **If that premise ever stops
  holding, Option B is the correct simplification and this spec should be
  reverted, not patched.**

- **`.opencode/agent/` inside each repo, not `~/.config/opencode/agent/`.**
  _Discarded — global agents:_ they would not need binding per clone, but
  `AGENTS.md:252` promises the specialists "travel with every clone", and a
  global `coder` cannot differ between a GSAP client and a vanilla one — which
  `coder.md` § "Skill routing" requires it to do.

- **Commit the generated output; do not gitignore it.** _Discarded —
  gitignoring `.claude/` and `.opencode/`:_ the standard reflex, and wrong
  here. The external provisioning script does `git clone --depth 1` →
  `rm -rf .git` → push to the client repo, so anything uncommitted never
  reaches a client. Ignoring the generated dirs would ship every new client
  repo with zero specialists until someone remembered a command. The source
  and both outputs are all committed; `bind-runtime.sh` runs at authoring
  time in this scaffold, never at clone time.

- **A generator over hand-maintaining both directories.** _Discarded —
  writing `.claude/agents/` and `.opencode/agent/` by hand:_ no script to
  maintain, but 6 roles × 2 runtimes = 12 files carrying identical prose, with
  nothing to detect divergence (`pnpm verify` builds the site; it does not
  compare agent definitions). Every rule change becomes a two-file edit, and
  one missed edit means `coder` behaves differently depending on which runtime
  opened the project. This is the exact drift shape `AGENTS.md` already
  documents having been bitten by.

- **A `case` per runtime in bash, not a templating engine.** For two runtimes,
  an explicit branch is more readable and more honest than a generic emitter.
  Revisit only if a fourth runtime appears.

- **Capability vocabulary of seven**, derived from what the six roles actually
  use today: `read`, `edit`, `exec`, `web`, `skills`, `docs`, `memory`. A role
  that omits `capabilities` inherits everything — which is how `coder.md`
  already behaves (it has no `tools:` line).
  _Note:_ opencode's `permission` model is coarser than Claude Code's `tools`
  list. The mapping is lossy in that direction by design; it is a documented
  degradation, not a bug.

- **opencode's three model strings are deferred to implementation.** They must
  be read from `opencode models` against the provider actually authenticated
  on this machine, never copied from documentation or from a chat transcript.
  Setting all three tiers to the same string is a legitimate choice — it
  reproduces opencode's current behaviour — and should be recorded here if
  taken.

- **Sequencing: mechanical transform first, prose edits second.** Steps 1-5
  below change zero behaviour and are provable by `diff`. Steps 6-7 change
  behaviour. They are separate commits so the refactor can be verified in
  isolation.

## Acceptance criteria

- [ ] `agents/` contains exactly six `.md` files; `grep -c '^tier:' agents/*.md`
      reports `1` for each.
- [ ] `grep -rE 'claude-(haiku|sonnet|opus)|anthropic/' agents/` returns **no
      matches** — no model string survives in the neutral source.
- [ ] `harness/runtimes/claude-code.json` and `harness/runtimes/opencode.json`
      both parse (`jq . <file>`) and each defines all three tiers.
- [ ] **Body-preservation proof:** with `.claude/agents/` copied aside before
      the first run, `./harness/bind-runtime.sh claude-code` followed by
      `diff -r` shows differences **only** inside YAML frontmatter. A single
      differing line below the frontmatter fails this criterion.
- [ ] The six regenerated `.claude/agents/*.md` frontmatters were reviewed by
      hand once and judged equivalent to the originals — specifically the
      `tools:` lines, which the capability mapping will not reproduce
      character-for-character (`research.md` and `memory-ops.md` are the two
      that differ most).
- [ ] `./harness/bind-runtime.sh opencode` produces six files in
      `.opencode/agent/`, each with `mode: subagent` and a resolved `model:`.
- [ ] `grep -rn 'mcp__' agents/` returns no matches (raw tool IDs replaced by
      capability phrasing).
- [ ] `grep -rn '/model opus' agents/ AGENTS.md` returns no matches.
- [ ] `AGENTS.md`'s routing table has a `Tier` column with `fast`/`standard`
      values, and no `haiku`/`sonnet` strings remain in that table.
- [ ] `AGENTS.md`'s Knobs map has a "model per role" row pointing at
      `harness/runtimes/*.json`.
- [ ] `AGENTS.md`'s "If you change X → update Y" table has the new row quoted
      under **Files affected**.
- [ ] **Functional test, Claude Code:** delegate a git commit and confirm
      `git-ops` still fires with its tier's model.
- [ ] **Functional test, opencode:** open this repo with `opencode`, ask for a
      read-only review, and confirm `reviewer` is actually available and
      invoked. This is the criterion that proves the original bug is fixed —
      it must be run for real, not assumed.
- [ ] `.gitignore` contains neither `.claude/` nor `.opencode/`, and
      `git status` after a bind shows the generated files as tracked changes.
- [ ] `pnpm verify`, run on-demand, still passes. No `src/` file is touched by
      this spec, so a failure here means something unrelated broke.

## Implementation plan

1. Branch: `chore/agents-runtime-neutral`. Confirm `git status` is clean.
2. Write down the tier and capability vocabularies in `harness/README.md`
   first — they are the contract everything else is generated against.
3. `mkdir agents && cp .claude/agents/*.md agents/`, then rewrite **only** the
   frontmatter of each of the six. Drop `name:` (both runtimes derive it from
   the filename). Assign: `coder` standard/inherit-all, `reviewer`
   standard/`[read, exec, web]`, `research` standard/`[read, web, skills,
docs]`, `git-ops` fast/`[read, exec]`, `memory-ops` fast/`[read, memory]`,
   `spec-verifier` fast/`[read, edit, exec, skills, docs]`.
4. Write the two `harness/runtimes/*.json` files. Get opencode's model strings
   from `opencode models` on this machine.
5. Write `harness/bind-runtime.sh` and `chmod +x` it. Before running it,
   `cp -r .claude/agents /tmp/agents-antes`. Run it for `claude-code`, then
   `diff -r /tmp/agents-antes .claude/agents` and satisfy the
   body-preservation criterion. Then run it for `opencode`.
   **Commit here** — this point is a behaviour-preserving refactor.
6. Edit `agents/research.md`, `agents/spec-verifier.md` (drop raw `mcp__` IDs
   in favour of "use Context7; if your runtime lacks it, fall back to web
   search and say so") and `agents/coder.md:61` (`/model opus` → escalate to
   tier `deep`). Re-bind **both** runtimes. Commit.
7. Apply the five `AGENTS.md` edits listed under **Files affected**. Commit.
8. Run both functional tests from Acceptance criteria — the opencode one is
   the point of the whole spec, so run it before declaring anything done.
9. Run `pnpm verify` once, then hand the branch over for review.
