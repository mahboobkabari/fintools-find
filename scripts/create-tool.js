import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
let slugArg = args[0];

if (!slugArg) {
  console.error('Usage: node scripts/create-tool.js <slug> [title] [category] [priority]');
  process.exit(1);
}

// Clean slug
const slug = slugArg.replace(/^\/tools\//, '').replace(/^\//, '').replace(/\/$/, '');

let title = args[1];
let categoryRaw = args[2];
let priority = args[3] || 'P1';

// Auto-lookup from tool_slugs.csv if title or category not provided
const csvPath = path.join(rootDir, 'tool_slugs.csv');
if ((!title || !categoryRaw) && fs.existsSync(csvPath)) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const csvCategory = parts[0].trim();
      const csvName = parts[1].trim();
      const csvSlug = parts[2].trim().replace(/^\/tools\//, '').replace(/^\//, '');
      if (csvSlug === slug) {
        if (!title) title = csvName;
        if (!categoryRaw) categoryRaw = csvCategory;
        break;
      }
    }
  }
}

if (!title) title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
if (!categoryRaw) categoryRaw = 'loans';

function mapCategorySlug(cat) {
  const lower = cat.toLowerCase();
  if (lower.includes('loan') || lower.includes('emi')) return 'loans';
  if (lower.includes('investment')) return 'investment';
  if (lower.includes('deposit') || lower.includes('savings')) return 'savings';
  if (lower.includes('retirement')) return 'retirement';
  if (lower.includes('tax')) return 'tax';
  if (lower.includes('estate')) return 'real-estate';
  if (lower.includes('insurance')) return 'insurance';
  if (lower.includes('credit') || lower.includes('debt')) return 'debt';
  if (lower.includes('business') || lower.includes('corporate')) return 'business';
  if (lower.includes('currency') || lower.includes('cost')) return 'currency';
  if (lower.includes('crypto')) return 'crypto';
  if (lower.includes('salary') || lower.includes('personal')) return 'salary';
  if (lower.includes('health') || lower.includes('benefits')) return 'health';
  if (lower.includes('life')) return 'life-events';
  if (lower.includes('education')) return 'education';
  if (lower.includes('freelance') || lower.includes('everyday')) return 'freelance';
  return 'general';
}

const category = mapCategorySlug(categoryRaw);
const contentDir = path.join(rootDir, 'src', 'content', 'tools');
const calcDir = path.join(rootDir, 'src', 'calculators', category);
const testDir = path.join(calcDir, '__tests__');
const configDir = path.join(rootDir, 'src', 'calculators', 'configs');
const widgetDir = path.join(rootDir, 'src', 'components', 'calculators');

fs.mkdirSync(contentDir, { recursive: true });
fs.mkdirSync(calcDir, { recursive: true });
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(configDir, { recursive: true });
fs.mkdirSync(widgetDir, { recursive: true });

const pascalName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
const camelSlug = slug.replace(/-([a-z])/g, g => g[1].toUpperCase());

const contentFile = path.join(contentDir, `${slug}.md`);
const calcFile = path.join(calcDir, `${slug}.js`);
const testFile = path.join(testDir, `${slug}.test.js`);
const configFile = path.join(configDir, `${slug}.config.js`);
const widgetFile = path.join(widgetDir, `${pascalName}Widget.jsx`);

const formattedCategoryName = categoryRaw.includes('Calculators') ? categoryRaw : `${categoryRaw} Calculators`;

// 1. Content Markdown Template
const contentTemplate = `---
title: "${title}"
metaDescription: "Calculate your ${title} instantly. View worked examples, formulas, and detailed breakdown schedules."
category: "${category}"
categoryName: "${formattedCategoryName}"
currency: "INR"
howToUse:
  - "Enter your primary input values."
  - "Adjust range sliders or select toggles."
  - "Review your instant calculated outputs and breakdown schedule."
features:
  - "Real-time calculation with synchronized range sliders"
  - "Visual result breakdown bar"
  - "Full detailed breakdown schedule table"
benefits:
  - "Accurate financial planning"
  - "Saves time with instant calculations"
  - "Helps compare multiple financial scenarios"
faqs:
  - question: "What is ${title}?"
    answer: "${title} is a free financial tool designed to calculate key numbers quickly and accurately."
  - question: "How accurate is this calculator?"
    answer: "Our calculator uses standard financial formulas verified by unit tests."
calculatorModule: "${category}/${slug}.js"
publishDate: ${new Date().toISOString().split('T')[0]}
priority: "${priority}"
advancedContent:
  definitionSnippet: "${title} is an essential financial tool designed to compute financial calculations quickly and accurately."
  proTips:
    - "Always double check interest rate assumptions against prevailing market benchmarks."
    - "Review annual breakdown schedules to evaluate long-term compounding effects."
  commonMistakes:
    - "Conflating nominal interest rates with effective annual yield."
---

## Introduction to ${title}

This calculator helps you plan your financial goals accurately.

## How It Works

Enter your inputs to view the detailed output breakdown.
`;

// 2. Calculator JS Template
const calcTemplate = `/**
 * ${title} Math Engine
 */
export function calculate${pascalName}(inputs = {}) {
  const { amount = 100000, rate = 10, tenure = 5 } = inputs;
  const numAmount = Number(amount) || 0;
  const numRate = Number(rate) || 0;
  const numTenure = Number(tenure) || 1;

  const result = Math.round(numAmount * (1 + (numRate / 100) * numTenure));

  return {
    primaryOutput: result,
    totalInvested: numAmount,
    estReturns: result - numAmount,
  };
}
`;

// 3. Vitest Test Template
const testTemplate = `import { describe, it, expect } from 'vitest';
import { calculate${pascalName} } from '../${slug}.js';

describe('${title} Calculation Engine', () => {
  it('calculates expected results for benchmark input', () => {
    const output = calculate${pascalName}({ amount: 100000, rate: 10, tenure: 5 });
    expect(output.primaryOutput).toBeGreaterThan(0);
  });
});
`;

// 4. Declarative Config Template
const configTemplate = `import { calculate${pascalName} } from '../${category}/${slug}.js';

export const ${camelSlug}Config = {
  title: '${title} Details',
  currency: 'INR',
  calculateFn: calculate${pascalName},
  primaryResult: {
    key: 'primaryOutput',
    label: 'Total Result',
  },
  ratioBarItems: [
    { key: 'totalInvested', label: 'Invested', colorClass: 'bg-primary' },
    { key: 'estReturns', label: 'Returns', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'totalInvested', label: 'Initial Amount' },
    { key: 'estReturns', label: 'Estimated Growth', class: 'text-semantic-up' },
    { key: 'primaryOutput', label: 'Total Value', isTotal: true },
  ],
  inputs: [
    { id: 'amount', type: 'number', label: 'Principal Amount', min: 1000, max: 10000000, step: 1000, prefix: '₹', default: 100000 },
    { id: 'rate', type: 'number', label: 'Rate (p.a.)', min: 0, max: 30, step: 0.1, suffix: '%', default: 10 },
    { id: 'tenure', type: 'number', label: 'Tenure (Years)', min: 1, max: 30, step: 1, suffix: 'Yrs', default: 5 },
  ],
};
`;

// 5. Preact Widget Wrapper Template
const widgetTemplate = `import UniversalCalculatorWidget from './framework/UniversalCalculatorWidget';
import { ${camelSlug}Config } from '../../calculators/configs/${slug}.config.js';

export default function ${pascalName}Widget() {
  return <UniversalCalculatorWidget config={${camelSlug}Config} />;
}
`;

if (!fs.existsSync(contentFile)) fs.writeFileSync(contentFile, contentTemplate.trim());
if (!fs.existsSync(calcFile)) fs.writeFileSync(calcFile, calcTemplate.trim());
if (!fs.existsSync(testFile)) fs.writeFileSync(testFile, testTemplate.trim());
if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, configTemplate.trim());
if (!fs.existsSync(widgetFile)) fs.writeFileSync(widgetFile, widgetTemplate.trim());

console.log(`✅ Tool scaffolding created successfully for: ${slug}`);
console.log(`   - Title:    ${title}`);
console.log(`   - Category: ${category} (${formattedCategoryName})`);
console.log(`   - Content:  src/content/tools/${slug}.md`);
console.log(`   - Config:   src/calculators/configs/${slug}.config.js`);
console.log(`   - Engine:   src/calculators/${category}/${slug}.js`);
console.log(`   - Widget:   src/components/calculators/${pascalName}Widget.jsx`);
console.log(`   - Test:     src/calculators/${category}/__tests__/${slug}.test.js`);
