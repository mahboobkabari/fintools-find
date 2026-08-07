/**
 * Automatic SEO & JSON-LD Schema Generator
 */

export function generateCalculatorSEO(def) {
  const title = def.seo?.title || def.title || `${def.id} | FinTool`;
  const description = def.seo?.metaDescription || def.description || '';
  const canonical = def.seo?.canonical || `https://fintool.find/tools/${def.category}/${def.slug}/`;

  return {
    title,
    metaDescription: description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitterCard: {
      card: 'summary_large_image',
      title,
      description,
    },
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: title,
        description,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fintool.find/' },
          { '@type': 'ListItem', position: 2, name: def.category, item: `https://fintool.find/tools/${def.category}/` },
          { '@type': 'ListItem', position: 3, name: title, item: canonical },
        ],
      },
    ],
  };
}
