(function () {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Theme (remembered when storage is available)
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const saved = store.get('theme');
  const prefersDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  $('#theme').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
  });

  // Mobile menu
  const menu = $('#menu'), burger = $('#burger');
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));

  // Nav border on scroll
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Active link highlight
  const links = $$('#menu a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  // Count-up numbers
  function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const dur = 1200, start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  // Reveal on scroll + ring fill
  const circ = 2 * Math.PI * 34;
  function fillRing(card) {
    const ring = $('.ring', card);
    if (!ring) return;
    const pct = +ring.dataset.pct;
    $('.fill', ring).style.strokeDashoffset = circ * (1 - pct / 100);
  }
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        fillRing(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(el => io.observe(el));

    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(el => cio.observe(el));
  } else {
    $$('.reveal').forEach(el => { el.classList.add('in'); fillRing(el); });
    $$('[data-count]').forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  $('#year').textContent = new Date().getFullYear();
})();
