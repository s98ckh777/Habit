/* habit Skin Lab — 공통 스크립트 (의존성 없음) */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 헤더: 히어로 위에서는 투명, 스크롤하면 불투명 */
  var hd = doc.getElementById('hd');
  var transparentTop = body.classList.contains('has-hero');
  function onScroll() {
    var y = window.scrollY > 24;
    body.classList.toggle('scrolled', y);
    if (hd) hd.classList.toggle('solid', y || !transparentTop || body.classList.contains('menu-open'));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 모바일 메뉴 */
  var burger = doc.querySelector('.burger');
  if (burger) burger.addEventListener('click', function () {
    var open = body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    onScroll();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) burger.click();
  });

  /* 맨 위로 */
  var top = doc.querySelector('.fab .top');
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* 스크롤 등장 효과 */
  var rv = doc.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* 배경 영상: 화면 밖이면 멈춤, 동작 줄이기 설정 존중, 재생/정지 버튼 */
  doc.querySelectorAll('video[data-bg]').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !reduce && !v.dataset.userPaused) v.play().catch(function () {}); else v.pause(); });
      }).observe(v);
    }
  });
  doc.querySelectorAll('[data-video-toggle]').forEach(function (b) {
    var v = doc.getElementById(b.getAttribute('data-video-toggle'));
    if (!v) { b.hidden = true; return; }
    b.addEventListener('click', function () {
      if (v.paused) { delete v.dataset.userPaused; v.play(); b.textContent = '❚❚ 영상 정지'; }
      else { v.dataset.userPaused = '1'; v.pause(); b.textContent = '▶ 영상 재생'; }
    });
  });

  /* 프로그램 필터 */
  doc.querySelectorAll('[data-filter]').forEach(function (group) {
    var items = doc.querySelectorAll(group.getAttribute('data-filter'));
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var c = b.getAttribute('data-cat');
      items.forEach(function (it) { it.hidden = c !== 'all' && (it.getAttribute('data-cat') || '').split(' ').indexOf(c) < 0; });
    });
  });

  /* 가로 슬라이더 화살표 */
  doc.querySelectorAll('[data-slider]').forEach(function (wrap) {
    var track = doc.querySelector(wrap.getAttribute('data-slider'));
    if (!track) return;
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var card = track.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
      track.scrollBy({ left: b.dataset.dir === 'prev' ? -step : step, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* 접속 팝업: 각각 닫기 + 1일 동안 보지 않기 (localStorage) */
  var pop = doc.getElementById('pop');
  if (pop) {
    var KEY = 'skinlab-pop-hide:';
    var now = Date.now();
    var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                  set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
    var posters = pop.querySelectorAll('.poster');
    posters.forEach(function (p) {
      var until = +store.get(KEY + p.dataset.pop) || 0;
      if (until > now) p.remove();
    });
    function refresh() {
      if (!pop.querySelector('.poster')) { pop.hidden = true; body.classList.remove('pop-open'); }
    }
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) {
        var p = b.closest('.poster');
        if (b.hasAttribute('data-hide')) store.set(KEY + p.dataset.pop, String(Date.now() + (+b.getAttribute('data-hide')) * 864e5));
        p.remove(); refresh();
      } else if (e.target === pop) {
        pop.querySelectorAll('.poster').forEach(function (p) { p.remove(); }); refresh();
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pop.hidden) { pop.querySelectorAll('.poster').forEach(function (p) { p.remove(); }); refresh(); }
    });
    if (pop.querySelector('.poster')) { pop.hidden = false; }
    /* 시안 메모 바: 팝업 다시 보기 */
    var again = doc.getElementById('pop-again');
    if (again) again.addEventListener('click', function () {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf(KEY) === 0) localStorage.removeItem(k); });
      location.reload();
    });
  }
})();
