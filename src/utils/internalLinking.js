import { getCollection } from 'astro:content';

/**
 * Intelligent Internal Link Engine.
 * Fetches related calculators within the same category and complementary categories.
 *
 * @param {string} currentSlug - Current tool slug to exclude
 * @param {string} category - Current tool category
 * @param {number} [limit=4] - Number of links to return
 * @returns {Promise<Array<{ title: string, href: string, categoryName: string }>>}
 */
export async function getRelatedToolLinks(currentSlug, category, limit = 4) {
  const allTools = await getCollection('tools');

  // Filter out current tool
  const otherTools = allTools.filter((t) => {
    const slug = t.slug || t.data.slug || t.id;
    return slug !== currentSlug;
  });

  // Priority 1: Same category tools
  const sameCategoryTools = otherTools.filter((t) => t.data.category === category);

  // Priority 2: Complementary category tools if same category has fewer than limit
  const complementaryTools = otherTools.filter((t) => t.data.category !== category);

  const selected = [...sameCategoryTools, ...complementaryTools].slice(0, limit);

  return selected.map((t) => {
    const slug = t.slug || t.data.slug || t.id;
    return {
      title: t.data.title,
      href: `/tools/${t.data.category}/${slug}/`,
      categoryName: t.data.categoryName,
    };
  });
}
