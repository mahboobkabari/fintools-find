import { defineCollection, z } from 'astro:content';

const eeatSchema = z.object({
  reviewedBy: z.string().default('FinTool Engineering & Quant Team'),
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
    author: z.string().default('FinTool Editorial Team'),
    tags: z.array(z.string()).default([]),
  }),
});

const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    category: z.string(),
    relatedTerms: z.array(z.string()).optional(),
  }),
});

export const collections = { tools, articles, glossary };
