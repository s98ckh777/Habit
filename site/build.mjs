// habit Skin Lab 정적 사이트 빌드 (의존성 없음, Node 18+)
//   node build.mjs          → dist/ (시안 메모 표시)
//   node build.mjs --prod   → dist/ (시안 메모·개발 바 제거)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist');
const PROD = process.argv.includes('--prod');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));

const TREAT = ['toning', 'booster', 'scar', 'hair', 'hanbang', 'acne'];
const read = (p) => fs.readFileSync(p, 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function partial(name) { return read(path.join(SRC, 'partials', name + '.html')).trim(); }
function fillCfg(html) {
  return html.replace(/\{\{cfg\.(\w+)\}\}/g, (m, k) => {
    if (!(k in cfg)) throw new Error('config.json 에 없는 값: ' + k);
    return cfg[k];
  });
}

function jsonld(meta, slug, url) {
  const clinic = {
    '@type': 'MedicalClinic',
    '@id': cfg.siteUrl + '/#clinic',
    name: '해빛한방병원 한방피부클리닉 habit Skin Lab',
    url: cfg.siteUrl + '/',
    telephone: '+82-' + cfg.tel.replace(/^0/, ''),
    address: { '@type': 'PostalAddress', streetAddress: '사근1길 10 현대메디컬시티', addressLocality: '전주시 덕진구', addressRegion: '전북특별자치도', addressCountry: 'KR' },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '21:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '09:00', closes: '16:00' }
    ],
    parentOrganization: { '@type': 'Hospital', name: cfg.hospitalName },
    sameAs: [cfg.blogUrl, cfg.youtubeUrl, cfg.instagramUrl]
  };
  if (slug === 'index') return JSON.stringify({ '@context': 'https://schema.org', ...clinic });
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': TREAT.includes(slug) ? 'MedicalWebPage' : 'WebPage', name: meta.title, description: meta.description, url, about: { '@id': clinic['@id'] } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'habit Skin Lab', item: cfg.siteUrl + '/' },
        { '@type': 'ListItem', position: 2, name: meta.crumb || meta.title, item: url }
      ] }
    ]
  });
}

// ---- 준비
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets', 'css'), { recursive: true });
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });
const css = ['base', 'components', 'layout'].map((f) => read(path.join(SRC, 'css', f + '.css'))).join('\n');
fs.writeFileSync(path.join(OUT, 'assets', 'css', 'site.css'), css);

const layout = read(path.join(SRC, 'layout.html'));
const pages = fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html'));
const urls = [];

for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const raw = read(path.join(SRC, 'pages', file));
  const m = raw.match(/^<!--meta ([\s\S]*?) -->\s*/);
  if (!m) throw new Error(file + ': 첫 줄에 <!--meta {...} --> 가 필요합니다');
  const meta = JSON.parse(m[1]);
  let content = raw.slice(m[0].length);
  if (PROD) content = content.replace(/<div class="note memo">[\s\S]*?<\/div>\s*/g, '');

  const url = slug === 'index' ? cfg.siteUrl + '/' : `${cfg.siteUrl}/${slug}.html`;
  urls.push(url);
  const pageTitle = slug === 'index'
    ? 'habit Skin Lab | 해빛한방병원 한방피부클리닉 · 전주'
    : `${meta.title} | habit Skin Lab 해빛한방병원 한방피부클리닉`;
  // 모든 페이지가 밝은 히어로로 시작하므로 헤더는 처음에 투명
  const bodyClass = ['has-hero', !PROD && meta.home ? 'has-devbar' : ''].filter(Boolean).join(' ');
  const devbar = !PROD && meta.home
    ? '<div class="devbar">시안 빌드<span class="t"> · 접속 팝업은 각각 닫거나 "1일 동안 보지 않기"로 숨길 수 있어요.</span><button type="button" id="pop-again">팝업 다시 보기</button></div>'
    : '';

  let html = layout
    .replace(/\{\{> (\w+)\}\}/g, (_, n) => partial(n))
    .replace('{{content}}', () => content.trim())
    .replace('{{popups}}', () => (meta.home ? partial('popups') : ''))
    .replace('{{devbar}}', devbar)
    .replace('{{jsonld}}', () => jsonld(meta, slug, url))
    .replace(/\{\{pageTitle\}\}/g, esc(pageTitle))
    .replace(/\{\{description\}\}/g, esc(meta.description))
    .replace(/\{\{canonical\}\}/g, url)
    .replace('{{bodyClass}}', bodyClass);
  html = fillCfg(html);

  // 현재 메뉴 표시
  html = html.replace(new RegExp(`data-nav="${slug}"`, 'g'), `data-nav="${slug}" aria-current="page"`);
  if (TREAT.includes(slug)) html = html.replace('class="dd" data-navgroup="treat"', 'class="dd on" data-navgroup="treat"');

  const left = html.match(/\{\{[^}]+\}\}/);
  if (left) throw new Error(`${file}: 치환되지 않은 값 ${left[0]}`);
  fs.writeFileSync(path.join(OUT, file), html);
}

// ---- sitemap / robots
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.filter((u) => !u.endsWith('/cases.html')).map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);

console.log(`빌드 완료 (${PROD ? '운영' : '시안'}) · ${pages.length}개 페이지 → dist/`);
