import { useEffect } from 'react';

declare const __SITE_URL__: string;

export const SITE_URL = (__SITE_URL__ || 'https://appverse.vercel.app').replace(/\/$/, '');

export interface MetaInput {
  title: string;
  description: string;
  /** Path of the canonical URL, e.g. "/apps/cyber-runner". */
  path: string;
  /** Absolute URL of the social share image. */
  image?: string;
  /** "website" for normal pages, "article" for app detail pages. */
  type?: 'website' | 'article';
  /** JSON-LD structured data for the page. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Applies page metadata — title, description, canonical URL, Open Graph and
 * Twitter cards, plus optional JSON-LD — for the lifetime of the component.
 */
export function useDocumentMeta({
  title,
  description,
  path,
  image = `${SITE_URL}/og-image.png`,
  type = 'website',
  jsonLd,
}: MetaInput) {
  useEffect(() => {
    const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const fullTitle = title.includes('AppVerse') ? title : `${title} · AppVerse`;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'AppVerse');
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    upsertLink('canonical', canonical);

    const scriptId = 'appverse-jsonld';
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, path, image, type, jsonLd]);
}
