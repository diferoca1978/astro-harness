#!/usr/bin/env bash
# Generates a runtime's native subagent files from the runtime-neutral
# source in agents/. See harness/README.md for the tier and capability
# vocabularies this reads.
set -euo pipefail

RUNTIME="${1:-}"
if [[ -z "$RUNTIME" ]]; then
  echo "Usage: $0 <claude-code|opencode>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS_DIR="$ROOT_DIR/agents"
RUNTIME_CONFIG="$ROOT_DIR/harness/runtimes/${RUNTIME}.json"

if [[ ! -f "$RUNTIME_CONFIG" ]]; then
  echo "No runtime config at $RUNTIME_CONFIG" >&2
  exit 1
fi

AGENT_DIR_REL="$(jq -r '.agentDir' "$RUNTIME_CONFIG")"
OUT_DIR="$ROOT_DIR/$AGENT_DIR_REL"
mkdir -p "$OUT_DIR"

tier_model() {
  jq -r --arg tier "$1" '.tiers[$tier] // empty' "$RUNTIME_CONFIG"
}

# Capability -> Claude Code tool names.
claude_tools_for_capability() {
  case "$1" in
    read) echo "Read, Grep, Glob" ;;
    edit) echo "Edit, Write, NotebookEdit" ;;
    exec) echo "Bash" ;;
    web) echo "WebFetch, WebSearch" ;;
    skills) echo "Skill" ;;
    docs) echo "mcp__context7__resolve-library-id, mcp__context7__query-docs" ;;
    memory) echo "mcp__plugin_engram_engram__mem_save, mcp__plugin_engram_engram__mem_search, mcp__plugin_engram_engram__mem_context, mcp__plugin_engram_engram__mem_session_summary, mcp__plugin_engram_engram__mem_get_observation, mcp__plugin_engram_engram__mem_save_prompt, mcp__plugin_engram_engram__mem_session_start, mcp__plugin_engram_engram__mem_session_end, mcp__plugin_engram_engram__mem_current_project" ;;
    *) echo "" ;;
  esac
}

for src in "$AGENTS_DIR"/*.md; do
  role="$(basename "$src" .md)"

  fm_end_line="$(awk '/^---$/{c++; if (c == 2) { print NR; exit }}' "$src")"
  if [[ -z "$fm_end_line" ]]; then
    echo "No closing frontmatter delimiter in $src" >&2
    exit 1
  fi
  fm="$(sed -n "2,$((fm_end_line - 1))p" "$src")"

  description="$(printf '%s\n' "$fm" | sed -n 's/^description: //p')"
  tier="$(printf '%s\n' "$fm" | sed -n 's/^tier: //p')"
  capabilities_line="$(printf '%s\n' "$fm" | sed -n 's/^capabilities: \[\(.*\)\]$/\1/p')"

  if [[ -z "$description" || -z "$tier" ]]; then
    echo "Missing description or tier in $src" >&2
    exit 1
  fi

  model="$(tier_model "$tier")"
  if [[ -z "$model" ]]; then
    echo "No model for tier '$tier' (role: $role) in $RUNTIME_CONFIG" >&2
    exit 1
  fi

  out_file="$OUT_DIR/${role}.md"

  case "$RUNTIME" in
    claude-code)
      {
        echo "---"
        echo "name: $role"
        echo "description: $description"
        echo "model: $model"
        if [[ -n "$capabilities_line" ]]; then
          tools=()
          IFS=',' read -ra caps <<< "$capabilities_line"
          for cap in "${caps[@]}"; do
            cap="$(echo "$cap" | xargs)"
            t="$(claude_tools_for_capability "$cap")"
            [[ -n "$t" ]] && tools+=("$t")
          done
          tools_line="$(printf ', %s' "${tools[@]}")"
          tools_line="${tools_line#, }"
          echo "tools: $tools_line"
        fi
        echo "---"
      } > "$out_file"
      ;;
    opencode)
      {
        echo "---"
        echo "description: $description"
        echo "mode: subagent"
        echo "model: $model"
        if [[ -n "$capabilities_line" ]]; then
          edit_perm="deny"; bash_perm="deny"; webfetch_perm="deny"
          IFS=',' read -ra caps <<< "$capabilities_line"
          for cap in "${caps[@]}"; do
            cap="$(echo "$cap" | xargs)"
            case "$cap" in
              edit) edit_perm="allow" ;;
              exec) bash_perm="allow" ;;
              web) webfetch_perm="allow" ;;
            esac
          done
          echo "permission:"
          echo "  edit: $edit_perm"
          echo "  bash: $bash_perm"
          echo "  webfetch: $webfetch_perm"
        fi
        echo "---"
      } > "$out_file"
      ;;
    *)
      echo "Unknown runtime: $RUNTIME" >&2
      exit 1
      ;;
  esac

  tail -n +"$((fm_end_line + 1))" "$src" >> "$out_file"

  echo "Generated $out_file"
done
