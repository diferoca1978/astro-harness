#!/usr/bin/env node
// ============================================================================
// check-seo.mjs — SEO check of the HTML a site actually publishes
//
// Checks a build (--dist) or a live site (--url) against universal SEO rules.
// Both modes feed one page model, and the same rules run on it.
//
// Usage:
//   node harness/check-seo.mjs --dist <dir> [--site <origin>] [--strict] [--report]
//   node harness/check-seo.mjs --url <origin> [--strict] [--report]
//
//   --dist <dir>     check every *.html under <dir> (a build, e.g. dist/)
//   --site <origin>  --dist only: use this origin instead of the one in the
//                    sitemaps' page <loc>s
//   --url <origin>   check the live site: every page <loc> in its sitemaps
//   --strict         warnings count as errors
//   --report         exit 0 even when there are errors (never hides exit 2)
//   Exactly one of --dist and --url.
//
// Exit codes:
//   0  no errors
//   1  at least one error (with --strict, warnings count as errors);
//      --report turns 1 into 0
//   2  a usage error or input that cannot be read: a missing <dir>, no sitemap
//      and no --site, a sitemap that cannot be fetched, or page <loc>s with
//      more than one origin and no --site (--dist); with --url, also sitemaps
//      that list no page <loc>, or none on the --url site
//
// Rules (17), with their severity:
//   jsonld-parse        error    Every JSON-LD block parses, declares a
//                                schema.org @context, and each top-level node
//                                (or @graph member) has a @type.
//   jsonld-id-resolves  error    Every reference node (an object whose only key
//                                is @id) points to an @id that a typed node on
//                                the same page defines.
//   jsonld-noindex      error    noindex pages and the 404 carry no JSON-LD.
//   title-description   error    Exactly one non-empty <title> and one non-empty
//                                <meta name="description">; the 404 needs only
//                                the title.
//   canonical-self      error    An indexable page has exactly one canonical,
//                                equal to its own URL. A noindex page may have
//                                none, but any it has must be exactly one,
//                                equal to its own URL. The 404 has none.
//   robots-single       error    At most one <meta name="robots">.
//   url-resolves        error    A same-site page URL leads to a page (--dist:
//                                a file; --url: a 200 with no redirect).
//   url-canonical-form  error    A same-site page URL that resolves equals the
//                                canonical of the page it leads to, ignoring
//                                the #fragment. If that page has no canonical,
//                                or its canonical fails canonical-self, it
//                                equals the page's own URL (so a broken
//                                canonical is reported once, on its own page).
//                                A relative URL in JSON-LD always fails.
//   faq-visible         error    The name of every Question in a FAQPage is in
//                                the page's visible text: <body> minus
//                                <script>, <style> and <template>, entities
//                                decoded, compared with all whitespace removed
//                                on both sides and ignoring case.
//   breadcrumb-shape    error    A BreadcrumbList has at least 2 items, and the
//                                home page (/) has none.
//   local-address       error    Every node whose @type includes one of
//                                LOCAL_BUSINESS_TYPES has an address object
//                                with a non-empty string streetAddress,
//                                addressLocality and addressCountry.
//   url-lowercase       error    No uppercase letter in the pathname of each
//                                page's own URL, of every same-site page URL
//                                (the ones url-resolves looks at) and of every
//                                page <loc> in the sitemaps. The pathname is
//                                percent-decoded first (%C3%A9, é, does not
//                                count; %C3%89, É, does); the query and the
//                                #fragment are ignored. With malformed
//                                percent-encoding, only the letters outside
//                                its %XX escapes count.
//   asset-missing       warning  A same-site asset URL exists (--dist: a file;
//                                --url: a 2xx).
//   placeholder-text    warning  The HTML has none of [CLIENTE], example.com,
//                                My Website, My Site, Nueva web app, tuagencia
//                                or lorem ipsum (only lorem ipsum in any case).
//   404-empty           warning  dist/404.html is not empty or only whitespace
//                                (--dist only).
//   deprecated-type     warning  No node has the @type ProfessionalService,
//                                SearchAction or HowTo.
//   external-url-http   warning  Every external URL in the JSON-LD uses https:.
//   With --strict, every warning counts as an error.
//
// Pages: kind 404 is dist/404.html (--dist only; if empty, it gets only
// 404-empty), kind noindex has a <meta name="robots"> whose content includes
// noindex, and every other page is indexable.
//
// --dist: the pages are every *.html under <dir>; the sitemap is
// <dir>/sitemap-index.xml (else sitemap.xml), and the origin comes from its
// page <loc>s unless --site is given.
// --url: the sitemaps come from the Sitemap: lines of <origin>/robots.txt,
// else <origin>/sitemap-index.xml, then <origin>/sitemap.xml (indexes are
// followed); the pages are the same-site page <loc>s that answer a GET with
// a 200, and a page's own URL is its <loc>. Every other same-site URL is
// requested once: pages with GET, assets with HEAD (GET on a 405 or 501).
// Redirects are not followed, 4 requests run at a time, each with a 10 s
// timeout and the User-Agent astro-harness-check-seo; a timeout or a network
// error is a failed request. The 404 is not checked (it is not in the
// sitemap), and external URLs are never requested.
//
// URLs that url-resolves, url-canonical-form, url-lowercase, asset-missing and
// external-url-http look at: <a href>, <img src>, the canonical, any <link>
// whose rel contains "icon", og:url, og:image, twitter:image; in JSON-LD,
// every http(s):// string (not under @context or @id, not a schema.org URL)
// and every "/..." string under url, item, logo, image or sameAs; and every
// page <loc> in the sitemaps (those findings are listed under the sitemap
// file). Same-site means the origin's hostname, ignoring the scheme and a
// leading "www."; any other URL is external. A same-site URL is a page if its
// path has no extension or ends in .html, and an asset otherwise. Each rule
// reports a URL once per page, listing every place it appears.
//
// Limits:
//   - It cannot tell whether the data is true.
//   - It cannot see text hidden with CSS or with the hidden attribute: such
//     text counts as present.
//   - It does not replace the Rich Results Test or the Schema Markup
//     Validator (schema.org vocabulary, value types, rich-result eligibility).
//
// Runtime: Node 22+, node: built-ins only (nothing in package.json). HTML is
// read by the minimal tag reader below, not by a parser package.
//
// Layout of this file:
//   CLI → shared page model + tag reader → rules → input adapters → runner.
//   An adapter (--dist or --url) turns its input into pages and a site
//   context. The rules see only those two, never the mode.
// ============================================================================

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const USAGE = `Usage:
  node harness/check-seo.mjs --dist <dir> [--site <origin>] [--strict] [--report]
  node harness/check-seo.mjs --url <origin> [--strict] [--report]`;

/** Usage errors and unreadable input. Always exit 2, even with --report. */
class InputError extends Error {
  constructor(message, { usage = false } = {}) {
    super(message);
    this.usage = usage;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const VALUE_OPTIONS = { "--dist": "dist", "--url": "url", "--site": "site" };
const FLAG_OPTIONS = { "--strict": "strict", "--report": "report" };

function parseArgs(argv) {
  const opts = {
    dist: null,
    url: null,
    site: null,
    strict: false,
    report: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (Object.hasOwn(VALUE_OPTIONS, arg)) {
      const key = VALUE_OPTIONS[arg];
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new InputError(`${arg} needs a value`, { usage: true });
      }
      if (opts[key] !== null)
        throw new InputError(`${arg} is given twice`, { usage: true });
      opts[key] = value;
      i++;
    } else if (Object.hasOwn(FLAG_OPTIONS, arg)) {
      opts[FLAG_OPTIONS[arg]] = true;
    } else {
      throw new InputError(`unknown argument: ${arg}`, { usage: true });
    }
  }
  if (opts.dist === null && opts.url === null) {
    throw new InputError("give exactly one of --dist and --url", {
      usage: true,
    });
  }
  if (opts.dist !== null && opts.url !== null) {
    throw new InputError("--dist and --url cannot be used together", {
      usage: true,
    });
  }
  if (opts.site !== null && opts.url !== null) {
    throw new InputError("--site only works with --dist", { usage: true });
  }
  if (opts.site !== null) opts.site = parseOrigin(opts.site, "--site");
  if (opts.url !== null) opts.url = parseOrigin(opts.url, "--url");
  return opts;
}

function parseOrigin(value, flag) {
  const origin = httpOrigin(value);
  if (!origin) {
    throw new InputError(
      `${flag} needs an absolute http(s) URL, such as https://<domain> (got "${value}")`,
      {
        usage: true,
      },
    );
  }
  return origin;
}

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

/** The origin of an absolute http(s) URL, or null. */
function httpOrigin(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u.origin : null;
  } catch {
    return null;
  }
}

/** Two absolute URLs are equal once parsed (host case, empty path → "/"). */
function sameUrl(a, b) {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
}

const isBlank = (s) => s.trim() === "";
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * "page" if the path has no extension or ends in .html, else "asset".
 * Works on an encoded or a decoded pathname.
 */
function urlKind(pathname) {
  const last = pathname.slice(pathname.lastIndexOf("/") + 1);
  const ext = path.posix.extname(last).toLowerCase();
  return ext === "" || ext === ".html" ? "page" : "asset";
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  Ntilde: "Ñ",
  Uuml: "Ü",
  iexcl: "¡",
  iquest: "¿",
  laquo: "«",
  raquo: "»",
  copy: "©",
  reg: "®",
  trade: "™",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  bull: "•",
  deg: "°",
};

/** Decodes numeric references and the named entities above; others stay as-is. */
function decodeEntities(s) {
  if (!s.includes("&")) return s;
  return s.replace(
    /&(#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g,
    (match, ref) => {
      if (ref[0] === "#") {
        const hex = ref[1] === "x" || ref[1] === "X";
        const cp = parseInt(ref.slice(hex ? 2 : 1), hex ? 16 : 10);
        return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
      }
      return Object.hasOwn(NAMED_ENTITIES, ref) ? NAMED_ENTITIES[ref] : match;
    },
  );
}

// ---------------------------------------------------------------------------
// Tag reader — a minimal tokenizer, enough for the predictable HTML Astro emits
// ---------------------------------------------------------------------------
//
// readTags(html) returns tokens in document order:
//   { type: 'open',  name, attrs, selfClosing, start, end, inForeign, inTemplate, content? }
//   { type: 'close', name, start, end, inForeign, inTemplate }
//   { type: 'text',  text, start, end, inForeign, inTemplate }   (raw, not decoded)
//
// - Tag and attribute names are lowercased. Attribute values accept any quote
//   style or none, in any order, and are entity-decoded. The first duplicate
//   attribute wins, as in HTML.
// - <script> and <style> are raw text: their body is `content`, untouched.
//   <title> and <textarea> are RCDATA: `content` is entity-decoded. For all
//   four, the body produces no tokens.
// - inForeign: inside <svg> or <math> (an SVG <title> is not the page title).
//   inTemplate: inside <template>, whose content is inert.
// - Comments, doctypes and processing instructions produce no tokens.

const RAW_TEXT = new Set(["script", "style"]);
const RCDATA = new Set(["title", "textarea"]);
const FOREIGN = new Set(["svg", "math"]);
const TAG_NAME = /[A-Za-z][^\s/>]*/y;
const CLOSE_TAG = /<\/([A-Za-z][^\s/>]*)[^>]*>?/y;
const ATTR_NAME = /[^\s"'>/=]+/y;
const UNQUOTED_VALUE = /[^\s>]*/y;
const WHITESPACE = /\s/;
const LETTER = /[A-Za-z]/;

function readTags(html) {
  const tokens = [];
  const n = html.length;
  let foreign = 0;
  let template = 0;
  let pos = 0;
  let textStart = 0;
  const context = () => ({ inForeign: foreign > 0, inTemplate: template > 0 });
  const flushText = (end) => {
    if (end > textStart) {
      tokens.push({
        type: "text",
        text: html.slice(textStart, end),
        start: textStart,
        end,
        ...context(),
      });
    }
  };

  while (pos < n) {
    const lt = html.indexOf("<", pos);
    if (lt === -1) break;
    const next = html[lt + 1] ?? "";

    if (html.startsWith("<!--", lt)) {
      flushText(lt);
      const close = html.indexOf("-->", lt + 4);
      pos = textStart = close === -1 ? n : close + 3;
    } else if (next === "!" || next === "?") {
      flushText(lt);
      const close = html.indexOf(">", lt + 2);
      pos = textStart = close === -1 ? n : close + 1;
    } else if (next === "/" && LETTER.test(html[lt + 2] ?? "")) {
      flushText(lt);
      CLOSE_TAG.lastIndex = lt;
      const m = CLOSE_TAG.exec(html);
      const name = m[1].toLowerCase();
      if (FOREIGN.has(name) && foreign > 0) foreign--;
      if (name === "template" && template > 0) template--;
      const end = lt + m[0].length;
      tokens.push({ type: "close", name, start: lt, end, ...context() });
      pos = textStart = end;
    } else if (LETTER.test(next)) {
      flushText(lt);
      const tag = readOpenTag(html, lt);
      const token = { type: "open", ...tag, start: lt, ...context() };
      tokens.push(token);
      pos = textStart = tag.end;
      if (RAW_TEXT.has(tag.name) || RCDATA.has(tag.name)) {
        const closeRe = new RegExp(`</${tag.name}(?=[\\s/>]|$)`, "ig");
        closeRe.lastIndex = tag.end;
        const m = closeRe.exec(html);
        const bodyEnd = m ? m.index : n;
        const body = html.slice(tag.end, bodyEnd);
        token.content = RCDATA.has(tag.name) ? decodeEntities(body) : body;
        pos = textStart = bodyEnd; // the loop reads the close tag next
      } else if (!tag.selfClosing) {
        if (FOREIGN.has(tag.name)) foreign++;
        if (tag.name === "template") template++;
      }
    } else {
      pos = lt + 1; // a stray "<" is text
    }
  }
  flushText(n);
  return tokens;
}

function readOpenTag(html, lt) {
  const n = html.length;
  TAG_NAME.lastIndex = lt + 1;
  const name = TAG_NAME.exec(html)[0].toLowerCase();
  let pos = TAG_NAME.lastIndex;
  const attrs = Object.create(null);
  let slash = false;

  while (pos < n) {
    const ch = html[pos];
    if (ch === ">") return { name, attrs, selfClosing: slash, end: pos + 1 };
    if (ch === "/") {
      slash = true;
      pos++;
      continue;
    }
    slash = false;
    if (WHITESPACE.test(ch)) {
      pos++;
      continue;
    }
    ATTR_NAME.lastIndex = pos;
    const m = ATTR_NAME.exec(html);
    if (!m) {
      pos++; // a stray quote or "="
      continue;
    }
    const attrName = m[0].toLowerCase();
    pos = ATTR_NAME.lastIndex;
    while (pos < n && WHITESPACE.test(html[pos])) pos++;
    let value = "";
    if (html[pos] === "=") {
      pos++;
      while (pos < n && WHITESPACE.test(html[pos])) pos++;
      const quote = html[pos];
      if (quote === '"' || quote === "'") {
        const close = html.indexOf(quote, pos + 1);
        value = html.slice(pos + 1, close === -1 ? n : close);
        pos = close === -1 ? n : close + 1;
      } else {
        UNQUOTED_VALUE.lastIndex = pos;
        value = UNQUOTED_VALUE.exec(html)[0];
        pos = UNQUOTED_VALUE.lastIndex;
      }
    }
    if (!Object.hasOwn(attrs, attrName))
      attrs[attrName] = decodeEntities(value);
  }
  return { name, attrs, selfClosing: false, end: n };
}

// ---------------------------------------------------------------------------
// Page model — what every adapter produces and every rule reads
// ---------------------------------------------------------------------------
//
// page = { url, status, html, kind, label }
//   url    the page's own URL (absolute)
//   status HTTP status (in --dist: 404 for 404.html, 200 for the rest)
//   kind   '404'       dist/404.html, in --dist only
//          'noindex'   its <meta name="robots"> content includes "noindex"
//          'indexable' every other page
//   label  how the output names the page (the file path in --dist)

const tagCache = new WeakMap();

function tagsOf(page) {
  let tokens = tagCache.get(page);
  if (!tokens) {
    tokens = readTags(page.html);
    tagCache.set(page, tokens);
  }
  return tokens;
}

/** Open tags named `name` in the page's own document (not SVG, not <template>). */
function elements(page, name) {
  return tagsOf(page).filter(
    (t) =>
      t.type === "open" && t.name === name && !t.inForeign && !t.inTemplate,
  );
}

function metaByName(page, name) {
  return elements(page, "meta").filter(
    (t) => (t.attrs.name ?? "").trim().toLowerCase() === name,
  );
}

function relTokens(tag) {
  return (tag.attrs.rel ?? "").toLowerCase().split(/\s+/).filter(Boolean);
}

function linksByRel(page, rel) {
  return elements(page, "link").filter((t) => relTokens(t).includes(rel));
}

function makePage({ url, status, html, label, is404 = false }) {
  const page = { url, status, html, kind: "indexable", label };
  if (is404) {
    page.kind = "404";
  } else if (
    metaByName(page, "robots").some((m) =>
      (m.attrs.content ?? "").toLowerCase().includes("noindex"),
    )
  ) {
    page.kind = "noindex";
  }
  return page;
}

// ---------------------------------------------------------------------------
// JSON-LD and visible text — derived from the page model, cached per page
// ---------------------------------------------------------------------------

const jsonldCache = new WeakMap();
const nodeCache = new WeakMap();
const textCache = new WeakMap();

/**
 * The page's <script type="application/ld+json"> blocks, in document order
 * (not inside <template> or SVG): [{ n, data, error }], n counted from 1.
 * `error` holds the JSON.parse message when the block is not JSON.
 */
function jsonldBlocks(page) {
  let blocks = jsonldCache.get(page);
  if (!blocks) {
    blocks = elements(page, "script")
      .filter(
        (t) =>
          (t.attrs.type ?? "").split(";")[0].trim().toLowerCase() ===
          "application/ld+json",
      )
      .map((t, i) => {
        try {
          return { n: i + 1, data: JSON.parse(t.content ?? ""), error: null };
        } catch (err) {
          return { n: i + 1, data: undefined, error: err.message };
        }
      });
    jsonldCache.set(page, blocks);
  }
  return blocks;
}

/** Blocks that parsed. A block that is not JSON is left to jsonld-parse. */
function parsedBlocks(page) {
  return jsonldBlocks(page).filter((b) => b.error === null);
}

/**
 * Every node (JSON object) in a JSON-LD value, depth-first, with its path
 * from the block root (e.g. "potentialAction", "@graph[1].publisher").
 * @context values and value objects (@value) are not nodes.
 */
function* walkNodes(value, path = "") {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      yield* walkNodes(value[i], `${path}[${i}]`);
    }
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (Object.hasOwn(value, "@value")) return;
  yield { node: value, path };
  for (const [key, child] of Object.entries(value)) {
    if (key !== "@context") {
      yield* walkNodes(child, path ? `${path}.${key}` : key);
    }
  }
}

/** Every node of every parsed block, nested ones included: [{ block, node, path }]. */
function nodesOf(page) {
  let nodes = nodeCache.get(page);
  if (!nodes) {
    nodes = [];
    for (const block of parsedBlocks(page)) {
      for (const { node, path } of walkNodes(block.data)) {
        nodes.push({ block, node, path });
      }
    }
    nodeCache.set(page, nodes);
  }
  return nodes;
}

/** The top-level nodes of a block: each item, or the members of its @graph. */
function topNodes(data) {
  const items = Array.isArray(data) ? data : [data];
  return items.flatMap((item) => {
    if (isObject(item) && Object.hasOwn(item, "@graph")) {
      const graph = item["@graph"];
      return Array.isArray(graph) ? graph : [graph];
    }
    return [item];
  });
}

const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** A node's @type names (string or array); "https://schema.org/X" and "schema:X" count as "X". */
function typesOf(node) {
  if (!isObject(node)) return [];
  const raw = node["@type"];
  return (Array.isArray(raw) ? raw : [raw])
    .filter((t) => typeof t === "string" && t.trim() !== "")
    .map((t) => t.trim().replace(/^(?:https?:\/\/schema\.org\/|schema:)/i, ""));
}

const hasType = (node, type) => typesOf(node).includes(type);

/** Where a node sits, for messages: "block 2" or "block 2, potentialAction". */
const where = (block, path) =>
  path ? `block ${block.n}, ${path}` : `block ${block.n}`;

const SCHEMA_ORG_URL = /^https?:\/\/schema\.org\/?$/i;

/**
 * A schema.org @context: the schema.org URL (http or https, with or without
 * the trailing "/"), an array that holds one, or an object whose @vocab is one.
 */
function isSchemaOrgContext(ctx) {
  if (typeof ctx === "string") return SCHEMA_ORG_URL.test(ctx.trim());
  if (Array.isArray(ctx)) return ctx.some(isSchemaOrgContext);
  if (isObject(ctx)) {
    const vocab = ctx["@vocab"];
    return typeof vocab === "string" && SCHEMA_ORG_URL.test(vocab.trim());
  }
  return false;
}

/** For faq-visible comparisons: NFC, every whitespace character removed, lowercased. */
function compactText(s) {
  return s.normalize("NFC").replace(/\s+/g, "").toLowerCase();
}

/**
 * The page's visible text, compacted: the text of <body> (everything after
 * the <body> tag) minus <script>, <style> and <template>. Text on either side
 * of a tag is joined with nothing in between, then all whitespace is removed,
 * so a question split by <br> or by a block element still matches. Text
 * inside a closed <details> or a [hidden] element counts. No <body> tag: the
 * text after </head>, or the whole document if there is no </head> either.
 */
function visibleText(page) {
  let text = textCache.get(page);
  if (text === undefined) {
    const tokens = tagsOf(page);
    let start = tokens.findIndex(
      (t) =>
        t.type === "open" && t.name === "body" && !t.inForeign && !t.inTemplate,
    );
    if (start === -1) {
      start = tokens.findIndex((t) => t.type === "close" && t.name === "head");
    }
    const parts = [];
    for (const t of tokens.slice(start + 1)) {
      if (t.inTemplate) continue;
      if (t.type === "text") parts.push(decodeEntities(t.text));
      else if (t.type === "open" && RCDATA.has(t.name)) {
        parts.push(t.content ?? ""); // e.g. <textarea>, an SVG <title>
      }
    }
    text = compactText(parts.join(""));
    textCache.set(page, text);
  }
  return text;
}

// ---------------------------------------------------------------------------
// URLs — what the url-* rules and asset-missing look at, cached per page
// ---------------------------------------------------------------------------

const urlCache = new WeakMap();
const META_URL_KEYS = ["og:url", "og:image", "twitter:image"];
const JSONLD_PATH_KEYS = new Set(["url", "item", "logo", "image", "sameAs"]);

function withoutHash(url) {
  const u = new URL(url);
  u.hash = "";
  return u.href;
}

const bareHost = (url) => new URL(url).hostname.replace(/^www\./, "");

/** Same hostname as the origin, ignoring the scheme and a leading "www.". */
function isSameSite(url, origin) {
  try {
    return bareHost(url) === bareHost(origin);
  } catch {
    return false;
  }
}

function isSchemaOrgUrl(url) {
  try {
    return bareHost(url) === "schema.org";
  } catch {
    return false;
  }
}

/** The base for the page's relative URLs: its first <base href>, else its own URL. */
function baseOf(page) {
  const base = elements(page, "base").find((t) => t.attrs.href !== undefined);
  if (base) {
    try {
      return new URL(base.attrs.href.trim(), page.url).href;
    } catch {
      // an unusable <base href> is ignored
    }
  }
  return page.url;
}

/**
 * Every string in a JSON-LD value with its nearest object key (array indexes
 * are skipped over). Nothing under @context, and no @id value.
 */
function* walkStrings(value, key = "") {
  if (typeof value === "string") {
    yield { key, value };
  } else if (Array.isArray(value)) {
    for (const item of value) yield* walkStrings(item, key);
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k !== "@context" && k !== "@id") yield* walkStrings(v, k);
    }
  }
}

/**
 * Every URL occurrence on the page, in document order:
 *   [{ raw, url, where, jsonld, relative }]
 *   raw       as written
 *   url       absolute (resolved against baseOf(page)), #fragment removed
 *   where     e.g. "<a href>", "og:image", "JSON-LD logo"
 *   jsonld    it comes from a JSON-LD block
 *   relative  a JSON-LD "/..." string (always fails url-canonical-form)
 * Left out: empty and "#..." values, schemes other than http(s) (mailto:,
 * tel:, javascript:, data:...), and values that do not parse as a URL.
 */
function urlsOf(page) {
  let urls = urlCache.get(page);
  if (urls) return urls;
  urls = [];
  const base = baseOf(page);
  const add = (raw, where, jsonld = false) => {
    const value = raw.trim();
    if (value === "" || value.startsWith("#")) return;
    let u;
    try {
      u = new URL(value, base);
    } catch {
      return;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return;
    u.hash = "";
    const relative = jsonld && value.startsWith("/");
    urls.push({ raw: value, url: u.href, where, jsonld, relative });
  };

  for (const t of elements(page, "a")) {
    if (t.attrs.href !== undefined) add(t.attrs.href, "<a href>");
  }
  for (const t of elements(page, "img")) {
    if (t.attrs.src !== undefined) add(t.attrs.src, "<img src>");
  }
  for (const t of elements(page, "link")) {
    if (t.attrs.href === undefined) continue;
    if (relTokens(t).includes("canonical")) {
      add(t.attrs.href, '<link rel="canonical">');
    } else if ((t.attrs.rel ?? "").toLowerCase().includes("icon")) {
      add(t.attrs.href, `<link rel="${t.attrs.rel.trim()}">`);
    }
  }
  for (const t of elements(page, "meta")) {
    const key = (t.attrs.property ?? t.attrs.name ?? "").trim().toLowerCase();
    if (META_URL_KEYS.includes(key) && t.attrs.content !== undefined) {
      add(t.attrs.content, key);
    }
  }
  for (const block of parsedBlocks(page)) {
    for (const { key, value } of walkStrings(block.data)) {
      if (/^https?:\/\//i.test(value)) {
        if (!isSchemaOrgUrl(value)) add(value, `JSON-LD ${key}`, true);
      } else if (value.startsWith("/") && JSONLD_PATH_KEYS.has(key)) {
        add(value, `JSON-LD ${key}`, true);
      }
    }
  }
  urlCache.set(page, urls);
  return urls;
}

/**
 * Groups occurrences into distinct URLs (one finding each): the same absolute
 * URL is one entry, and a relative JSON-LD URL is its own entry. `where`
 * lists every place the URL appeared; `raw` is how it was first written.
 */
function distinctUrls(occurrences) {
  const byKey = new Map();
  for (const o of occurrences) {
    const key = `${o.url}\n${o.relative}`;
    const entry = byKey.get(key);
    if (entry) entry.places.add(o.where);
    else byKey.set(key, { ...o, places: new Set([o.where]) });
  }
  return [...byKey.values()].map(({ places, ...o }) => ({
    ...o,
    where: [...places].join(", "),
  }));
}

const describe = (u) => `${u.raw} (${u.where})`;
const pathKind = (url) => urlKind(new URL(url).pathname);

/** What canonical-self reports for a page; [] when it passes. */
function canonicalSelfProblems(page) {
  const canonicals = linksByRel(page, "canonical");
  // A noindex page may have no canonical; if it has any, the indexable rule holds.
  if (page.kind === "noindex" && canonicals.length === 0) return [];
  const hrefs = canonicals
    .map((t) => (t.attrs.href ?? "").trim() || "(no href)")
    .join(", ");
  if (page.kind === "404") {
    return canonicals.length
      ? [`the 404 must have no <link rel="canonical">, found ${hrefs}`]
      : [];
  }
  if (canonicals.length !== 1) {
    const [problem] = exactlyOne(canonicals.length, '<link rel="canonical">');
    return [canonicals.length ? `${problem} (${hrefs})` : problem];
  }
  if (!sameUrl(hrefs, page.url)) {
    return [`canonical is ${hrefs}, expected ${page.url}`];
  }
  return [];
}

/**
 * The URL a same-site link must use to reach `page`, without #fragment: its
 * canonical, unless the page has none (or several) or, for a page in the
 * checked set, its canonical fails canonical-self; then the page's own URL.
 * A page outside the checked set (--url: a link target that is not in the
 * sitemap) is compared with its canonical as-is.
 */
function canonicalFormOf(page, inPageSet) {
  if (inPageSet && canonicalSelfProblems(page).length > 0) return page.url;
  const canonicals = linksByRel(page, "canonical");
  if (canonicals.length !== 1) return page.url;
  try {
    const href = (canonicals[0].attrs.href ?? "").trim();
    return withoutHash(new URL(href, baseOf(page)).href);
  } catch {
    return page.url;
  }
}

/** url-resolves over a list of occurrences (a page's, or a sitemap's). */
async function unresolvedPageUrls(occurrences, site) {
  const findings = [];
  const pages = occurrences.filter(
    (o) => isSameSite(o.url, site.origin) && pathKind(o.url) === "page",
  );
  for (const u of distinctUrls(pages)) {
    const r = await site.resolve(u.url);
    if (!r.exists)
      findings.push(`${describe(u)} leads to no page: ${r.reason}`);
  }
  return findings;
}

/** url-canonical-form over a list of occurrences (a page's, or a sitemap's). */
async function nonCanonicalPageUrls(occurrences, site) {
  const findings = [];
  const pages = occurrences.filter(
    (o) => isSameSite(o.url, site.origin) && pathKind(o.url) === "page",
  );
  for (const u of distinctUrls(pages)) {
    const r = await site.resolve(u.url);
    const expected =
      r.exists && r.page ? canonicalFormOf(r.page, r.inPageSet) : null;
    if (u.relative) {
      const hint = expected ? `: ${expected}` : "";
      findings.push(
        `${describe(u)} is relative; JSON-LD needs the absolute URL${hint}`,
      );
    } else if (expected && !sameUrl(u.url, expected)) {
      findings.push(
        `${describe(u)} is not the canonical form of the page it leads to: ${expected}`,
      );
    }
  }
  return findings;
}

/**
 * The pathname of `url` if it has an uppercase letter (Unicode Lu), else null.
 * It is percent-decoded first, the same test as siteUrl() in src/utils/url.ts.
 * With malformed percent-encoding, every %XX escape is dropped instead, so only
 * literal letters count, and the pathname is returned as written.
 */
function uppercasePath(url) {
  const pathname = new URL(url).pathname;
  let decoded = null;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // malformed percent-encoding: tested without its escapes, below
  }
  const tested = decoded ?? pathname.replace(/%[0-9A-Fa-f]{2}/g, "");
  return /\p{Lu}/u.test(tested) ? (decoded ?? pathname) : null;
}

/** url-lowercase over a list of occurrences (a page's, or a sitemap's). */
function uppercasePageUrls(occurrences, site) {
  const pages = occurrences.filter(
    (o) => isSameSite(o.url, site.origin) && pathKind(o.url) === "page",
  );
  const findings = [];
  for (const u of distinctUrls(pages)) {
    const shown = uppercasePath(u.url);
    if (shown !== null) {
      findings.push(
        `${describe(u)} has an uppercase letter in its path: ${shown}`,
      );
    }
  }
  return findings;
}

/** A page's own URL as an occurrence, so url-lowercase merges it with the same URL on the page. */
const ownUrlOccurrence = (page) => ({
  raw: page.url,
  url: page.url,
  where: "own URL",
  jsonld: false,
  relative: false,
});

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------
//
// Each rule: { id, severity: 'error' | 'warning', check(page, site) }, plus
// an optional checkSitemap(site, occurrences) for the rules that also look at
// the sitemaps' page <loc>s (their findings are grouped under the sitemap
// file, see runRules).
// check returns (or resolves to) an array of messages, one per finding.
// `site` is the adapter's site context:
//   site.origin       the site's origin, e.g. https://example.com
//   site.pages        every page model
//   site.sitemapLocs  every page <loc> in the sitemaps: [{ loc, source }],
//                     where source names the sitemap that lists it
//   site.resolve(url) async; for a same-site URL it returns
//                     { exists, kind: 'page' | 'asset', page, inPageSet,
//                       target, reason }
//                     where `page` is the page model it leads to (or null)
//                     and inPageSet says whether that page is one of
//                     site.pages (canonical-self only judges those)
// An empty 404 gets 404-empty and no other rule (see runRules). A JSON-LD
// block that is not JSON is reported only by jsonld-parse: the other JSON-LD
// rules read parsedBlocks() / nodesOf(), which leave it out.

const PLACEHOLDERS = [
  { text: "[CLIENTE]" },
  { text: "example.com" },
  { text: "My Website" },
  { text: "My Site" },
  { text: "Nueva web app" },
  { text: "tuagencia" },
  { text: "lorem ipsum", anyCase: true },
];

function countOccurrences(haystack, needle, anyCase) {
  const h = anyCase ? haystack.toLowerCase() : haystack;
  const nd = anyCase ? needle.toLowerCase() : needle;
  let count = 0;
  for (let i = h.indexOf(nd); i !== -1; i = h.indexOf(nd, i + nd.length))
    count++;
  return count;
}

/** "no X" / "N X elements, expected exactly 1" for a count that must be 1. */
function exactlyOne(count, what) {
  if (count === 0) return [`no ${what}`];
  if (count > 1) return [`${count} ${what} elements, expected exactly 1`];
  return [];
}

const DEPRECATED_TYPES = ["ProfessionalService", "SearchAction", "HowTo"];

/** The @types local-address checks; a subtype added to LocalBusinessType in src/config/companyInfo.ts goes here too. */
const LOCAL_BUSINESS_TYPES = [
  "LocalBusiness",
  "LegalService",
  "Attorney",
  "ProfessionalService",
];
const ADDRESS_FIELDS = ["streetAddress", "addressLocality", "addressCountry"];

const RULES = [
  {
    id: "jsonld-parse",
    severity: "error",
    check(page) {
      const findings = [];
      for (const block of jsonldBlocks(page)) {
        if (block.error !== null) {
          findings.push(`block ${block.n} is not valid JSON: ${block.error}`);
          continue;
        }
        const problems = [];
        const isArray = Array.isArray(block.data);
        const items = isArray ? block.data : [block.data];
        if (items.length === 0) problems.push("empty array, no @context");
        items.forEach((item, i) => {
          const at = isArray ? `[${i}] ` : "";
          if (!isObject(item)) {
            problems.push(`${at}is not a JSON object`);
            return;
          }
          if (!Object.hasOwn(item, "@context")) {
            problems.push(`${at}has no @context`);
          } else if (!isSchemaOrgContext(item["@context"])) {
            const ctx = JSON.stringify(item["@context"]);
            problems.push(
              `${at}has a @context that is not schema.org (${ctx})`,
            );
          }
          if (Object.hasOwn(item, "@graph")) {
            const graph = item["@graph"];
            (Array.isArray(graph) ? graph : [graph]).forEach((member, j) => {
              if (typesOf(member).length === 0) {
                problems.push(`${at}@graph[${j}] has no @type`);
              }
            });
          } else if (typesOf(item).length === 0) {
            problems.push(`${at}has no @type`);
          }
        });
        if (problems.length) {
          findings.push(`block ${block.n}: ${problems.join("; ")}`);
        }
      }
      return findings;
    },
  },
  {
    id: "jsonld-id-resolves",
    severity: "error",
    check(page) {
      // @ids are compared as IRIs resolved against the page's own URL.
      const iri = (id) => {
        try {
          return new URL(id.trim(), page.url).href;
        } catch {
          return id.trim();
        }
      };
      const nodes = nodesOf(page);
      const defined = new Set(
        nodes
          .filter(
            ({ node }) =>
              typeof node["@id"] === "string" && typesOf(node).length > 0,
          )
          .map(({ node }) => iri(node["@id"])),
      );
      const findings = [];
      for (const { block, node, path } of nodes) {
        const keys = Object.keys(node);
        if (keys.length !== 1 || keys[0] !== "@id") continue; // not a reference node
        const id = node["@id"];
        if (typeof id !== "string" || !defined.has(iri(id))) {
          findings.push(
            `${where(block, path)} references @id ${JSON.stringify(id)}, which no typed node on this page defines`,
          );
        }
      }
      return findings;
    },
  },
  {
    id: "jsonld-noindex",
    severity: "error",
    check(page) {
      if (page.kind !== "noindex" && page.kind !== "404") return [];
      const blocks = parsedBlocks(page);
      if (blocks.length === 0) return [];
      const types = [
        ...new Set(blocks.flatMap((b) => topNodes(b.data).flatMap(typesOf))),
      ];
      const who = page.kind === "404" ? "the 404" : "a noindex page";
      const list = types.length ? ` (${types.join(", ")})` : "";
      return [
        `${who} must carry no JSON-LD, found ${plural(blocks.length, "block")}${list}`,
      ];
    },
  },
  {
    id: "title-description",
    severity: "error",
    check(page) {
      const problems = [];
      const titles = elements(page, "title");
      problems.push(...exactlyOne(titles.length, "<title>"));
      if (titles.length === 1 && isBlank(titles[0].content ?? ""))
        problems.push("<title> is empty");
      if (page.kind !== "404") {
        const descriptions = metaByName(page, "description");
        problems.push(
          ...exactlyOne(descriptions.length, '<meta name="description">'),
        );
        if (
          descriptions.length === 1 &&
          isBlank(descriptions[0].attrs.content ?? "")
        ) {
          problems.push('<meta name="description"> is empty');
        }
      }
      return problems.length ? [problems.join("; ")] : [];
    },
  },
  {
    id: "canonical-self",
    severity: "error",
    check: (page) => canonicalSelfProblems(page),
  },
  {
    id: "robots-single",
    severity: "error",
    check(page) {
      const robots = metaByName(page, "robots");
      if (robots.length <= 1) return [];
      const contents = robots
        .map((t) => `"${t.attrs.content ?? ""}"`)
        .join(", ");
      return [
        `${robots.length} <meta name="robots"> elements (${contents}), expected at most 1`,
      ];
    },
  },
  {
    id: "url-resolves",
    severity: "error",
    check: (page, site) => unresolvedPageUrls(urlsOf(page), site),
    checkSitemap: (site, occurrences) => unresolvedPageUrls(occurrences, site),
  },
  {
    id: "url-canonical-form",
    severity: "error",
    check: (page, site) => nonCanonicalPageUrls(urlsOf(page), site),
    checkSitemap: (site, occurrences) =>
      nonCanonicalPageUrls(occurrences, site),
  },
  {
    id: "faq-visible",
    severity: "error",
    check(page) {
      const questions = new Set(); // document order, each Question once
      for (const { node } of nodesOf(page)) {
        if (!hasType(node, "FAQPage")) continue;
        for (const { node: q } of walkNodes(node)) {
          if (hasType(q, "Question")) questions.add(q);
        }
      }
      const findings = [];
      for (const q of questions) {
        if (typeof q.name !== "string" || isBlank(q.name)) continue;
        const name = compactText(decodeEntities(q.name));
        if (!visibleText(page).includes(name)) {
          findings.push(
            `question not in the visible text: ${JSON.stringify(q.name.trim())}`,
          );
        }
      }
      return findings;
    },
  },
  {
    id: "breadcrumb-shape",
    severity: "error",
    check(page) {
      const isHome = new URL(page.url).pathname === "/";
      const findings = [];
      for (const { block, node, path } of nodesOf(page)) {
        if (!hasType(node, "BreadcrumbList")) continue;
        const items = node.itemListElement;
        const count = Array.isArray(items)
          ? items.length
          : items == null
            ? 0
            : 1;
        const problems = [];
        if (isHome) problems.push("the home page must have no BreadcrumbList");
        if (count < 2) {
          problems.push(
            `${plural(count, "item")} in itemListElement, expected at least 2`,
          );
        }
        if (problems.length) {
          findings.push(`${where(block, path)}: ${problems.join("; ")}`);
        }
      }
      return findings;
    },
  },
  {
    id: "local-address",
    severity: "error",
    check(page) {
      const findings = [];
      for (const { block, node, path } of nodesOf(page)) {
        const types = typesOf(node).filter((t) =>
          LOCAL_BUSINESS_TYPES.includes(t),
        );
        if (types.length === 0) continue;
        const address = node.address;
        let problem = null;
        if (address === undefined) {
          problem = "no address";
        } else if (!isObject(address)) {
          const kind =
            address === null
              ? "null"
              : Array.isArray(address)
                ? "an array"
                : `a ${typeof address}`;
          problem = `address is ${kind}, not an object`;
        } else {
          const missing = ADDRESS_FIELDS.filter(
            (f) => typeof address[f] !== "string" || isBlank(address[f]),
          );
          if (missing.length) {
            problem = `address has no non-empty string ${missing.join(", ")}`;
          }
        }
        if (problem) {
          findings.push(
            `${where(block, path)}: @type ${types.join(", ")}: ${problem}`,
          );
        }
      }
      return findings;
    },
  },
  {
    id: "url-lowercase",
    severity: "error",
    check: (page, site) =>
      uppercasePageUrls([ownUrlOccurrence(page), ...urlsOf(page)], site),
    checkSitemap: (site, occurrences) => uppercasePageUrls(occurrences, site),
  },
  {
    id: "asset-missing",
    severity: "warning",
    async check(page, site) {
      const assets = urlsOf(page).filter(
        (o) => isSameSite(o.url, site.origin) && pathKind(o.url) === "asset",
      );
      const findings = [];
      for (const u of distinctUrls(assets)) {
        const r = await site.resolve(u.url);
        if (!r.exists)
          findings.push(`${describe(u)} does not exist: ${r.reason}`);
      }
      return findings;
    },
  },
  {
    id: "placeholder-text",
    severity: "warning",
    check(page) {
      const findings = [];
      for (const { text, anyCase = false } of PLACEHOLDERS) {
        const count = countOccurrences(page.html, text, anyCase);
        if (count)
          findings.push(`contains "${text}" (${plural(count, "time")})`);
      }
      return findings;
    },
  },
  {
    id: "404-empty",
    severity: "warning",
    check(page) {
      if (page.kind !== "404" || !isBlank(page.html)) return [];
      return [
        page.html.length === 0
          ? "the 404 page is empty (0 bytes)"
          : "the 404 page contains only whitespace",
      ];
    },
  },
  {
    id: "deprecated-type",
    severity: "warning",
    check(page) {
      const findings = [];
      for (const { block, node, path } of nodesOf(page)) {
        for (const type of typesOf(node)) {
          if (DEPRECATED_TYPES.includes(type)) {
            findings.push(`${where(block, path)}: @type ${type}`);
          }
        }
      }
      return findings;
    },
  },
  {
    id: "external-url-http",
    severity: "warning",
    check(page, site) {
      const external = urlsOf(page).filter(
        (o) => o.jsonld && !isSameSite(o.url, site.origin),
      );
      return distinctUrls(external)
        .filter((u) => new URL(u.url).protocol !== "https:")
        .map((u) => `${describe(u)} uses http:, not https:`);
    },
  },
];

// ---------------------------------------------------------------------------
// Input adapter: --dist <dir>
// ---------------------------------------------------------------------------

/** Every file under `root`, as POSIX paths relative to it. */
async function listFiles(root) {
  const files = new Set();
  async function walk(abs, rel) {
    let entries;
    try {
      entries = await readdir(abs, { withFileTypes: true });
    } catch (err) {
      throw new InputError(`cannot read ${rel || root}: ${err.message}`);
    }
    for (const entry of entries) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(abs, entry.name), childRel);
      else if (entry.isFile() || entry.isSymbolicLink()) files.add(childRel);
    }
  }
  await walk(root, "");
  return files;
}

/** The text of every <loc> in a sitemap, entity-decoded and trimmed. */
function readLocs(xml) {
  const locs = [];
  for (const m of xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc\s*>/g)) {
    const body = m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
    const loc = decodeEntities(body).trim();
    if (loc) locs.push(loc);
  }
  return locs;
}

/** URL → the file path it names inside the build dir (decoded, no leading "/"). */
function localPath(url) {
  return decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
}

/**
 * Reads <dir>/sitemap-index.xml, or <dir>/sitemap.xml if there is no index,
 * following each child <loc> of an index to its local file by pathname.
 * Returns { root, pageLocs: [{ loc, source }] }, where source is the sitemap
 * file that lists the <loc>, or null when neither file exists.
 */
async function readDistSitemaps(dir, dirLabel, files) {
  const root = ["sitemap-index.xml", "sitemap.xml"].find((f) => files.has(f));
  if (!root) return null;
  const pageLocs = [];
  const seen = new Set();

  async function visit(rel) {
    if (seen.has(rel)) return;
    seen.add(rel);
    let xml;
    try {
      xml = await readFile(path.join(dir, rel), "utf8");
    } catch (err) {
      throw new InputError(`cannot read the sitemap ${rel}: ${err.message}`);
    }
    const locs = readLocs(xml);
    if (!/<sitemapindex[\s>]/.test(xml)) {
      for (const loc of locs) pageLocs.push({ loc, source: rel });
      return;
    }
    for (const loc of locs) {
      let child;
      try {
        child = localPath(loc);
      } catch {
        throw new InputError(
          `the sitemap ${rel} lists a child sitemap that is not a valid URL: ${loc}`,
        );
      }
      if (!files.has(child)) {
        throw new InputError(
          `the sitemap ${rel} lists ${loc}, but ${child} does not exist in ${dirLabel}`,
        );
      }
      await visit(child);
    }
  }

  await visit(root);
  return { root, pageLocs };
}

function originOfSitemap(sitemap) {
  if (!sitemap) {
    throw new InputError(
      "no sitemap-index.xml or sitemap.xml, so the origin is unknown: pass --site <origin>",
    );
  }
  const origins = new Set(
    sitemap.pageLocs.map(({ loc }) => httpOrigin(loc)).filter(Boolean),
  );
  if (origins.size === 0) {
    throw new InputError(
      `the sitemaps (${sitemap.root}) list no page <loc> to take the origin from: pass --site <origin>`,
    );
  }
  if (origins.size > 1) {
    throw new InputError(
      `the page <loc>s use more than one origin (${[...origins].join(", ")}): pass --site <origin>`,
    );
  }
  return [...origins][0];
}

/**
 * A page's own URL from its file:
 *   index.html → <origin>/ · <path>/index.html → <origin>/<path>/ · <name>.html → <origin>/<name>
 */
function ownUrl(rel, origin) {
  let p;
  if (rel === "index.html") p = "/";
  else if (rel.endsWith("/index.html"))
    p = `/${rel.slice(0, -"index.html".length)}`;
  else p = `/${rel.slice(0, -".html".length)}`;
  return new URL(p.replace(/[%?#\\]/g, encodeURIComponent), origin).href;
}

/**
 * Resolves a same-site URL against the build (only its pathname is used):
 *   ends in "/"    → <dir><path>index.html
 *   ends in .html  → that file
 *   no extension   → <dir><path>/index.html, then <dir><path>.html
 *   any other ext. → that file (an asset)
 * The lookup is case-sensitive on every file system (a Set of real names).
 */
function resolveInDist(url, files, pagesByFile) {
  let encoded;
  try {
    encoded = new URL(url).pathname;
  } catch {
    return {
      exists: false,
      kind: null,
      page: null,
      inPageSet: false,
      target: null,
      reason: "not a valid URL",
    };
  }
  let pathname;
  try {
    pathname = decodeURIComponent(encoded);
  } catch {
    return {
      exists: false,
      kind: urlKind(encoded),
      page: null,
      inPageSet: false,
      target: null,
      reason: "malformed percent-encoding in the path",
    };
  }
  const kind = urlKind(pathname);
  let candidates;
  if (pathname.endsWith("/")) candidates = [`${pathname}index.html`];
  else if (kind === "page" && !pathname.toLowerCase().endsWith(".html")) {
    candidates = [`${pathname}/index.html`, `${pathname}.html`];
  } else candidates = [pathname];
  const rels = candidates.map((c) => c.replace(/^\/+/, ""));
  const target = rels.find((rel) => files.has(rel));
  if (target) {
    const page = pagesByFile.get(target) ?? null;
    return {
      exists: true,
      kind,
      page,
      inPageSet: page !== null,
      target,
      reason: null,
    };
  }
  return {
    exists: false,
    kind,
    page: null,
    inPageSet: false,
    target: null,
    reason: `no file ${rels.join(" or ")}`,
  };
}

async function loadDist(dirArg, siteOrigin) {
  const dir = path.resolve(dirArg);
  let info;
  try {
    info = await stat(dir);
  } catch {
    throw new InputError(`--dist: ${dirArg} does not exist`);
  }
  if (!info.isDirectory())
    throw new InputError(`--dist: ${dirArg} is not a directory`);

  const files = await listFiles(dir);
  const sitemap = await readDistSitemaps(dir, dirArg, files);
  const origin = siteOrigin ?? originOfSitemap(sitemap);

  const pages = [];
  for (const rel of [...files].filter((f) => f.endsWith(".html")).sort()) {
    let html;
    try {
      html = await readFile(path.join(dir, rel), "utf8");
    } catch (err) {
      throw new InputError(`cannot read ${rel}: ${err.message}`);
    }
    const is404 = rel === "404.html";
    pages.push(
      makePage({
        url: ownUrl(rel, origin),
        status: is404 ? 404 : 200,
        html,
        label: rel,
        is404,
      }),
    );
  }
  const pagesByFile = new Map(pages.map((p) => [p.label, p]));

  return {
    heading: `check-seo --dist ${dirArg} · origin ${origin} (${siteOrigin ? "--site" : sitemap.root})`,
    pages,
    site: {
      origin,
      pages,
      sitemapLocs: sitemap ? sitemap.pageLocs : [],
      resolve: async (url) => resolveInDist(url, files, pagesByFile),
    },
  };
}

// ---------------------------------------------------------------------------
// Input adapter: --url <origin>
// ---------------------------------------------------------------------------

const USER_AGENT = "astro-harness-check-seo";
const TIMEOUT_MS = 10_000;
const MAX_PARALLEL = 4;

/** Runs the jobs it is given, at most `max` at a time. */
function limiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { job, resolve, reject } = queue.shift();
    job()
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (job) =>
    new Promise((resolve, reject) => {
      queue.push({ job, resolve, reject });
      next();
    });
}

/** A short reason for a failed fetch (the error code when there is one). */
function fetchError(err) {
  if (err?.name === "TimeoutError") {
    return `no answer in ${TIMEOUT_MS / 1000} s`;
  }
  const cause = err?.cause;
  const code =
    cause?.code ?? cause?.errors?.find((e) => e?.code)?.code ?? cause?.message;
  return `request failed${code ? ` (${code})` : ""}`;
}

/**
 * The run's HTTP client. Every request: redirects not followed, a 10 s
 * timeout, the check-seo User-Agent, at most 4 at a time, and each
 * (method, URL) sent once. A response is { status, location, body } (body
 * only when asked for and the status is 2xx) or { error } for a timeout or a
 * network error.
 */
function httpClient() {
  const limit = limiter(MAX_PARALLEL);
  const cache = new Map();

  async function send(url, method, readBody) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "manual",
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const ok = res.status >= 200 && res.status < 300;
      let body = null;
      if (readBody && ok) body = await res.text();
      else await res.body?.cancel();
      return {
        status: res.status,
        location: res.headers.get("location"),
        body,
      };
    } catch (err) {
      return { error: fetchError(err) };
    }
  }

  /** GET with the body (pages, sitemaps, robots.txt). */
  function get(url) {
    const key = `GET ${url}`;
    if (!cache.has(key))
      cache.set(
        key,
        limit(() => send(url, "GET", true)),
      );
    return cache.get(key);
  }

  /** An asset: HEAD, then a body-less GET on a 405 or 501. A GET already sent counts. */
  async function probe(url) {
    const done = cache.get(`GET ${url}`);
    if (done) return done;
    const headKey = `HEAD ${url}`;
    if (!cache.has(headKey)) {
      cache.set(
        headKey,
        limit(() => send(url, "HEAD", false)),
      );
    }
    const head = await cache.get(headKey);
    if (head.error || (head.status !== 405 && head.status !== 501)) return head;
    const getKey = `GET-nobody ${url}`;
    if (!cache.has(getKey)) {
      cache.set(
        getKey,
        limit(() => send(url, "GET", false)),
      );
    }
    return cache.get(getKey);
  }

  return { get, probe };
}

const is2xx = (res) => !res.error && res.status >= 200 && res.status < 300;

/** "HTTP 301 → /faq/", "HTTP 404", or why the request failed. */
function describeResponse(res) {
  if (res.error) return res.error;
  return res.location
    ? `HTTP ${res.status} → ${res.location}`
    : `HTTP ${res.status}`;
}

/**
 * Finds and reads the live site's sitemaps: the Sitemap: lines of
 * <origin>/robots.txt, or else <origin>/sitemap-index.xml, then
 * <origin>/sitemap.xml. Sitemap indexes are followed. A sitemap that does not
 * answer 2xx (a redirect included) cannot be fetched: exit 2.
 * Returns { rootSource, pageLocs: [{ loc, source }] }, source = sitemap URL.
 */
async function readUrlSitemaps(origin, http) {
  const robotsUrl = new URL("/robots.txt", origin).href;
  const robots = await http.get(robotsUrl);
  let roots = [];
  if (is2xx(robots)) {
    for (const m of (robots.body ?? "").matchAll(
      /^[ \t]*sitemap[ \t]*:[ \t]*(\S+)/gim,
    )) {
      try {
        roots.push(new URL(m[1], robotsUrl).href);
      } catch {
        throw new InputError(
          `robots.txt has a Sitemap: line that is not a URL: ${m[1]}`,
        );
      }
    }
  }
  let rootSource = "robots.txt";
  if (roots.length === 0) {
    const tried = [
      `robots.txt: ${is2xx(robots) ? "no Sitemap: line" : describeResponse(robots)}`,
    ];
    for (const name of ["sitemap-index.xml", "sitemap.xml"]) {
      const url = new URL(`/${name}`, origin).href;
      const res = await http.get(url);
      if (is2xx(res)) {
        roots = [url];
        rootSource = name;
        break;
      }
      tried.push(`${name}: ${describeResponse(res)}`);
    }
    if (roots.length === 0) {
      throw new InputError(
        `cannot fetch a sitemap of ${origin} (${tried.join("; ")})`,
      );
    }
  }

  const pageLocs = [];
  const seen = new Set();
  async function visit(url) {
    if (seen.has(url)) return;
    seen.add(url);
    const res = await http.get(url);
    if (!is2xx(res)) {
      throw new InputError(
        `cannot fetch the sitemap ${url}: ${describeResponse(res)}`,
      );
    }
    const xml = res.body ?? "";
    const locs = readLocs(xml);
    if (!/<sitemapindex[\s>]/.test(xml)) {
      for (const loc of locs) pageLocs.push({ loc, source: url });
      return;
    }
    for (const loc of locs) {
      let child;
      try {
        child = new URL(loc).href;
      } catch {
        throw new InputError(
          `the sitemap ${url} lists a child sitemap that is not a valid URL: ${loc}`,
        );
      }
      await visit(child);
    }
  }
  for (const root of roots) await visit(root);
  return { rootSource, pageLocs };
}

async function loadUrl(origin) {
  const http = httpClient();
  const sitemap = await readUrlSitemaps(origin, http);
  if (sitemap.pageLocs.length === 0) {
    throw new InputError(`the sitemaps of ${origin} list no page <loc>`);
  }

  // The pages: every same-site page <loc>, fetched with GET. Other hosts are
  // external URLs, which are never requested.
  const locUrls = new Set();
  const otherHosts = new Set();
  for (const { loc } of sitemap.pageLocs) {
    let u;
    try {
      u = new URL(loc);
    } catch {
      continue;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    u.hash = "";
    if (!isSameSite(u.href, origin)) otherHosts.add(u.origin);
    else if (pathKind(u.href) === "page") locUrls.add(u.href);
  }
  if (locUrls.size === 0 && otherHosts.size > 0) {
    throw new InputError(
      `no page <loc> in the sitemaps of ${origin} is on that site; they are on ${[...otherHosts].join(", ")}: pass that origin to --url`,
    );
  }
  const urls = [...locUrls];
  const responses = await Promise.all(urls.map((url) => http.get(url)));
  const pages = [];
  urls.forEach((url, i) => {
    const res = responses[i];
    if (!res.error && res.status === 200) {
      pages.push(
        makePage({ url, status: 200, html: res.body ?? "", label: url }),
      );
    }
  });
  pages.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
  const pageByUrl = new Map(pages.map((p) => [p.url, p]));
  const offSitemap = new Map(); // link targets that are not sitemap pages

  // Pages need a 200 with no redirect; assets need a 2xx.
  async function resolve(url) {
    const kind = pathKind(url);
    const res = kind === "page" ? await http.get(url) : await http.probe(url);
    const ok = kind === "page" ? !res.error && res.status === 200 : is2xx(res);
    if (!ok) {
      return {
        exists: false,
        kind,
        page: null,
        inPageSet: false,
        target: null,
        reason: describeResponse(res),
      };
    }
    if (kind === "asset") {
      return {
        exists: true,
        kind,
        page: null,
        inPageSet: false,
        target: url,
        reason: null,
      };
    }
    let page = pageByUrl.get(url);
    const inPageSet = page !== undefined;
    if (!page) {
      page = offSitemap.get(url);
      if (!page) {
        page = makePage({ url, status: 200, html: res.body ?? "", label: url });
        offSitemap.set(url, page);
      }
    }
    return { exists: true, kind, page, inPageSet, target: url, reason: null };
  }

  // Request every same-site URL the pages use now, 4 at a time, so the rules
  // read answers that are already cached.
  const sameSite = new Set(
    pages
      .flatMap((p) => urlsOf(p))
      .map((o) => o.url)
      .filter((url) => isSameSite(url, origin)),
  );
  await Promise.all([...sameSite].map((url) => resolve(url)));

  const skipped = otherHosts.size
    ? `\n(page <loc>s on ${[...otherHosts].join(", ")} are not on this site and were not checked)`
    : "";
  return {
    heading: `check-seo --url ${origin} · sitemaps from ${sitemap.rootSource}${skipped}`,
    pages,
    site: { origin, pages, sitemapLocs: sitemap.pageLocs, resolve },
  };
}

// ---------------------------------------------------------------------------
// Runner and output
// ---------------------------------------------------------------------------

/** The sitemaps' page <loc>s as URL occurrences, grouped by the sitemap that lists them. */
function sitemapOccurrences(site) {
  const bySource = new Map();
  for (const { loc, source } of site.sitemapLocs) {
    let u;
    try {
      u = new URL(loc);
    } catch {
      continue;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    u.hash = "";
    if (!bySource.has(source)) bySource.set(source, []);
    bySource.get(source).push({
      raw: loc,
      url: u.href,
      where: "sitemap <loc>",
      jsonld: false,
      relative: false,
    });
  }
  return bySource;
}

/**
 * Runs every rule on every page, then the sitemap checks on each sitemap's
 * page <loc>s. Returns [{ label, findings }]: the pages first, then one entry
 * per sitemap file.
 */
async function runRules(pages, site) {
  const results = [];
  for (const page of pages) {
    const findings = [];
    const empty404 = page.kind === "404" && isBlank(page.html);
    for (const rule of RULES) {
      if (empty404 && rule.id !== "404-empty") continue;
      for (const message of await rule.check(page, site)) {
        findings.push({ rule: rule.id, severity: rule.severity, message });
      }
    }
    results.push({ label: page.label, findings });
  }
  for (const [source, occurrences] of sitemapOccurrences(site)) {
    const findings = [];
    for (const rule of RULES) {
      if (!rule.checkSitemap) continue;
      for (const message of await rule.checkSitemap(site, occurrences)) {
        findings.push({ rule: rule.id, severity: rule.severity, message });
      }
    }
    results.push({ label: source, findings });
  }
  return results;
}

function printReport(heading, results, pageCount, opts) {
  const ruleWidth = Math.max(...RULES.map((r) => r.id.length));
  const lines = [heading, ""];
  let errors = 0;
  let warnings = 0;
  for (const { label, findings } of results) {
    if (findings.length === 0) continue;
    lines.push(label);
    for (const f of findings) {
      if (f.severity === "error") errors++;
      else warnings++;
      lines.push(
        `  ${f.severity.padEnd(7)}  ${f.rule.padEnd(ruleWidth)}  ${f.message}`,
      );
    }
    lines.push("");
  }
  let summary = `${plural(pageCount, "page")}, ${plural(errors, "error")}, ${plural(warnings, "warning")}`;
  if (opts.strict && warnings > 0)
    summary += " (--strict: warnings count as errors)";
  const failed = errors > 0 || (opts.strict && warnings > 0);
  if (failed && opts.report) summary += " (--report: exit 0)";
  lines.push(summary);
  console.log(lines.join("\n"));
  return failed;
}

async function main(argv) {
  const opts = parseArgs(argv);
  const input =
    opts.dist !== null
      ? await loadDist(opts.dist, opts.site)
      : await loadUrl(opts.url);
  const results = await runRules(input.pages, input.site);
  const failed = printReport(input.heading, results, input.pages.length, opts);
  return failed && !opts.report ? 1 : 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    if (err instanceof InputError) {
      console.error(`check-seo: ${err.message}`);
      if (err.usage) console.error(`\n${USAGE}`);
    } else {
      console.error(`check-seo: internal error: ${err?.stack ?? err}`);
    }
    process.exitCode = 2;
  },
);
