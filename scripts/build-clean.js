import { execSync } from 'child_process';

console.log('Running astro check...');
execSync('npx astro check', { stdio: 'inherit' });

console.log('Running astro build...');
execSync('npx astro build', { stdio: 'inherit' });

console.log('Build completed successfully!');
