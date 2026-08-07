import { getCollection } from 'astro:content';

/**
 * Metadata-Driven Internal Linking Resolver
 * @param {Object} options
 * @param {string} [options.type] - Content type ('tool' | 'guide' | 'comparison' | 'glossary' | 'hub')
 * @param {string} options.category - Category string (e.g. 'loans', 'investment', 'tax', 'retirement')
 * @param {string} options.slug - Current page slug
 * @param {number} [options.limit=4] - Max items per category
 */
export async function getRelatedContent({ type, category, slug, limit = 4 }) {
  const normCategory = (category || 'loans').toLowerCase();

  // Fetch collections from Astro SSG Content Store
  const [allTools, allGuides, allComparisons, allGlossary, allHubs] = await Promise.all([
    getCollection('tools').catch(() => []),
    getCollection('guides').catch(() => []),
    getCollection('comparisons').catch(() => []),
    getCollection('glossary').catch(() => []),
    getCollection('hubs').catch(() => []),
  ]);

  // 1. Related Calculators
  const relatedCalculators = allTools
    .filter((t) => {
      const toolSlug = t.data.slug || t.id.replace(/\.md$/, '');
      return toolSlug !== slug && t.data.category?.toLowerCase() === normCategory;
    })
    .slice(0, limit)
    .map((t) => ({
      title: t.data.title,
      slug: t.data.slug || t.id.replace(/\.md$/, ''),
      category: t.data.category,
      url: `/tools/${t.data.category}/${t.data.slug || t.id.replace(/\.md$/, '')}/`,
    }));

  // 2. Related Guides
  const relatedGuides = allGuides
    .filter((g) => {
      const gSlug = g.slug || g.id.replace(/\.md$/, '');
      return gSlug !== slug && (g.data.category?.toLowerCase() === normCategory || normCategory === 'loans');
    })
    .slice(0, limit)
    .map((g) => ({
      title: g.data.title,
      slug: g.slug || g.id.replace(/\.md$/, ''),
      metaDescription: g.data.metaDescription,
      readingTime: g.data.readingTime,
      url: `/guides/${g.slug || g.id.replace(/\.md$/, '')}/`,
    }));

  // 3. Related Comparisons
  const relatedComparisons = allComparisons
    .filter((c) => {
      const cSlug = c.slug || c.data.slug || c.id.replace(/\.md$/, '');
      return cSlug !== slug && (c.data.category?.toLowerCase() === normCategory || normCategory === 'loans');
    })
    .slice(0, limit)
    .map((c) => ({
      title: c.data.title,
      slug: c.slug || c.data.slug || c.id.replace(/\.md$/, ''),
      optionA: c.data.optionA,
      optionB: c.data.optionB,
      url: `/compare/${c.slug || c.data.slug || c.id.replace(/\.md$/, '')}/`,
    }));

  // 4. Related Glossary Terms
  const relatedTerms = allGlossary
    .filter((term) => {
      const termSlug = term.data.slug || term.id.replace(/\.md$/, '');
      return termSlug !== slug && (term.data.category?.toLowerCase() === normCategory || normCategory === 'loans');
    })
    .slice(0, limit * 2)
    .map((term) => ({
      title: term.data.title,
      slug: term.data.slug || term.id.replace(/\.md$/, ''),
      shortDefinition: term.data.shortDefinition,
      url: `/glossary/${term.data.slug || term.id.replace(/\.md$/, '')}/`,
    }));

  // 5. Hub URL
  const hubMatch = allHubs.find((h) => h.data.category?.toLowerCase() === normCategory);
  const hubUrl = hubMatch ? `/${hubMatch.slug || hubMatch.id.replace(/\.md$/, '')}/` : `/${normCategory}/`;

  return {
    category: normCategory,
    hubUrl,
    relatedCalculators,
    relatedGuides,
    relatedComparisons,
    relatedTerms,
  };
}
