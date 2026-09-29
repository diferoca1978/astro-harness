// Absolute URLs — the only place in src/ that reads astro.config.mjs `site`.
// Build every absolute URL with siteUrl(); never hardcode the domain.
// A media field (an image or a video) may live on a CDN: build it with mediaUrl().

const SITE = import.meta.env.SITE;

// Same rule as path.posix.extname() in harness/check-seo.mjs: a dot only at the
// start of the segment, or the segment '..', is not an extension.

function hasExtension(segment: string): boolean {
  const dot = segment.lastIndexOf('.');
  return dot > 0 && segment !== '..';
}

// `path` starts with '/', but not '//' (new URL would read that as another host).
// Its ?query and #fragment are kept as they are.
// Page path (no extension in the last segment): its percent-decoded pathname must be
// lowercase (the same test as check-seo's url-lowercase), and it gets a trailing '/'
// (trailingSlash: 'always'). Asset path (has an extension): left as it is.

export function siteUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`siteUrl(): the path must start with '/', got '${path}'`);
  }
  if (path.startsWith('//')) {
    throw new Error(`siteUrl(): the path must not start with '//' (another host), got '${path}'`);
  }

  const cut = path.search(/[?#]/);
  let pathname = cut === -1 ? path : path.slice(0, cut);
  const suffix = cut === -1 ? '' : path.slice(cut);

  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);

  if (!hasExtension(lastSegment)) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      throw new Error(`siteUrl(): malformed percent-escape in the path '${path}'`);
    }
    if (/\p{Lu}/u.test(decoded)) {
      throw new Error(`siteUrl(): page paths must be lowercase, got '${path}'`);
    }
    if (!pathname.endsWith('/')) pathname += '/';
  }

  return new URL(pathname + suffix, SITE).href;
}

// For media fields only: generatePageSEO's `image`, COMPANY_INFO.logo and .image, and
// Author.image. Page URLs, @ids and breadcrumb items always use siteUrl().
// `src` is an https:// URL, a protocol-relative '//host/…' (some CMSs return it; it
// becomes https:), or a path on this site. Anything else throws, http: included.

export function mediaUrl(src: string): string {
  if (src.startsWith('https://')) return absoluteUrl(src, src);
  if (src.startsWith('//')) return absoluteUrl(`https:${src}`, src);
  if (src.startsWith('/')) return siteUrl(src);

  throw new Error(`mediaUrl(): expected a path on this site or an https:// URL, got '${src}'`);
}

function absoluteUrl(href: string, src: string): string {
  try {
    return new URL(href).href;
  } catch {
    throw new Error(`mediaUrl(): not a valid URL, got '${src}'`);
  }
}
