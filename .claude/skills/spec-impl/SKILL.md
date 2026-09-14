---
name: spec-impl
description: Implements an approved spec, or a feature_list.json entry (the SDD light lane). Spec mode validates that the state means "Approved" (in any language); feature mode validates that source and acceptance are both filled in. Either way it creates a git branch, switches to it, and starts the implementation step by step with pauses to review diffs.
disable-model-invocation: true
argument-hint: <NN-spec-name> | feature <id>
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(git stash:*), Bash(cat:*), Bash(ls:*)
---

# /spec-impl — Implementer of approved specs and light-lane features

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

Specs available in this folder:
!`ls specs/ 2>/dev/null || echo "The specs/ folder does not exist"`

Branch-creation config:
!`cat specs/.spec-config.yml 2>/dev/null || echo "AutoCreateBranch: true (default, no config file)
BranchPrefix: feature/ (default, no config file)"`

feature_list.json (light-lane state):
!`cat feature_list.json 2>/dev/null || echo "No feature_list.json in this project — the light lane is unavailable here"`

---

## Two modes, one shared chain from Phase 3 onward

This skill implements either a **full-lane spec** (`specs/NN-slug.md`) or a
**light-lane feature** (an entry in `feature_list.json`) — see
`specs/README.md` for the routing rule between the two. Phase 1 detects
which one `$ARGUMENTS` names; Phase 2 authorizes it (differently per mode);
Phases 3–4 are the same branch-and-implement chain either way, noting the
few places a step behaves differently by mode.

## Instructions

Follow these four phases in strict order. **Do not advance to the next phase if the previous one did not complete correctly.**

---

### Phase 1 — Identify the target (spec or feature)

The received argument is: `$ARGUMENTS`

**First, decide the mode.** If `$ARGUMENTS` starts with the literal word
`feature` (case-insensitive) followed by whitespace and an id, or is
exactly `feature` alone — this is **feature mode**. Everything else is
**spec mode**.

**Feature mode** (`feature <id>`):

- If no id follows `feature`: list the `features` array from the
  `feature_list.json` session context above (id + status), ask the user
  which one, and stop. Do not continue.
- Look for an entry whose `id` matches. If none matches, show the
  available ids and ask the user to correct it.
- If `feature_list.json` doesn't exist in this project (see the session
  context above), say the light lane is unavailable here and stop — this
  project has no light-lane artifact to implement against.
- If you find the entry, continue to Phase 2 in feature mode.

**Spec mode** (anything else):

- If `$ARGUMENTS` is empty: list the files available in `specs/` (you
  already have them above), ask the user to specify the exact name of the
  spec **or** `feature <id>`, and stop. Do not continue.
- Look for the file in `specs/`. The user may have written the full name (`01-mvp-arkanoid`), only the number (`01`), or only the slug (`mvp-arkanoid`). Try to find the correct file in any of those cases.
- If you do not find the file, show the available specs and ask the user to correct the name.
- If you do find it, continue to Phase 2 in spec mode.

---

### Phase 2 (feature mode) — Validate the feature's authorization

Skip this section entirely in spec mode — go to "Phase 2 (spec mode)"
below.

**Check 1 — the one-`in_progress` invariant.** Look at every entry's
`status` in the `feature_list.json` session context above.

- If some **other** entry (not the one from Phase 1) already has
  `status: "in_progress"` → **stop**. Tell the user which feature is
  already in progress and that only one may be at a time. Do not touch
  git or the file.
- If the target entry **itself** is already `in_progress` → this is a
  resume. Continue to Phase 3 as a resume (same handling as an existing
  spec branch in spec mode).
- Otherwise (target is `pending`) → continue to check 2.

**Check 2 — `source` and `acceptance` are both filled in.** Look at the
target entry's `source` and `acceptance` fields.

**Absolute rule:** you can only continue if **both** are present and
non-empty (`acceptance` must have at least one item).

If either is missing or empty, **stop** and show:

```
❌ I cannot implement this feature.

id: [FEATURE ID]
source:     [present | MISSING]
acceptance: [N items | MISSING]

A feature can only move to in_progress once both source and acceptance
are filled in — see AGENTS.md § "feature_list.json".

To continue you have two options:
  1. If there is an approved document that answers this (a brief section,
     client-supplied content), add `source` (which document + section)
     and `acceptance` (a boolean checklist) to this entry in
     feature_list.json yourself, then re-run this command.
  2. If there is a decision to make and no document answers it, this
     isn't light-lane work — use /spec instead.
```

Do not offer to fill in `source` or `acceptance` yourself, and do not
guess a plausible value — that is exactly the gap this check exists to
close. Once both checks pass, continue to Phase 3 in feature mode.

---

### Phase 2 (spec mode) — Validate the spec's state

Skip this section entirely in feature mode.

Read the spec file you located in Phase 1 using the Read tool or `cat`.

In the file's contents, look for the line that contains the spec's state. The header label is typically `**Status:**` (English) or `**Estado:**` (Spanish), but it may use any language. Match by position (status line near the top of the spec) and by the surrounding state machine, not by the exact label.

**Absolute rule:** You can only continue if the state **means "Approved"** — regardless of the language used.

Treat any of the following (and their equivalents in other languages) as the **Approved** state and continue:

- English: `Approved`
- Spanish: `Aprobado`
- Portuguese: `Aprovado`
- French: `Approuvé`
- German: `Genehmigt`
- Italian: `Approvato`
- …or any other language's word that clearly means "approved"

Anything else (Draft / Borrador, In review / En revisión, Implemented / Implementado, Obsolete / Obsoleto, or any unrecognized value) means **stop** and show the error message below.

| State category                            | Examples (any language)                           | Action                                                                     |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Approved                                  | `Approved`, `Aprobado`, `Aprovado`, `Approuvé`, … | Continue to Phase 3.                                                       |
| Draft                                     | `Draft`, `Borrador`, …                            | Stop. Show the error message below.                                        |
| In review                                 | `In review`, `En revisión`, …                     | Stop. Show the error message below.                                        |
| Implemented                               | `Implemented`, `Implementado`, …                  | Stop. Show the error message below.                                        |
| Obsolete                                  | `Obsolete`, `Obsoleto`, …                         | Stop. Show the error message below.                                        |
| State line not found / unrecognized value | —                                                 | Stop. The file does not follow the expected format. Tell this to the user. |

If you are unsure whether a value means "approved", **do not assume**. Stop and ask the user to clarify or to update the spec to the canonical wording.

**Standard error message when the state does not mean Approved:**

```
❌ I cannot implement this spec.

Current state: [STATE FOUND]
I only work with specs whose state means "Approved" (e.g. `Approved`, `Aprobado`,
or the equivalent in another language).

To continue you have two options:
  1. If the spec is ready to be implemented, open it and change the state
     to "Approved" (or the equivalent term your team uses) manually.
     That change is made by the human, not the agent.
  2. If the spec still needs work, use /spec [name] to resume it.
```

Do not offer alternatives, do not suggest "I can still start if you want". The block is intentional.

---

### Phase 3 — Create the git branch and switch to it

Shared between both modes from here on, except where a step says
otherwise. Once you have confirmed authorization (Phase 2, either mode):

0. **Check the working tree first.** Look at the `git status --short` output in the session context above. If it is **not empty**, stop and show the pending changes, then ask:

   ```
   ⚠️ There are uncommitted changes in the working tree.
   Switching branches would carry them over. What do you want to do?
     1. Commit or stash them yourself, then re-run this command  (recommended)
     2. Continue anyway — the changes travel to the new branch
   ```

   Wait for the answer. **Do not stash or commit on the user's behalf** unless they explicitly ask for it. If the working tree is clean, skip straight to step 1 without mentioning it.

1. Derive the branch name, prefixed by `BranchPrefix`.
   - **Spec mode:** from the spec file's full name, without the extension
     (`NN-slug`).
   - **Feature mode:** from the feature's `id` field.
   - Read `BranchPrefix` from the **Branch-creation config** shown in the
     session context above.
     - Absent, empty key not set, or unrecognized → default to `feature/`.
     - Normalize a missing trailing slash: `feature` and `feature/`
       produce the same branch name.
     - An **explicit empty string** (`BranchPrefix: ""`) means no prefix
       at all — the branch is the bare `NN-slug` or `id`.
   - Examples:
     - Spec mode, `BranchPrefix: feature/` (or unset, the default) +
       `37-remove-invented-services.md` → branch
       `feature/37-remove-invented-services`.
     - Spec mode, `BranchPrefix: ""` + `01-mvp-arkanoid.md` → branch
       `01-mvp-arkanoid`.
     - Feature mode, `BranchPrefix: feature/` (default) + `id: "hero-home"`
       → branch `feature/hero-home`.

2. Read the `AutoCreateBranch` flag from the **Branch-creation config** shown in the session context above.
   - If the config file does not exist, the value is missing, or the value is unrecognized → treat it as `true` (the default).
   - Only an explicit `false` (in any capitalization) disables automatic branch creation.

   **If `AutoCreateBranch` is `true` (default):** proceed without asking.
   - If the branch **does not exist**: create it with `git checkout -b <branch>` (the name derived in step 1).
   - If it **already exists**: this means previous work is being resumed. Switch to it, read `git log --oneline` on the branch, and tell the user which steps of the plan already look done and which step you propose to resume from. Wait for confirmation on the resume point before implementing anything.
   - In both cases: switch to the branch with `git checkout <branch>` and confirm the change was successful before continuing.

   **If `AutoCreateBranch` is `false`:** ask before touching git. Show:

   ```
   AutoCreateBranch is set to false.
   Create and switch to the branch <branch>? [y/N]
   ```

   - If the user answers **yes**: create/switch to the branch exactly as in the `true` case above.
   - If the user answers **no** or leaves it empty: **do not create any branch.** Tell the user you will implement on the current branch (the one shown in the session context above) and ask for explicit confirmation to continue there. Do not improvise — wait for the answer.

3. **Feature mode only:** mark the entry `status: "in_progress"` in
   `feature_list.json` now, with an `Edit`, before showing the
   confirmation below (skip if it's already `in_progress` — a resume).
   This is the one status flip this skill makes itself — marking
   `"done"` still stays a human decision, same as `Status: Approved` in
   spec mode (see Phase 4's ending message).

4. Visually confirm to the user the target is ready and which branch is active:

   **Spec mode:**

   ```
   ✅ Ready to implement.

   Spec:   specs/NN-slug.md
   Branch: <branch>  (active)   (← or the current branch, if no new branch was created)
   State:  Approved   (← echo back the actual value found in the spec)
   ```

   **Feature mode:**

   ```
   ✅ Ready to implement.

   Feature: <id>
   Branch:  <branch>  (active)   (← or the current branch, if no new branch was created)
   Status:  in_progress
   Source:  <the entry's source field>
   ```

5. **Do not start implementing yet.** First show a summary to the user so
   they have it fresh.
   - **Spec mode**, extract and show:
     - The **objective** (the line after `**Objective:**` / `**Objetivo:**` / equivalent label).
     - The **scope** (the `## Scope` / `## Alcance` / equivalent section).
     - The **implementation plan** (the section with the numbered steps — `## Implementation plan` / `## Plan de implementación` / equivalent).
     - The **acceptance criteria** (the checklist — `## Acceptance criteria` / `## Criterios de aceptación` / equivalent).
   - **Feature mode**, show:
     - The **source** field, verbatim.
     - The **acceptance** array, as a checklist.
     - The **builders** array — which skill(s) to invoke (`front-end-astro`, `seo-guide-lines`) per `AGENTS.md` § "Skill routing".

Match section headings by meaning, not by exact wording — the spec may be authored in any language.

---

### Phase 4 — Implement step by step

After showing the summary, tell the user:

**Spec mode:**

```
I am going to implement the spec following the implementation plan exactly.
I will pause after each step so you can review the diff.

Shall we start with Step 1?
```

**Feature mode** (there is no numbered plan — the entry names the
`source` to build from and the `builders` to invoke):

```
I am going to implement this feature using [builders, e.g.
front-end-astro then seo-guide-lines] against the source cited above.
I will pause once it's built so you can review the diff before verification.

Shall I start?
```

Wait for explicit confirmation ("yes", "go ahead", "go", or equivalent). Do not start without it.

Once confirmed, follow these rules during the entire implementation:

**Never commit automatically.** Not per step, not at the end. You write the code and show the diff; committing is the user's decision and the user's command. Only commit if they explicitly ask you to.

**One rule above all:** implement what the source says. If something looks suboptimal to you, mention it as an observation but implement what was agreed — a spec's plan, or a feature's `source` + `acceptance`. Changes to the spec go into the spec, changes to what a feature should do go into its `feature_list.json` entry — never into the code by surprise.

**Work rhythm:**

- **Spec mode:** implement one step of the plan, show a summary of which
  files you touched and what you did, say `Step N completed. Could you
  review the diff and let me know if I continue with Step N+1?`, wait for
  confirmation before continuing.
- **Feature mode:** build the feature per `source`, using the `builders`
  skill(s) in order (`front-end-astro` for sections, then
  `seo-guide-lines` if the feature closes a page — see `AGENTS.md` §
  "Skill routing"). Show a summary of which files you touched, then say
  `Feature built. Could you review the diff before I hand off to
  spec-verifier?` and wait for confirmation. If the feature is large
  enough to have natural sub-steps, pause between them the same way spec
  mode does — use judgment, there's no plan to enumerate them for you.

**If during the implementation you find an ambiguity** the spec, or the
feature's `source` + `acceptance`, does not resolve:

- Stop.
- Describe the ambiguity exactly.
- Present two or three concrete options.
- Wait for the user's decision.
- Do not improvise, and in feature mode, do not invent data `source`
  doesn't contain — that gap goes to `client-gaps.md`, not a guess.

**If the user asks for something that is out of scope:**

- Spec mode: remind them it is out of this spec's scope; suggest noting
  it down for the next spec.
- Feature mode: remind them it is out of this feature's `source` +
  `acceptance`; suggest a new `feature_list.json` entry (with its own
  `source`) or a spec if there's no document behind it.
- Either way, do not implement it on this branch.

**When finishing:**

**Spec mode:**

```
✅ All steps of the plan are implemented.

Next step: run spec-verifier against this spec's acceptance criteria.
If they all pass, update the spec's state to "Implemented" (or the equivalent
in your repo's language) and make the final commit before merging this branch.
```

**Feature mode:**

```
✅ Feature built.

Next step: run spec-verifier (feature mode) against this entry's
acceptance array — it also confirms the text cited in source actually
landed in the build. If everything passes, set status to "done" in
feature_list.json yourself and make the final commit before merging this
branch. I don't flip status to "done" myself, same as a spec's Status
field.
```

---

## Summary of expected behavior

```
/spec-impl 01-mvp-arkanoid

  Phase 1  →  Finds specs/01-mvp-arkanoid.md
  Phase 2  →  Reads the state → "Approved" (or "Aprobado", etc.) → ✅ continues
  Phase 3  →  git checkout -b feature/01-mvp-arkanoid → git checkout feature/01-mvp-arkanoid
              Shows objective, scope, plan and criteria
  Phase 4  →  Implements step by step with pauses
              Ends by reminding to verify the acceptance criteria

/spec-impl 02-powerups  (state: Draft / Borrador)

  Phase 1  →  Finds specs/02-powerups.md
  Phase 2  →  Reads the state → "Draft" → ❌ stops
              Shows the standard error message
              Does not create branch, does not touch code

/spec-impl feature hero-home  (source + acceptance both filled in)

  Phase 1  →  Detects feature mode, finds id "hero-home" in feature_list.json
  Phase 2  →  No other feature in_progress; source + acceptance present → ✅ continues
  Phase 3  →  Marks status: "in_progress" → git checkout -b feature/hero-home
              Shows source and acceptance checklist
  Phase 4  →  Builds the feature per its builders, pauses for review
              Ends by pointing at spec-verifier (feature mode); does not set "done" itself

/spec-impl feature contact-cta  (source or acceptance missing)

  Phase 1  →  Detects feature mode, finds id "contact-cta"
  Phase 2  →  source missing → ❌ stops
              Shows the standard error message
              Does not create branch, does not touch code, does not invent a source
```

**Branch creation is controlled by the `AutoCreateBranch` flag** in `specs/.spec-config.yml`. It defaults to `true` (create the branch automatically, as shown above). Set it to `false` to make Phase 3 ask `[y/N]` before creating the branch.

**The branch prefix is controlled by the `BranchPrefix` key** in the same
file. It defaults to `feature/` — absent, empty, or unrecognized all fall
back to it. Set it to `""` for a bare `NN-slug` branch with no prefix.
