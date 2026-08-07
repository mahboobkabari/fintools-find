import { defineCollection, z } from 'astro:content';

const eeatSchema = z.object({
  reviewedBy: z.string().default('Fintools Find Engineering & Quant Team'),
  reviewedDate: z.coerce.date().optional(),
  methodology: z.string().optional(),
  dataSources: z.array(z.string()).optional(),
  revisionHistory: z.array(z.object({ date: z.coerce.date(), note: z.string() })).optional(),
}).optional();

const advancedContentSchema = z.object({
  definitionSnippet: z.string().optional(),
  proTips: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  keyTakeaways: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  glossaryTerms: z.array(z.object({ term: z.string(), definition: z.string() })).optional(),
}).optional();

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    category: z.string(),
    categoryName: z.string(),
    slug: z.string().optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'generic']).default('generic'),
    howToUse: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),
    relatedTools: z.array(z.string()).optional(),
    calculatorModule: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    priority: z.enum(['P0', 'P1', 'P2']).default('P1'),
    eeat: eeatSchema,
    advancedContent: advancedContentSchema,
  }),
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    category: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Fintools Find Editorial Team'),
    tags: z.array(z.string()).default([]),
  }),
});

const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    shortDefinition: z.string(),
    category: z.string(),
    synonyms: z.array(z.string()).default([]),
    relatedTerms: z.array(z.string()).default([]),
    relatedCalculators: z.array(z.string()).default([]),
    relatedGuides: z.array(z.string()).default([]),
    relatedComparisons: z.array(z.string()).default([]),
    examples: z.array(z.string()).default([]),
    formulas: z.array(z.string()).default([]),
    commonMistakes: z.array(z.string()).default([]),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    author: z.string().default('Fintools Find Financial Editorial Team'),
    reviewedBy: z.string().default('CFP Financial Review Board'),
    publishDate: z.coerce.date().default(() => new Date()),
    updatedDate: z.coerce.date().optional(),
  }),
});

const comparisons = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    category: z.string(),
    slug: z.string().optional(),
    optionA: z.object({
      name: z.string(),
      badge: z.string(),
      toolSlug: z.string().optional(),
    }),
    optionB: z.object({
      name: z.string(),
      badge: z.string(),
      toolSlug: z.string().optional(),
    }),
    winner: z.object({
      name: z.string(),
      summary: z.string(),
    }),
    matrix: z.array(
      z.object({
        feature: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        winner: z.string(),
      })
    ).default([]),
    prosCons: z.object({
      optionA: z.object({ pros: z.array(z.string()), cons: z.array(z.string()) }),
      optionB: z.object({ pros: z.array(z.string()), cons: z.array(z.string()) }),
    }),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),
    publishDate: z.coerce.date(),
    relatedTools: z.array(z.string()).optional(),
  }),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    category: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Fintools Find Financial Editorial Team'),
    reviewedBy: z.string().default('CFP Financial Review Board'),
    readingTime: z.string().default('8 min read'),
    tags: z.array(z.string()).default([]),
    keyTakeaways: z.array(z.string()).default([]),
    relatedCalculators: z.array(z.string()).optional(),
    relatedComparisons: z.array(z.string()).optional(),
    relatedGuides: z.array(z.string()).optional(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),
  }),
});

const hubs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string().max(160),
    heroSubtitle: z.string(),
    category: z.string(),
    stats: z.object({
      calculators: z.number(),
      guides: z.number(),
      comparisons: z.number(),
    }),
    learningRoadmap: z.array(
      z.object({
        level: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ).default([]),
    featuredCalculators: z.array(z.string()).default([]),
    featuredGuides: z.array(z.string()).default([]),
    featuredComparisons: z.array(z.string()).default([]),
    glossaryTerms: z.array(
      z.object({
        term: z.string(),
        definition: z.string(),
      })
    ).default([]),
    relatedHubs: z.array(
      z.object({
        title: z.string(),
        slug: z.string(),
      })
    ).default([]),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),
  }),
});

export const collections = { tools, articles, glossary, comparisons, guides, hubs };
