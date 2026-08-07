/**
 * Platform V3 Builder Utilities
 * Helper functions to declaratively generate standardized calculator configurations.
 */

export function createDashboard(config = {}) {
  return {
    type: 'dashboard',
    heroTitle: config.heroTitle || 'Key Financial Result',
    heroValueKey: config.heroValueKey || 'primaryOutput',
    heroBadge: config.heroBadge || '',
    metrics: config.metrics || [],
  };
}

export function createDecision(config = {}) {
  return {
    type: 'decision',
    title: config.title || 'Optimal Decision Identified',
    subtitle: config.subtitle || '',
    status: config.status || 'success',
  };
}

export function createWarnings(rules = []) {
  return {
    type: 'warnings',
    rules: rules.map((r, idx) => ({
      id: r.id || `rule-${idx}`,
      condition: r.condition || (() => false),
      level: r.level || 'warning',
      message: r.message || '',
    })),
  };
}

export function createInsights(insights = []) {
  return {
    type: 'insights',
    items: insights,
  };
}

export function createRecommendations(items = []) {
  return {
    type: 'recommendations',
    tagLine: 'Smart Advice',
    badgeText: 'Highest Impact',
    items,
  };
}

export function createScenarioCards(scenarios = []) {
  return {
    type: 'scenarios',
    items: scenarios,
  };
}

export function createComparison(config = {}) {
  return {
    type: 'comparison',
    title: config.title || 'Scenario Comparison',
    subtitle: config.subtitle || '',
    scenarioA: config.scenarioA || {},
    scenarioB: config.scenarioB || {},
  };
}

export function createCharts(config = {}) {
  return {
    type: 'charts',
    primaryColor: config.primaryColor || '#10B981',
    secondaryColor: config.secondaryColor || '#F59E0B',
    centerLabel: config.centerLabel || 'Total',
  };
}

export function createFaq(faqList = []) {
  return {
    type: 'faq',
    items: faqList,
  };
}

export function createRelatedTools(tools = []) {
  return {
    type: 'relatedTools',
    tools,
  };
}

export function createSeo(config = {}) {
  return {
    title: config.title || '',
    metaDescription: config.metaDescription || '',
    canonical: config.canonical || '',
    openGraph: config.openGraph || {},
    twitterCard: config.twitterCard || {},
  };
}

export function createSchema(config = {}) {
  return {
    webApplication: config.webApplication || true,
    faqPage: config.faqPage || true,
    breadcrumb: config.breadcrumb || true,
  };
}
