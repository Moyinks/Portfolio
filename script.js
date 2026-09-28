(() => {
  'use strict';

  const root = document.documentElement;
  const routeLabel = document.getElementById('route-label');
  const linksConfig = window.PROJECT_LINKS || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeCaseTrigger = null;

  function syncThemeControls(theme) {
    const isLight = theme === 'light';
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      button.setAttribute('aria-pressed', String(isLight));
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('mo-theme', theme); } catch (_) {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f2efe7' : '#0b0d0b');
    syncThemeControls(theme);
  }

  syncThemeControls(root.getAttribute('data-theme') || 'dark');
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
  });

  function wireProjectLinks() {
    document.querySelectorAll('.project-link[data-project][data-kind]').forEach((link) => {
      const project = link.dataset.project;
      const kind = link.dataset.kind;
      const href = linksConfig?.[project]?.[kind]?.trim?.() || '';
      const label = kind === 'github' ? 'Source' : 'Preview';
      if (!href) {
        link.href = '#';
        link.classList.add('is-missing');
        link.textContent = `${label} — add URL`;
        link.setAttribute('aria-disabled', 'true');
        link.title = `Add ${project}.${kind} in project-links.js`;
        link.addEventListener('click', (event) => event.preventDefault());
      } else {
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.classList.remove('is-missing');
        link.removeAttribute('aria-disabled');
        link.textContent = kind === 'github' ? 'Source ↗' : 'Preview ↗';
      }
    });
  }

  function wireScreenshots() {
    document.querySelectorAll('.shot-shell').forEach((shell) => {
      const img = shell.querySelector('img');
      if (!img) return;
      const markLoaded = () => shell.classList.add('has-image');
      const markMissing = () => shell.classList.remove('has-image');
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markMissing, { once: true });
      if (img.complete && img.naturalWidth > 0) markLoaded();
    });
  }

  const routeSections = [...document.querySelectorAll('[data-route]')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];

  function setActiveRoute(route) {
    const key = route.toLowerCase();
    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === key;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (routeLabel) routeLabel.textContent = route;
  }

  if ('IntersectionObserver' in window) {
    const routeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.dataset?.route) setActiveRoute(visible.target.dataset.route);
    }, { rootMargin: '-26% 0px -62% 0px', threshold: [0, .08, .18, .38] });
    routeSections.forEach((section) => routeObserver.observe(section));
  }

  function wireReveals() {
    const revealTargets = [
      ...document.querySelectorAll('.section-heading, .problem-row, .project-stage, .project-copy, .field-note, .lab-card, .portrait-interrupt, .about-copy, .contact-copy, .contact-form')
    ];
    revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    root.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  function wireNowRotator() {
    const strip = document.querySelector('.now-live');
    const product = document.getElementById('now-product');
    const question = document.getElementById('now-question');
    if (!strip || !product || !question || reduceMotion) return;

    const items = [
      { product: 'FlowLab', question: 'How much can AI change before the artist disappears?' },
      { product: 'Betabot', question: 'Does the idea survive when the rules stop moving?' }
    ];
    let index = 0;
    let timer = null;

    const change = () => {
      index = (index + 1) % items.length;
      strip.classList.remove('is-changing');
      void strip.offsetWidth;
      product.textContent = items[index].product;
      question.textContent = items[index].question;
      strip.classList.add('is-changing');
    };

    const start = () => {
      if (timer || document.hidden) return;
      timer = window.setInterval(change, 6400);
    };
    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    // Only real hover devices pause on hover. Touch browsers can synthesize
    // mouse events, so binding these unconditionally can strand the rotator.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      strip.addEventListener('mouseenter', stop);
      strip.addEventListener('mouseleave', start);
    }

    // Keyboard focus pauses changing text. Pointer/touch activation blurs the
    // same-page anchor again so navigation cannot leave the cycle paused.
    strip.addEventListener('focusin', stop);
    strip.addEventListener('focusout', start);
    strip.addEventListener('click', (event) => {
      if (event.detail > 0) {
        strip.blur();
        start();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  function updateCaseProgress(dialog) {
    const scroller = dialog?.querySelector('.case-scroll');
    const shell = dialog?.querySelector('.case-shell');
    if (!scroller || !shell) return;
    const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    const progress = Math.min(100, Math.max(0, (scroller.scrollTop / max) * 100));
    shell.style.setProperty('--case-progress', progress.toFixed(2));
  }

  function closeDialog(dialog) {
    if (!dialog?.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.close();
      document.body.classList.remove('case-open');
      activeCaseTrigger?.focus?.({ preventScroll: true });
      activeCaseTrigger = null;
    };

    if (reduceMotion) {
      finish();
      return;
    }

    dialog.classList.add('is-closing');
    window.setTimeout(finish, 180);
  }

  document.querySelectorAll('.open-case').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(`case-${button.dataset.case}`);
      if (!dialog) return;
      activeCaseTrigger = button;
      dialog.classList.remove('is-closing');
      dialog.showModal();
      document.body.classList.add('case-open');
      const scroller = dialog.querySelector('.case-scroll');
      scroller?.scrollTo({ top: 0, behavior: 'auto' });
      updateCaseProgress(dialog);
    });
  });

  document.querySelectorAll('.case-dialog').forEach((dialog) => {
    const scroller = dialog.querySelector('.case-scroll');
    scroller?.addEventListener('scroll', () => updateCaseProgress(dialog), { passive: true });
    dialog.querySelectorAll('.case-close, .case-back').forEach((button) => button.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('case-open');
      dialog.classList.remove('is-closing');
    });
  });

  const form = document.getElementById('contact-form');
  const subject = document.getElementById('form-subject');
  const status = document.getElementById('form-status');
  const SUBJECTS = {
    "I'm hiring": "I'm hiring — Portfolio enquiry",
    "I have a project": "I have a project — Portfolio enquiry",
    "Something else": "Portfolio enquiry — Other"
  };

  function updateSubject() {
    const intent = form?.querySelector('input[name="intent"]:checked')?.value || "I'm hiring";
    if (subject) subject.value = SUBJECTS[intent] || 'Portfolio enquiry';
  }

  form?.querySelectorAll('input[name="intent"]').forEach((radio) => radio.addEventListener('change', updateSubject));
  updateSubject();

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';
    if (!form.reportValidity()) return;
    updateSubject();

    const button = form.querySelector('.send-button');
    const original = button.textContent;
    const selectedIntent = form.querySelector('input[name="intent"]:checked')?.value || "I'm hiring";
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Unable to send message');
      form.reset();
      const selectedRadio = [...form.querySelectorAll('input[name="intent"]')].find((radio) => radio.value === selectedIntent) || form.querySelector('input[name="intent"]');
      if (selectedRadio) selectedRadio.checked = true;
      updateSubject();
      status.textContent = 'Sent. I’ll reply to the email you provided.';
      status.classList.add('is-success');
    } catch (_) {
      status.textContent = 'That did not send. Check your connection and try again.';
      status.classList.add('is-error');
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }

  wireProjectLinks();
  wireScreenshots();
  wireReveals();
  wireNowRotator();
})();
