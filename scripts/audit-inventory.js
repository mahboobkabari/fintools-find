import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// 1. Read all markdown content files from src/content/tools
const contentDir = path.join(projectRoot, 'src/content/tools');
const contentFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));

const toolsFromContent = [];

for (const file of contentFiles) {
  const filePath = path.join(contentDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');

  // Parse frontmatter
  const matchSlug = rawContent.match(/slug:\s*["']?([^"'\r\n]+)["']?/);
  const matchCategory = rawContent.match(/category:\s*["']?([^"'\r\n]+)["']?/);
  const matchTitle = rawContent.match(/title:\s*["']?([^"'\r\n]+)["']?/);

  const filenameSlug = file.replace('.md', '');
  const slug = matchSlug ? matchSlug[1].trim() : filenameSlug;
  const category = matchCategory ? matchCategory[1].trim() : 'unknown';
  const title = matchTitle ? matchTitle[1].trim() : filenameSlug;

  toolsFromContent.push({
    filename: file,
    slug,
    category,
    title,
  });
}

// 2. Read CALCULATOR_REGISTRY & imports from src/components/calculators/registry.js
const registryPath = path.join(projectRoot, 'src/components/calculators/registry.js');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Parse import statements: import WidgetVar from './WidgetFile'
const importMap = new Map();
const importMatches = [...registryContent.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"]/g)];
for (const match of importMatches) {
  importMap.set(match[1], match[2]); // WidgetVar -> WidgetFile
}

// Parse registry object: 'slug': WidgetVar
const registryMatches = [...registryContent.matchAll(/['"]([^'"]+)['"]\s*:\s*(\w+)/g)];
const registeredSlugs = new Map();
const duplicateRegistrations = [];

for (const match of registryMatches) {
  const slug = match[1];
  const widgetVar = match[2];
  if (registeredSlugs.has(slug)) {
    duplicateRegistrations.push(slug);
  } else {
    const widgetFile = importMap.get(widgetVar) || widgetVar;
    registeredSlugs.set(slug, { widgetVar, widgetFile });
  }
}

// 3. Read index.astro routes
const astroRoutePath = path.join(projectRoot, 'src/pages/tools/[category]/[tool]/index.astro');
const astroContent = fs.readFileSync(astroRoutePath, 'utf8');

const routedSlugs = new Set();
const astroMatches = [...astroContent.matchAll(/slug\s*===\s*['"]([^'"]+)['"]/g)];
for (const match of astroMatches) {
  routedSlugs.add(match[1]);
}

// 4. Check tool_slugs.csv
const csvPath = path.join(projectRoot, 'tool_slugs.csv');
let csvTools = [];
if (fs.existsSync(csvPath)) {
  const csvRaw = fs.readFileSync(csvPath, 'utf8');
  const lines = csvRaw.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const parts = lines[i].split(',');
    csvTools.push({
      tool_slug: parts[0]?.trim(),
      category_slug: parts[1]?.trim(),
      name: parts[2]?.trim(),
      tier: parts[3]?.trim(),
    });
  }
}

// 5. Engine/Test File Aliases
const fileAliases = {
  'emi-calculator': ['emi-calculator', 'emi'],
  'sip-calculator': ['sip-calculator', 'sip'],
  '401k-calculator': ['401k-calculator'],
};

// 6. Verify completeness per tool
const auditResults = [];

for (const tool of toolsFromContent) {
  const { slug, category, title } = tool;

  // Check content
  const hasContent = fs.existsSync(path.join(contentDir, `${slug}.md`));

  // Check config
  const configPath = path.join(projectRoot, 'src', 'calculators', 'configs', `${slug}.config.js`);
  const hasConfig = fs.existsSync(configPath);

  // Check registry
  const isRegistered = registeredSlugs.has(slug);
  const regInfo = registeredSlugs.get(slug);

  // Check widget file
  let hasWidget = false;
  if (regInfo && regInfo.widgetFile) {
    const ext = regInfo.widgetFile.endsWith('.jsx') ? '' : '.jsx';
    const widgetPath = path.join(projectRoot, 'src', 'components', 'calculators', `${regInfo.widgetFile}${ext}`);
    hasWidget = fs.existsSync(widgetPath);
  }

  // Check engine and tests across category folders
  let hasEngine = false;
  let hasTest = false;
  const aliases = fileAliases[slug] || [slug];

  const categories = ['loans', 'investment', 'tax', 'retirement', 'core'];
  for (const cat of categories) {
    for (const name of aliases) {
      const engineFile = path.join(projectRoot, 'src', 'calculators', cat, `${name}.js`);
      if (fs.existsSync(engineFile)) hasEngine = true;

      const testFile = path.join(projectRoot, 'src', 'calculators', cat, '__tests__', `${name}.test.js`);
      if (fs.existsSync(testFile)) hasTest = true;
    }
  }

  // Check route
  const hasRoute = routedSlugs.has(slug);

  auditResults.push({
    slug,
    category,
    title,
    hasContent,
    hasConfig,
    isRegistered,
    hasWidget,
    hasEngine,
    hasTest,
    hasRoute,
    isComplete: hasContent && hasConfig && isRegistered && hasWidget && hasEngine && hasTest && hasRoute,
  });
}

// 7. Category counts breakdown
const categoryCounts = {};
for (const item of auditResults) {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
}

const summary = {
  totalCalculators: auditResults.length,
  totalContentFiles: toolsFromContent.length,
  totalRegistered: registeredSlugs.size,
  totalRouted: routedSlugs.size,
  totalPlannedCSV: csvTools.length,
  categoryCounts,
  duplicateRegistrations,
  missingRegistrations: auditResults.filter((r) => !r.isRegistered).map((r) => r.slug),
  missingRoutes: auditResults.filter((r) => !r.hasRoute).map((r) => r.slug),
  missingContentFiles: [],
  incompleteTools: auditResults.filter((r) => !r.isComplete).map((r) => r.slug),
};

console.log('=== AUTOMATED REPOSITORY INVENTORY AUDIT SUMMARY ===');
console.dir(summary, { depth: null });
