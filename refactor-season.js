const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

const files = getFiles(path.join(__dirname, 'apps/web'));
let updatedFiles = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Replace manual season fetching block
  // Pattern varies slightly with spacing, so use regex
  const regex = /const seasonId = process\.env\.NEXT_PUBLIC_SEASON_ID\s*const \{\s*data:\s*season\s*\} = await supabase\s*\.from\('seasons'\)\s*\.select\([^)]*\)\s*\.eq\([\s\S]*?\.single\(\)/g;

  if (regex.test(content)) {
    const isAdmin = filePath.includes('(admin)') || filePath.includes('admin');
    content = content.replace(regex, `const season = await getViewingSeason(${isAdmin ? 'true' : ''})`);
    
    // Add import if missing
    if (!content.includes('getViewingSeason')) {
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + "import { getViewingSeason } from '@/lib/season'\n" + content.slice(endOfLine + 1);
      } else {
        content = "import { getViewingSeason } from '@/lib/season'\n" + content;
      }
    }
    
    modified = true;
  }
  
  // Specific fix for layout.tsx admin
  if (filePath.includes('layout.tsx') && content.includes('process.env.NEXT_PUBLIC_SEASON_ID')) {
    content = content.replace(
      /isPreviewing=\{!!previewSeasonId && previewSeasonId !== process\.env\.NEXT_PUBLIC_SEASON_ID\}/g,
      `isPreviewing={!!previewSeasonId && previewSeasonId !== season?.id}`
    );
    modified = true;
  }
  
  // Specific fix for api/leaderboard/route.ts
  if (filePath.includes('api\\leaderboard\\route.ts') && content.includes('process.env.NEXT_PUBLIC_SEASON_ID')) {
    content = content.replace(
      /const seasonId = url\.searchParams\.get\('seasonId'\) \?\? process\.env\.NEXT_PUBLIC_SEASON_ID/,
      `const seasonId = url.searchParams.get('seasonId')\n  const season = seasonId \n    ? (await supabase.from('seasons').select('id').eq('id', seasonId).single()).data\n    : await getViewingSeason(false)`
    );
    
    if (!content.includes('getViewingSeason')) {
       content = "import { getViewingSeason } from '@/lib/season'\n" + content;
    }
    
    // Also we need to fix how it uses seasonId if we changed it to season
    content = content.replace(/season_id', seasonId/g, `season_id', season?.id ?? ''`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedFiles++;
    console.log('Refactored:', filePath);
  }
}

console.log(`Refactored ${updatedFiles} files.`);
