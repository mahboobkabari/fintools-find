import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

// Recursively find all .html files in dist
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Found ${htmlFiles.length} generated HTML files in dist/`);

const brokenLinks = [];
const linkCount = { total: 0, internal: 0, external: 0 };
const hrefSet = new Set();

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePagePath = path.relative(distDir, file).replace(/\\/g, '/');

  // Extract all hrefs
  const matches = [...content.matchAll(/href=["']([^"']+)["']/g)];
  matches.forEach((m) => {
    const href = m[1];
    linkCount.total++;

    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      linkCount.external++;
      return;
    }

    if (href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }

    linkCount.internal++;
    hrefSet.add(href);

    // Verify internal route target exists in dist
    let targetPath = href.split('#')[0].split('?')[0];
    if (!targetPath) return;

    if (targetPath.startsWith('/')) {
      targetPath = targetPath.slice(1);
    }

    let expectedFilePath = path.join(distDir, targetPath);

    let exists = false;
    if (fs.existsSync(expectedFilePath)) {
      exists = true;
    } else if (fs.existsSync(expectedFilePath + '.html')) {
      exists = true;
    } else if (fs.existsSync(path.join(expectedFilePath, 'index.html'))) {
      exists = true;
    }

    if (!exists) {
      brokenLinks.push({
        sourcePage: relativePagePath,
        targetHref: href,
        expectedPath: expectedFilePath,
      });
    }
  });
});

console.log('=== PRODUCTION LINK VERIFICATION SUMMARY ===');
console.log(`Total Pages Audited: ${htmlFiles.length}`);
console.log(`Total Hrefs Scanned: ${linkCount.total}`);
console.log(`Internal Links Scanned: ${linkCount.internal}`);
console.log(`External Links Scanned: ${linkCount.external}`);
console.log(`Broken Internal Links Found: ${brokenLinks.length}`);

if (brokenLinks.length > 0) {
  console.log('Broken Links Details:', JSON.stringify(brokenLinks, null, 2));
} else {
  console.log('✅ ALL INTERNAL LINKS VERIFIED CLEAN! ZERO BROKEN LINKS ACROSS THE ENTIRE REPOSITORY!');
}
