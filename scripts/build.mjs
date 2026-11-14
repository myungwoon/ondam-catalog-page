// 정적 빌드: src/ → public/ 복사 + 태깅 ID 치환
// ID는 site.config.json 한 곳에서만 관리. 환경변수(GTM_ID, GA4_ID, GA4_DIRECT)가 있으면 그 값을 우선 사용.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));

const gtmId = (process.env.GTM_ID || cfg.gtmId || '').trim();
const ga4Id = (process.env.GA4_ID || cfg.ga4Id || '').trim();
const ga4Direct = process.env.GA4_DIRECT ? process.env.GA4_DIRECT === 'true' : cfg.ga4Direct !== false;
const siteVersion = process.env.SITE_VERSION || cfg.siteVersion || 'dev';

if (!/^GTM-[A-Z0-9]+$/.test(gtmId) || gtmId.includes('XXXX')) console.warn(`[build] 경고: GTM ID가 올바르지 않습니다 (${gtmId})`);
if (!/^G-[A-Z0-9]+$/.test(ga4Id) || ga4Id.includes('XXXX')) console.warn(`[build] 경고: GA4 측정 ID가 올바르지 않습니다 (${ga4Id})`);

const src = join(root, 'src');
const out = join(root, 'public');
rmSync(out, { recursive: true, force: true });

const textExt = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg', '.xml', '.webmanifest']);
function render(text) {
  if (!ga4Direct) text = text.replace(/<!-- GA4_DIRECT_START -->[\s\S]*?<!-- GA4_DIRECT_END -->/g, '');
  return text
    .replaceAll('{{GTM_ID}}', gtmId)
    .replaceAll('{{GA4_ID}}', ga4Id)
    .replaceAll('{{GA4_DIRECT}}', String(ga4Direct))
    .replaceAll('{{SITE_VERSION}}', siteVersion)
    .replaceAll('{{BUILD_TIME}}', new Date().toISOString());
}
function walk(dir, rel = '') {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name), r = join(rel, name), o = join(out, r);
    if (statSync(p).isDirectory()) { walk(p, r); continue; }
    mkdirSync(dirname(o), { recursive: true });
    if (textExt.has(extname(name))) writeFileSync(o, render(readFileSync(p, 'utf8')));
    else copyFileSync(p, o);
  }
}
walk(src);
console.log(`[build] 완료 → public/  (GTM=${gtmId}, GA4=${ga4Id}, ga4Direct=${ga4Direct}, version=${siteVersion})`);
