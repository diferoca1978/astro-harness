// llms.txt builders — plain markdown strings, no Response. src/pages/llms.txt.ts composes
// them from config. Every input is a parameter, so this module has no imports.

export interface LlmsItem {
  title: string;
  url?: string; // omitted → a plain bullet, no link
  notes?: string;
}

// `# title`, plus a `> summary` blockquote when the summary is not absent or blank.

export function header(title: string, summary?: string): string {
  if (!summary?.trim()) return `# ${title}\n`;
  return `# ${title}\n\n> ${summary}\n`;
}

// One bullet: a markdown link when `url` is given, the bare title when it is absent, and
// `: notes` after either when `notes` is given. `]` and `)` in the title are not escaped
// (spec 07, known limitation).

export function doc(item: LlmsItem): string {
  const label = item.url === undefined ? item.title : `[${item.title}](${item.url})`;
  const suffix = item.notes === undefined ? '' : `: ${item.notes}`;
  return `- ${label}${suffix}`;
}

// A `## heading` section with one bullet per item, or '' when there are no items, so a
// caller can push it unconditionally and llmsTxt() drops it.

export function linkList(heading: string, items: LlmsItem[]): string {
  if (items.length === 0) return '';
  return `## ${heading}\n\n` + items.map(doc).join('\n');
}

// The whole document: the header and every section that is not '', joined with '\n\n',
// plus one trailing '\n'.

export function llmsTxt(header: string, sections: string[]): string {
  return [header, ...sections.filter((section) => section !== '')].join('\n\n') + '\n';
}

// Extension point: pre-rendered sections (the same shape linkList() returns), appended
// after the core's own sections in src/pages/llms.txt.ts. Empty in the core; add-module
// (spec 08) patches this one line when a module (the blog, spec 09) adds its own section.

export const EXTRA_SECTIONS: string[] = [];
