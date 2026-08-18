const fs = require('fs');
const files = [
  'apps/web/app/(admin)/admin/leaderboard/page.tsx',
  'apps/web/app/(admin)/admin/page.tsx',
  'apps/web/app/(admin)/admin/points/page.tsx',
  'apps/web/app/(student)/challenges/page.tsx',
  'apps/web/app/(student)/dashboard/page.tsx',
  'apps/web/app/(student)/feed/page.tsx',
  'apps/web/app/(student)/leaderboard/page.tsx',
  'apps/web/app/(student)/opportunities/page.tsx',
  'apps/web/app/(student)/profile/page.tsx',
  'apps/web/app/(student)/projects/new/page.tsx',
  'apps/web/app/(student)/projects/page.tsx',
  'apps/web/app/api/leaderboard/route.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('import { getViewingSeason }')) {
    c = "import { getViewingSeason } from '@/lib/season'\n" + c;
    fs.writeFileSync(f, c);
    console.log('Fixed:', f);
  }
});
