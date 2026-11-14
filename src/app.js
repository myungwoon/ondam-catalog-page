(function () {
  var T = window.Tracking, P = window.PRODUCTS;
  var LIST_ID = 'tea_collection', LIST_NAME = '티 컬렉션';
  var won = function (n) { return n.toLocaleString('ko-KR') + '원'; };
  var byId = function (id) { return P.filter(function (p) { return p.id === id; })[0]; };
  var $ = function (s) { return document.querySelector(s); };
  var cart = loadCart();
  var currentFilter = '전체';

  document.getElementById('buildInfo').textContent = (window.SITE_CONFIG.version || '') + ' · ' + (window.SITE_CONFIG.buildTime || '');

  /* ---------- 필터 ---------- */
  var cats = ['전체'].concat(P.map(function (p) { return p.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
  $('#filters').innerHTML = cats.map(function (c) {
    return '<button type="button" role="tab" class="chip' + (c === '전체' ? ' is-active' : '') + '" data-filter="' + c + '" aria-selected="' + (c === '전체') + '">' + c + '</button>';
  }).join('');
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]'); if (!b) return;
    currentFilter = b.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(function (x) {
      x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b);
    });
    renderGrid();
    T.track('filter_select', { filter_type: 'category', filter_value: currentFilter, result_count: visible().length });
    trackListView();
  });

  /* ---------- 상품 목록 ---------- */
  function visible() { return P.filter(function (p) { return currentFilter === '전체' || p.category === currentFilter; }); }
  function canHtml(p, size) {
    return '<div class="tea-can tea-can--' + size + '" style="--c1:' + p.c1 + ';--c2:' + p.c2 + '"><span>ONDAM</span><small>' + p.category + '</small></div>';
  }
  function priceHtml(p) {
    return p.salePrice
      ? '<span class="price-sale">' + Math.round((1 - p.salePrice / p.price) * 100) + '%</span> <strong>' + won(p.salePrice) + '</strong> <del>' + won(p.price) + '</del>'
      : '<strong>' + won(p.price) + '</strong>';
  }
  function renderGrid() {
    $('#productGrid').innerHTML = visible().map(function (p, i) {
      return '<li class="card" data-product="' + p.id + '" data-index="' + i + '">' +
        (p.badge ? '<span class="badge badge--' + p.badge.toLowerCase() + '">' + p.badge + '</span>' : '') +
        '<button type="button" class="card-media" data-action="select" aria-label="' + p.name + ' 상세 보기">' + canHtml(p, 'md') + '</button>' +
        '<div class="card-body">' +
          '<p class="card-cat">' + p.category + ' · ' + p.weight + '</p>' +
          '<h3><button type="button" class="link-btn" data-action="select">' + p.name + '</button></h3>' +
          '<p class="rating">★ ' + p.rating + ' <span>(' + p.reviews.toLocaleString() + ')</span></p>' +
          '<p class="price">' + priceHtml(p) + '</p>' +
          '<div class="card-actions">' +
            '<button type="button" class="btn btn-small btn-ghost" data-action="select">상세</button>' +
            '<button type="button" class="btn btn-small btn-primary" data-action="add" data-cta="card_add_to_cart" data-cta-location="product_card">담기</button>' +
          '</div>' +
        '</div></li>';
    }).join('');
  }
  $('#productGrid').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]'); if (!btn) return;
    var card = btn.closest('[data-product]'), p = byId(card.dataset.product), idx = +card.dataset.index;
    if (btn.dataset.action === 'select') {
      T.track('select_item', { item_list_id: LIST_ID, item_list_name: LIST_NAME, items: [T.toItem(p, idx, 1, LIST_ID, LIST_NAME)] });
      openProduct(p.id, idx);
    } else if (btn.dataset.action === 'add') {
      addToCart(p, 1, 'product_card');
    }
  });

  // 목록 노출: 카탈로그가 화면에 처음 보일 때 1회 + 필터 변경 시
  var listViewed = false;
  function trackListView() {
    T.track('view_item_list', { item_list_id: LIST_ID, item_list_name: LIST_NAME,
      items: visible().map(function (p, i) { return T.toItem(p, i, 1, LIST_ID, LIST_NAME); }) });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (ents, obs) {
      if (ents[0].isIntersecting && !listViewed) { listViewed = true; trackListView(); obs.disconnect(); }
    }, { threshold: 0.2 }).observe($('#productGrid'));
  } else { trackListView(); }

  /* ---------- 상세 모달 ---------- */
  var modal = $('#productModal');
  function openProduct(id, idx) {
    var p = byId(id); if (!p) return;
    $('#modalBody').innerHTML =
      '<button type="button" class="icon-btn modal-close" data-close aria-label="닫기">✕</button>' +
      '<div class="modal-grid"><div class="modal-media">' + canHtml(p, 'lg') + '</div><div>' +
      '<p class="card-cat">' + p.category + ' · ' + p.weight + ' · 카페인 ' + p.caffeine + '</p>' +
      '<h2 id="modalTitle">' + p.name + '</h2>' +
      '<p class="rating">★ ' + p.rating + ' <span>리뷰 ' + p.reviews.toLocaleString() + '개</span></p>' +
      '<p>' + p.desc + '</p>' +
      '<ul class="notes">' + p.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' +
      '<p class="price price--lg">' + priceHtml(p) + '</p>' +
      '<div class="qty"><button type="button" data-qty="-1" aria-label="수량 감소">−</button><output id="qtyVal">1</output><button type="button" data-qty="1" aria-label="수량 증가">+</button></div>' +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-primary" data-modal-add data-cta="pdp_add_to_cart" data-cta-location="product_modal">장바구니 담기</button>' +
        '<button type="button" class="btn btn-ghost" data-modal-buy data-cta="pdp_buy_now" data-cta-location="product_modal">바로 구매</button>' +
      '</div></div></div>';
    modal.dataset.product = p.id;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    T.track('view_item', { currency: 'KRW', value: p.salePrice || p.price, items: [T.toItem(p, idx, 1)] });
  }
  modal.addEventListener('click', function (e) {
    var p = byId(modal.dataset.product), q = $('#qtyVal');
    if (e.target === modal || e.target.closest('[data-close]')) return modal.close();
    var d = e.target.closest('[data-qty]');
    if (d) { q.textContent = Math.max(1, Math.min(9, +q.textContent + +d.dataset.qty)); return; }
    if (e.target.closest('[data-modal-add]')) { addToCart(p, +q.textContent, 'product_modal'); modal.close(); }
    if (e.target.closest('[data-modal-buy]')) { addToCart(p, +q.textContent, 'product_modal_buy_now', true); modal.close(); checkout('buy_now'); }
  });
  document.querySelectorAll('[data-open-product]').forEach(function (b) {
    b.addEventListener('click', function () { openProduct(b.dataset.openProduct); });
  });

  /* ---------- 장바구니 ---------- */
  function loadCart() { try { return JSON.parse(localStorage.getItem('ondam_cart') || '[]'); } catch (e) { return []; } }
  function saveCart() { try { localStorage.setItem('ondam_cart', JSON.stringify(cart)); } catch (e) {} }
  function cartValue() { return cart.reduce(function (s, l) { var p = byId(l.id); return s + (p ? (p.salePrice || p.price) * l.qty : 0); }, 0); }
  function cartItems() { return cart.map(function (l) { return T.toItem(byId(l.id), undefined, l.qty); }); }
  function addToCart(p, qty, source, silent) {
    var line = cart.filter(function (l) { return l.id === p.id; })[0];
    if (line) line.qty += qty; else cart.push({ id: p.id, qty: qty });
    saveCart(); renderCart();
    T.track('add_to_cart', { currency: 'KRW', value: (p.salePrice || p.price) * qty, items: [T.toItem(p, undefined, qty)], add_source: source });
    if (!silent) toast(p.name + ' ' + qty + '개를 담았어요');
  }
  function renderCart() {
    $('#cartCount').textContent = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    $('#cartItems').innerHTML = cart.length ? cart.map(function (l) {
      var p = byId(l.id);
      return '<li><span>' + p.name + ' × ' + l.qty + '</span><span>' + won((p.salePrice || p.price) * l.qty) +
        ' <button type="button" class="icon-btn" data-remove="' + p.id + '" aria-label="' + p.name + ' 삭제">✕</button></span></li>';
    }).join('') : '<li class="muted">장바구니가 비어 있어요.</li>';
    $('#cartTotal').textContent = won(cartValue());
  }
  $('#cartItems').addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]'); if (!b) return;
    var line = cart.filter(function (l) { return l.id === b.dataset.remove; })[0], p = byId(line.id);
    cart = cart.filter(function (l) { return l !== line; }); saveCart(); renderCart();
    T.track('remove_from_cart', { currency: 'KRW', value: (p.salePrice || p.price) * line.qty, items: [T.toItem(p, undefined, line.qty)] });
  });
  var drawer = $('#cartDrawer');
  $('#cartOpen').addEventListener('click', function () {
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    T.track('view_cart', { currency: 'KRW', value: cartValue(), items: cartItems() });
  });
  $('#cartClose').addEventListener('click', function () { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); });
  $('#checkoutBtn').addEventListener('click', function () { checkout('cart_drawer'); });
  function checkout(source) {
    if (!cart.length) return toast('장바구니가 비어 있어요');
    T.track('begin_checkout', { currency: 'KRW', value: cartValue(), items: cartItems(), checkout_source: source });
    toast('데모 페이지라 실제 결제는 진행되지 않아요 🙂');
  }
  renderCart();

  /* ---------- 공통 CTA 클릭 (data-cta) ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]'); if (!el) return;
    T.track('cta_click', {
      cta_id: el.dataset.cta, cta_text: (el.textContent || '').trim().slice(0, 50),
      cta_location: el.dataset.ctaLocation || 'unknown', link_url: el.getAttribute('href') || undefined
    });
  }, true);
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    a.addEventListener('click', function () { T.track('nav_click', { nav_item: a.dataset.nav }); });
  });

  /* ---------- 리드 폼 ---------- */
  $('#leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#leadMsg');
    if (!f.email.checkValidity()) { msg.textContent = '이메일 주소를 확인해 주세요.'; T.track('form_error', { form_id: 'newsletter', error_field: 'email' }); return; }
    if (!f.consent.checked) { msg.textContent = '수신 동의가 필요해요.'; T.track('form_error', { form_id: 'newsletter', error_field: 'consent' }); return; }
    // 개인정보(이메일)는 dataLayer/GA4로 보내지 않습니다.
    T.track('generate_lead', { form_id: 'newsletter', lead_source: 'coupon_15', currency: 'KRW', value: 0 });
    msg.textContent = '쿠폰이 발급됐어요! 코드: ONDAM15 (데모)';
    f.reset();
  });

  /* ---------- 토스트 ---------- */
  var tt;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('is-show'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('is-show'); }, 2200); }

  renderGrid();
})();
