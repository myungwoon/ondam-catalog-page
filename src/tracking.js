/*
 * 추적 헬퍼 — 모든 이벤트는 여기 한 곳을 거칩니다.
 *  1) GTM용: dataLayer.push({ event, ...params })  ← GTM 트리거(맞춤 이벤트)로 잡습니다.
 *  2) GA4 직접 연동(ga4Direct=true)일 때: gtag('event', name, params) 로 GA4에도 바로 전송.
 * 전자상거래 이벤트는 GA4 권장 스키마(ecommerce.items[])를 따르며, push 전에 ecommerce 객체를 비웁니다.
 */
(function () {
  var cfg = window.SITE_CONFIG || {};
  window.dataLayer = window.dataLayer || [];

  var ECOMMERCE = { view_item_list: 1, select_item: 1, view_item: 1, add_to_cart: 1, remove_from_cart: 1,
    view_cart: 1, begin_checkout: 1, add_to_wishlist: 1, view_promotion: 1, select_promotion: 1 };

  function toItem(p, index, qty, listId, listName) {
    var item = {
      item_id: p.id, item_name: p.name, item_brand: 'ONDAM', item_category: p.category,
      price: p.salePrice || p.price, quantity: qty || 1
    };
    if (p.salePrice) item.discount = p.price - p.salePrice;
    if (typeof index === 'number') item.index = index;
    if (listId) { item.item_list_id = listId; item.item_list_name = listName; }
    return item;
  }

  function track(name, params) {
    params = params || {};
    var base = { site_version: cfg.version, page_location: location.href };
    if (ECOMMERCE[name]) window.dataLayer.push({ ecommerce: null });
    var payload = Object.assign({ event: name }, base, ECOMMERCE[name] ? { ecommerce: params } : params);
    window.dataLayer.push(payload);

    if (cfg.ga4Direct && typeof window.gtag === 'function') {
      window.gtag('event', name, Object.assign({ site_version: cfg.version }, params));
    }
    if (/[?&]debug=1/.test(location.search)) console.log('[track]', name, params);
  }

  window.Tracking = { track: track, toItem: toItem };
})();
