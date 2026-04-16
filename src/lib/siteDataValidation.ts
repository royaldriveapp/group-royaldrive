import { z } from 'zod';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

const MAX_HREF_LEN = 2048;

function sanitizeTelNumber(raw: unknown) {
  if (typeof raw !== 'string') return '';
  const v = raw.trim();
  // Very small allow-list: digits and common tel punctuation.
  if (!/^[0-9+().\\-\\s]{1,64}$/.test(v)) return '';
  return v;
}

function sanitizeEmail(raw: unknown) {
  if (typeof raw !== 'string') return '';
  const v = raw.trim();
  // Basic email allow-list (good enough for mailto href safety).
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)) return '';
  return v;
}

function sanitizeHref(raw: unknown) {
  if (typeof raw !== 'string') return '#';
  const href = raw.trim();

  if (!href || href.length > MAX_HREF_LEN) return '#';
  if (/[\u0000-\u001F\u007F]/.test(href)) return '#';
  if (/\s/.test(href)) return '#';

  const lower = href.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#';
  }

  // Allowed patterns:
  // - Same-page anchors
  // - Site-relative paths
  // - Absolute http(s)
  // - mailto: / tel:
  if (href.startsWith('#')) return href;
  if (href.startsWith('/') && !href.includes('\\')) return href;
  if (lower.startsWith('http://') || lower.startsWith('https://')) return href;
  if (lower.startsWith('mailto:')) {
    const email = sanitizeEmail(href.slice(7));
    return email ? `mailto:${email}` : '#';
  }
  if (lower.startsWith('tel:')) {
    const tel = sanitizeTelNumber(href.slice(4));
    return tel ? `tel:${tel}` : '#';
  }

  return '#';
}

function isYouTubeId(value: string) {
  // video ids are typically 11 chars but some formats differ; allow common safe set.
  return /^[A-Za-z0-9_-]{6,64}$/.test(value);
}

// Minimal schema validation: validate the structure we render, allow extra keys to avoid bricking editor payloads.
const LinkSchema = z
  .object({
    label: z.string(),
    href: z.string(),
  })
  .passthrough();

const SiteDataSchema = z
  .object({
    site: z.object({ title: z.string(), description: z.string(), brandName: z.string(), brandTagline: z.string() }).passthrough(),
    navigation: z.object({ links: z.array(LinkSchema) }).passthrough(),
    hero: z
      .object({
        subtitle: z.string(),
        title: z.string(),
        description: z.string(),
        primaryCta: z.object({ label: z.string(), href: z.string() }).passthrough(),
        secondaryCta: z.object({ label: z.string(), href: z.string() }).passthrough(),
        videoUrl: z.string(),
      })
      .passthrough(),
    about: z.object({ features: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() }).passthrough()).optional() }).passthrough(),
    whyInvest: z.object({}).passthrough(),
    faq: z.object({ items: z.array(z.object({ question: z.string(), answer: z.string() }).passthrough()).optional() }).passthrough(),
    contact: z
      .object({
        allocationOptions: z.array(z.object({ value: z.string(), label: z.string() }).passthrough()).optional(),
      })
      .passthrough(),
    locations: z
      .object({
        offices: z
          .array(
            z.object({
              city: z.string().optional(),
              address: z.string().optional(),
              region: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().optional(),
              mapEmbed: z.string().optional(),
            }).passthrough()
          )
          .optional(),
      })
      .passthrough(),
    footer: z
      .object({
        columns: z
          .array(
            z.object({
              title: z.string().optional(),
              links: z.array(LinkSchema).optional(),
            }).passthrough()
          )
          .optional(),
        socials: z
          .array(
            z
              .object({
                icon: z.string().optional(),
                href: z.string().optional(),
              })
              .passthrough()
          )
          .optional(),
      })
      .passthrough(),
  })
  .passthrough();

export function validateAndSanitizeSiteData(input: unknown) {
  const parsed = SiteDataSchema.parse(input);

  // Enforce videoId safety (used in iframe src).
  if (!isYouTubeId(parsed.hero.videoUrl)) {
    throw new Error('Invalid hero.videoUrl');
  }

  // Sanitize ALL href-like fields used by anchor tags.
  for (const link of parsed.navigation?.links ?? []) {
    link.href = sanitizeHref(link.href);
  }

  if (parsed.hero?.primaryCta) parsed.hero.primaryCta.href = sanitizeHref(parsed.hero.primaryCta.href);
  if (parsed.hero?.secondaryCta) parsed.hero.secondaryCta.href = sanitizeHref(parsed.hero.secondaryCta.href);

  for (const col of parsed.footer?.columns ?? []) {
    for (const link of col.links ?? []) {
      link.href = sanitizeHref(link.href);
    }
  }

  for (const social of parsed.footer?.socials ?? []) {
    social.href = sanitizeHref(social.href);
  }

  // Sanitize location contact fields used to build tel: / mailto: hrefs.
  for (const office of parsed.locations?.offices ?? []) {
    office.phone = sanitizeTelNumber(office.phone);
    office.email = sanitizeEmail(office.email);
  }

  return parsed;
}

export function assertSiteData(input: unknown) {
  if (!isPlainObject(input)) throw new Error('Invalid payload');
  validateAndSanitizeSiteData(input);
}

