// 배포 페이지 개발자도구 콘솔에 붙여 넣어 태깅을 점검하는 스니펫
(() => {
  const res = performance.getEntriesByType('resource')
    .filter(e => /googletagmanager\.com\/(gtm|gtag)|google-analytics\.com\/g\/collect/.test(e.name))
    .map(e => { const u = new URL(e.name); return { url: u.host + u.pathname, id: u.searchParams.get('id') || u.searchParams.get('tid'), en: u.searchParams.get('en') || '(batch/POST)' }; });
  console.table(res);
  console.table(dataLayer.filter(x => x && x.event).map(x => ({ event: x.event, site_version: x.site_version || '', ecommerce: x.ecommerce ? 'Y' : '' })));
  return { config: window.SITE_CONFIG, requests: res.length, events: dataLayer.filter(x => x && x.event).length };
})();
