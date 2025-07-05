#!/usr/bin/env node

/**
 * Script pro aktualizaci base path v Vite konfiguraci
 * Použití: node scripts/update-base-path.js [repository-name]
 */

const fs = require('fs');
const path = require('path');

const repositoryName = process.argv[2] || 'FUNtastic-AI-Future-PodcastWeb';
const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');

console.log(`🔧 Aktualizuji base path pro repository: ${repositoryName}`);

try {
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  const oldPattern = /base: mode === 'production' \? '\/[^']*\/' : '\/',/;
  const newBasePath = `base: mode === 'production' ? '/${repositoryName}/' : '/',`;
  
  if (oldPattern.test(viteConfig)) {
    viteConfig = viteConfig.replace(oldPattern, newBasePath);
    fs.writeFileSync(viteConfigPath, viteConfig);
    console.log(`✅ Base path aktualizován na: /${repositoryName}/`);
  } else {
    console.log('⚠️ Base path pattern nenalezen v vite.config.ts');
  }
  
} catch (error) {
  console.error('❌ Chyba při aktualizaci base path:', error.message);
  process.exit(1);
}

console.log(`
📋 Další kroky:
1. Commitněte změny do GitHub repository
2. Aktivujte GitHub Pages v nastavení repository 
3. Aplikace bude dostupná na: https://[username].github.io/${repositoryName}/
`);