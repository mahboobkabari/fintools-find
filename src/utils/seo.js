/**
 * Centralized SEO & Social Metadata Engine for Fintools Find
 */

export const DEFAULT_SITE_TITLE = 'Fintools Find — Free Financial Calculators';
export const DEFAULT_SITE_DESCRIPTION = 'Institutional-grade financial calculators for loans, investments, retirement, and tax planning.';
export const DEFAULT_SITE_ORIGIN = 'https://fintool.org';

export function buildMetadata({ title, description, canonicalUrl, ogImage, robots = 'index, follow' }) {
  const metaTitle = title ? `${title} | Fintools Find` : DEFAULT_SITE_TITLE;
  const metaDesc = description || DEFAULT_SITE_DESCRIPTION;
  const canonical = canonicalUrl || DEFAULT_SITE_ORIGIN;
  const image = ogImage || `${DEFAULT_SITE_ORIGIN}/og-default.png`;

  return {
    title: metaTitle,
    description: metaDesc,
    canonicalUrl: canonical,
    robots,
    openGraph: {
      type: 'website',
      title: metaTitle,
      description: metaDesc,
      url: canonical,
      image,
      siteName: 'Fintools Find',
    },
    twitterCard: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      image,
    },
  };
}
