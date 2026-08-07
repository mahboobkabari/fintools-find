/**
 * Centralized Structured Data (JSON-LD) Generator for Fintools Find
 */

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fintools Find',
  url: 'https://fintool.org',
  logo: 'https://fintool.org/favicon.svg',
  description: 'Free, institutional-grade financial calculators and wealth planning tools.',
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fintools Find',
  url: 'https://fintool.org',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://fintool.org/tools/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export function generateWebApplicationSchema({ title, description, url, categoryName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url,
    applicationCategory: categoryName || 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript and HTML5 support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function generateFaqSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * @param {{ title: string, description: string, url: string, categoryName?: string, breadcrumbs?: Array<{ name: string, url: string }>, faqs?: Array<{ question: string, answer: string }> }} params
 */
export function generateCombinedSchemas(params) {
  const { title, description, url, categoryName, breadcrumbs = [], faqs = [] } = params || {};
  const schemas = [
    ORGANIZATION_SCHEMA,
    WEBSITE_SCHEMA,
    generateWebApplicationSchema({ title, description, url, categoryName }),
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }

  if (faqs && faqs.length > 0) {
    const faqObj = generateFaqSchema(faqs);
    if (faqObj) schemas.push(faqObj);
  }

  return schemas;
}
