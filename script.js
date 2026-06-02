/* =========================================
   PORTFOLIO SCRIPT
   Moses Olayinka | PWA & Security Engineer
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       PROJECT DATA
       ========================================= */
    const projectsData = {
        obsidian: {
            title:      "Obsidian Secure Vault",
            tags:       ["Web Crypto API", "AES-GCM", "PBKDF2", "Supabase", "Zero Knowledge", "PWA"],
            live:       "https://obsidiansecurity.vercel.app/",
            github:     "https://github.com/Moyinks/obsidian.git",
            heroImage:  "image1a.png",
            problem:    "Cloud storage made sharing data effortless. It also made breaches effortless. Every major vault product — Google, Dropbox, LastPass — holds your data in a form they can read. That's not a bug, it's their architecture. The question was whether you could build something genuinely private: where even a full server compromise gives an attacker nothing but encrypted blob.",
            solution:   "Obsidian never sends plaintext to the server. Encryption runs entirely in the browser using the Web Crypto API — AES-GCM for the data, PBKDF2 to derive the key from the user's password. Supabase stores only ciphertext. The decryption key never leaves the device. A Service Worker handles offline access so the vault is usable even when there's no connection. The architecture means there's no server-side attack surface for the actual data — the only path to your data is through your password, on your device.",
            impact:     "A working zero-knowledge vault that passes the adversarial test: a full database compromise yields encrypted blobs and nothing else. Offline-capable, installable as a PWA, built without any third-party encryption library — pure Web Crypto API. No dependency means no supply chain attack vector. Proof that privacy-first architecture doesn't have to mean the worse UX.",
            archDecision: "Why PBKDF2 instead of scrypt or Argon2? Both are stronger. But browser support was the constraint: the Web Crypto API exposes PBKDF2 natively with no library and no bundle. Scrypt and Argon2 require shipping WebAssembly, which introduces supply chain risk — the opposite of the zero-dependency goal. PBKDF2 at 250,000 iterations on SHA-256 is the correct trade-off for a browser context where the iteration cost also applies to the attacker.",
            screenshots: ["image1b.png", "image1c.png", "image1d.png"]
        },

        quickshop: {
            title:      "QuickShop",
            tags:       ["Supabase", "IndexedDB", "PWA", "Gemini AI", "ZXing Barcode", "Chart.js", "Offline-first"],
            live:       "https://quickshoppify.vercel.app/",
            github:     "https://github.com/moyinksv-ai/QuickShop.git",
            heroImage:  "image2a.png",
            problem:    "The average small trader in Nigeria is running a live business off their head. No record of what sold yesterday, no idea what's close to running out, no way to show customers what's in stock without them physically showing up or bombarding their statuses with 10s of imgaes that most people will skip. The few POS tools that exist assume a stable internet connection, a Bluetooth receipt printer, and a setup fee most traders won't pay. That's not the market. The real market is someone with a phone, patchy data, and 60 products that need tracking right now.",
            solution:   "QuickShop is an offline-first PWA that treats the network as optional. Every write hits IndexedDB immediately — the UI never waits on a server. Supabase sync runs in the background. Inventory supports barcode scanning via ZXing, dual product photos, and CSV bulk import. Sales are one tap with automatic profit calculation. A Gemini AI growth copilot runs a two-layer analysis engine: six business signals computed locally from sales data, then sent to Gemini 2.0 Flash on explicit user tap with a daily question limit (to minimize token waste) and persistent merchant memory across sessions. A shareable public catalog generates a live storefront from existing inventory — customers browse, add to cart, and fire a pre-formatted WhatsApp order. No app install. No account. A referral system with milestone-based ₦500 payouts handles organic growth. Canonical product matching via a fuzzy RPC lookup reduces duplicate SKUs as merchants type.",
            impact:     "Under three minutes from signup to a live customer-facing catalog. The offline architecture means a dropped connection is not a reason to stop working. The AI copilot surfaces actionable insight from the same sales data already being entered — no separate analytics setup. The WhatsApp catalog eliminates what would otherwise require a separate e-commerce subscription, delivery integration, and product listing tool.",
            archDecision: "Why IndexedDB-first instead of optimistic UI with server state? The target market has patchy 2G. Optimistic UI still couples the UI to a server round-trip — you're betting the connection exists. IndexedDB-first inverts the assumption: every write succeeds locally by definition, and the server is a sync target, not a dependency. The entire app is usable with no network at all. A write queue in the Service Worker reconciles with Supabase when connectivity returns.",
            screenshots: ["image2b.png", "image2c.png", "image2d.png"]
        },

        nextrade: {
            title:      "NexTrade Fintech",
            tags:       ["Supabase", "Security Definer RPC", "Guard Triggers", "PWA", "Ledger-first", "ethers.js"],
            live:       "https://nextradecommerce.vercel.app/",
            github:     "https://github.com/Moyinks/NexTrade.git",
            heroImage:  "nex-hero.png",
            problem:    "Most retail investment apps treat their database like a regular app database — rows get updated, balances get overwritten, and if something goes wrong you're left with a number that doesn't reconcile with anything. For a financial product that's not an implementation detail, it's a liability. The challenge was building something where the money trail is structurally auditable — not because of logging, but because of how the data model and execution layer work together.",
            solution:   "NexTrade is built on a ledger-first architecture. No balance is ever stored directly — every figure is derived by summing append-only transaction entries. Critically, every financial mutation runs through a SECURITY DEFINER Postgres RPC. Guard triggers block all direct writes to the transactions, investments, and balances tables — the client cannot touch financial data without going through validated server logic. Deposits are flagged for admin review and credited only after verification. Users allocate across two yield strategies. Every action — deposit, approval, investment, trade, claim — is a new ledger entry. Nothing is ever edited or deleted. A server-side reconciliation function surfaces any drift between stored and derived balances across all accounts in a single query.",
            impact:     "Balance drift is impossible at two layers: the data model (every balance is derived, never stored directly) and the execution layer (seven server-side RPCs are the only write path; Postgres guard triggers enforce this without exception). The full deposit → approval → invest → claim lifecycle was built and validated with real users. The reconciliation query surfaces any discrepancy across all accounts in real time — before any compliance layer ever needs to care.",
            archDecision: "Why server-side guard triggers instead of just RLS policies? RLS controls which rows a user can reach but not what values they write. An authenticated client can still call .from('transactions').insert({amount: 999999}) if the policy permits inserts. The guard trigger pattern (BEFORE INSERT OR UPDATE OR DELETE) blocks all direct writes at the Postgres trigger level regardless of client. The only write path is through SECURITY DEFINER RPCs that validate inputs against the live ledger before executing. The client is structurally incapable of causing financial drift — not by trust, by architecture.",
            screenshots: ["nex-1.png", "nex-2.png", "nex-3.png"]
        }
    };

    /* =========================================
       ELEMENT REFS
       ========================================= */
    const html            = document.documentElement;
    const modal           = document.getElementById('project-modal');
    const modalContent    = modal ? modal.querySelector('.modal-content') : null;
    const modalTitle      = document.getElementById('modal-title');
    const modalTags       = document.getElementById('modal-tech-tags');
    const modalProblem    = document.getElementById('modal-problem');
    const modalSolution   = document.getElementById('modal-solution');
    const modalImpact     = document.getElementById('modal-impact');
    const modalHeroImage  = document.getElementById('modal-hero-image');
    const modalImagesGrid = document.getElementById('modal-images-grid');
    const modalLiveDemo      = document.getElementById('modal-live-demo');
    const modalGithub        = document.getElementById('modal-github');
    const modalArchDecision  = document.getElementById('modal-arch-decision');
    const modalArchSection   = document.getElementById('modal-arch-section');
    const closeModalBtn   = document.getElementById('close-modal');
    const readMoreButtons = document.querySelectorAll('.project-read-more');
    const shockwaveRing   = document.getElementById('shockwave-ring');

    let lastFocusedButton = null;
    let closeTimeout      = null;

    /* =========================================
       1. THEME MANAGEMENT
       ========================================= */
    const desktopThemeBtn = document.getElementById('theme-toggle');
    const mobileThemeBtn  = document.getElementById('mobile-theme-toggle');

    applyTheme(localStorage.getItem('theme') || 'dark');

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const isDark = theme === 'dark';
        document.querySelectorAll('.icon-sun').forEach(el  => el.style.display = isDark ? 'block' : 'none');
        document.querySelectorAll('.icon-moon').forEach(el => el.style.display = isDark ? 'none'  : 'block');
    }

    function toggleTheme() {
        applyTheme(html.getAttribute('data-theme') === 'dark' ? 'gradient' : 'dark');
    }

    if (desktopThemeBtn) desktopThemeBtn.addEventListener('click', toggleTheme);
    if (mobileThemeBtn)  mobileThemeBtn.addEventListener('click',  toggleTheme);

    /* =========================================
       2. SHOCKWAVE RING HELPER
       
       Fires a 2-beat animation:
       Beat 1 (t=0ms):   Accent ring expands from tap point — instant physical response
       Beat 2 (t=80ms):  Clip-path ripple fill begins, flooding the screen
    ========================================= */
    function fireShockwave(originX, originY, onRingPeak) {
        if (!shockwaveRing) {
            if (onRingPeak) onRingPeak();
            return;
        }

        /* Position ring at tap point */
        shockwaveRing.style.left   = originX + 'px';
        shockwaveRing.style.top    = originY + 'px';
        shockwaveRing.style.width  = '60px';
        shockwaveRing.style.height = '60px';

        /* Remove class to reset animation, force reflow, re-add */
        shockwaveRing.classList.remove('firing');
        void shockwaveRing.offsetWidth; /* force reflow */
        shockwaveRing.classList.add('firing');

        /* Trigger modal fill on beat 2 */
        setTimeout(() => {
            if (onRingPeak) onRingPeak();
        }, 80);

        /* Clean up class when animation ends */
        shockwaveRing.addEventListener('animationend', function cleanup() {
            shockwaveRing.classList.remove('firing');
            shockwaveRing.removeEventListener('animationend', cleanup);
        });
    }

    /* =========================================
       3. MODAL — OPEN / CLOSE
       ========================================= */
    function openModal(projectId, triggerEl, clientX, clientY) {
        const project = projectsData[projectId];
        if (!project || !modal || !modalContent) return;

        /* Populate */
        try {
            if (modalTitle)    modalTitle.textContent    = project.title    || '';
            if (modalProblem)  modalProblem.textContent  = project.problem  || '';
            if (modalSolution) modalSolution.textContent = project.solution || '';
            if (modalImpact)   modalImpact.textContent   = project.impact   || '';
            if (modalLiveDemo)     modalLiveDemo.href        = project.live          || '#';
            if (modalGithub)       modalGithub.href          = project.github        || '#';
            if (modalArchDecision) modalArchDecision.textContent = project.archDecision || '';
            if (modalArchSection)  modalArchSection.style.display = project.archDecision ? '' : 'none';

            if (modalHeroImage) {
                modalHeroImage.src = project.heroImage || '';
                modalHeroImage.alt = (project.title || projectId) + ' hero image';
            }
            if (modalTags) {
                const tags = Array.isArray(project.tags) ? project.tags : [];
                modalTags.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
            }
            if (modalImagesGrid) {
                const shots = Array.isArray(project.screenshots) ? project.screenshots : [];
                modalImagesGrid.innerHTML = shots
                    .map((src, i) => `<img src="${src}" alt="${project.title || ''} screenshot ${i + 1}" loading="lazy">`)
                    .join('');
            }
        } catch (_) { /* populate error — still open */ }

        /* Origin: button center in viewport coords */
        let ox = clientX, oy = clientY;
        if (triggerEl) {
            const r = triggerEl.getBoundingClientRect();
            ox = r.left + r.width  / 2;
            oy = r.top  + r.height / 2;
        }

        /* Convert to % for CSS clip-path */
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const originXpct = ((ox / vw) * 100).toFixed(2) + '%';
        const originYpct = ((oy / vh) * 100).toFixed(2) + '%';

        modalContent.style.setProperty('--origin-x', originXpct);
        modalContent.style.setProperty('--origin-y', originYpct);

        /* Aria */
        readMoreButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
        if (triggerEl) {
            triggerEl.setAttribute('aria-expanded', 'true');
            lastFocusedButton = triggerEl;
        }

        /* Clear any running close animation */
        if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
        modal.classList.remove('closing');

        /* Reset scroll */
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) modalBody.scrollTop = 0;

        /* Beat 1: shockwave ring */
        fireShockwave(ox, oy, () => {
            /* Beat 2: modal ripple fill */
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (closeModalBtn) setTimeout(() => closeModalBtn.focus(), 60);
        });
    }

    function closeModal() {
        if (!modal || !modal.classList.contains('open')) return;

        modal.classList.add('closing');
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');

        closeTimeout = setTimeout(() => {
            modal.classList.remove('closing');
            document.body.style.overflow = '';
            if (lastFocusedButton) {
                lastFocusedButton.setAttribute('aria-expanded', 'false');
                lastFocusedButton.focus();
                lastFocusedButton = null;
            }
        }, 420);
    }

    readMoreButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            openModal(this.dataset.projectId, this, e.clientX, e.clientY);
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
    });

    /* =========================================
       4. DRAWER
       ========================================= */
    const drawer   = document.getElementById('side-drawer');
    const backdrop = document.getElementById('backdrop');
    const menuBtn  = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        if (menuBtn)  menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        if (menuBtn)  menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (menuBtn)  menuBtn.addEventListener('click',  openDrawer);
    if (closeBtn) closeBtn.addEventListener('click',  closeDrawer);
    if (backdrop) backdrop.addEventListener('click',  closeDrawer);

    /* =========================================
       5. SHARE BUTTON
       ========================================= */
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = { title: 'Moses Olayinka | PWA & Security Engineer', text: "Check out Moses's portfolio — PWA, E2EE, and offline-first engineering.", url: window.location.href };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    const orig = shareBtn.textContent;
                    shareBtn.textContent = 'Link copied!';
                    setTimeout(() => { shareBtn.textContent = orig; }, 2000);
                }
            } catch (_) {}
            closeDrawer();
        });
    }

    /* =========================================
       6. SCROLL SPY
       ========================================= */
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link');
    const dockItems = document.querySelectorAll('.dock-item[href]');

    function setActiveLink(id) {
        navLinks.forEach(a  => a.classList.toggle('active',  a.getAttribute('href') === '#' + id));
        dockItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }

    if ('IntersectionObserver' in window && sections.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) setActiveLink(e.target.id); });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    /* =========================================
       7. CARD ENTRANCE — staggered fade-up
       ========================================= */
    const animatedCards = document.querySelectorAll('.card-animate');

    if ('IntersectionObserver' in window && animatedCards.length) {
        const cardObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = Array.from(animatedCards).indexOf(entry.target);
                    setTimeout(() => entry.target.classList.add('visible'), idx * 130);
                    cardObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        animatedCards.forEach(c => cardObs.observe(c));
    } else {
        animatedCards.forEach(c => c.classList.add('visible'));
    }

    /* =========================================
       8. CARD TILT ON HOVER / TOUCH
       
       Each card rotates max ±5° on X/Y axes
       based on where the pointer is within the card.
       Resets smoothly on mouse leave / touch end.
       ========================================= */
    const tiltCards = document.querySelectorAll('.project-card');
    const TILT_MAX  = 5; /* degrees */

    function applyTilt(card, e) {
        const rect  = card.getBoundingClientRect();
        const cx    = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width  / 2);
        const cy    = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top  + rect.height / 2);

        /* Normalize: -1 to +1 within card */
        const nx = ((cx - rect.left)  / rect.width)  * 2 - 1;
        const ny = ((cy - rect.top)   / rect.height) * 2 - 1;

        /* Tilt: positive nx → tilt right; positive ny → tilt backward */
        const rotateY =  nx * TILT_MAX;
        const rotateX = -ny * TILT_MAX;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    }

    function resetTilt(card) {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    tiltCards.forEach(card => {
        card.addEventListener('mousemove',  e => applyTilt(card, e));
        card.addEventListener('mouseleave', () => resetTilt(card));
        card.addEventListener('touchmove',  e => applyTilt(card, e),  { passive: true });
        card.addEventListener('touchend',   () => resetTilt(card));
    });

    /* =========================================
       9. HERO H1 — staggered word entrance
       
       Each .word gets class .revealed with
       80ms delay per word after page load.
       ========================================= */
    const words = document.querySelectorAll('.hero-headline .word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('revealed'), 200 + i * 80);
    });

    /* =========================================
       10. TYPEWRITER LOOP
       
       Cycles through rotating phrases about
       what Moses is currently building/studying.
       Runs simultaneously in drawer and sidebar.
       ========================================= */
    const phrases = [
        '▸ server-side guard triggers',
        '▸ building offline-first for real markets',
        '▸ E2EE key derivation from first principles',
        '▸ ledger-first financial data models',
        '▸ AI copilots on constrained budgets',
        '▸ HD wallet derivation with ethers.js',
    ];

    const typewriterTargets = [
        document.getElementById('drawer-typewriter'),
        document.getElementById('sidebar-typewriter'),
    ].filter(Boolean);

    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let twTimer     = null;

    function tick() {
        const current = phrases[phraseIndex];

        if (!isDeleting) {
            charIndex++;
            typewriterTargets.forEach(el => el.textContent = current.slice(0, charIndex));

            if (charIndex === current.length) {
                isDeleting = true;
                twTimer = setTimeout(tick, 2400); /* pause at full phrase */
                return;
            }
        } else {
            charIndex--;
            typewriterTargets.forEach(el => el.textContent = current.slice(0, charIndex));

            if (charIndex === 0) {
                isDeleting  = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                twTimer = setTimeout(tick, 400); /* brief pause before next phrase */
                return;
            }
        }

        /* Typing speed: 55ms, deleting speed: 28ms */
        twTimer = setTimeout(tick, isDeleting ? 28 : 55);
    }

    /* Start typewriter after hero words finish (~1.2s) */
    setTimeout(tick, 1200);

    /* =========================================
       11. SMOOTH SCROLL
       ========================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                closeDrawer();
            }
        });
    });

    /* =========================================
       12. FOOTER YEAR
       ========================================= */
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    /* =========================================
       14. DEPLOY STATUS CHECK

       Uses fetch() in no-cors mode so no token is needed.
       An opaque response (status 0) still means the server
       responded — the site is live. A network rejection means
       genuinely unreachable. The badge gets a .verified class
       on success; the visual change is handled in CSS.
       Falls back gracefully: if fetch is unavailable or throws
       unexpectedly, the badge stays as its static default.
       ========================================= */
    async function checkLiveStatus(url, badgeEl) {
        if (!badgeEl) return;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
            await fetch(url, {
                method:  'HEAD',
                mode:    'no-cors',
                cache:   'no-store',
                signal:  controller.signal
            });
            // Opaque response still means server is up
            badgeEl.classList.add('verified');
            badgeEl.title = 'Verified live';
        } catch (_) {
            // Timeout or network failure — leave badge as default
        } finally {
            clearTimeout(timer);
        }
    }

    // Kick off async status checks — one per card, non-blocking
    document.querySelectorAll('.project-card[data-live-url]').forEach(card => {
        const url    = card.dataset.liveUrl;
        const badge  = card.querySelector('.live-badge');
        if (url && badge) checkLiveStatus(url, badge);
    });

    /* =========================================
       13. CONTACT FORM
       
       Submits to Formspree via fetch so the page
       doesn't reload. Replace YOUR_FORM_ID in
       index.html with your real Formspree endpoint.
       Get one free at formspree.io.
       ========================================= */
    const contactForm   = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');
    const contactSubmit = document.getElementById('contact-submit');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const message = document.getElementById('contact-message')?.value.trim();
            const email   = document.getElementById('contact-email')?.value.trim();

            if (!message || !email) {
                if (contactStatus) {
                    contactStatus.textContent = 'Please fill in both fields.';
                    contactStatus.className   = 'contact-form-status error';
                }
                return;
            }

            if (contactSubmit) {
                contactSubmit.disabled     = true;
                contactSubmit.textContent  = 'Sending…';
            }

            try {
                const res = await fetch(contactForm.action, {
                    method:  'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ message, _replyto: email })
                });

                if (res.ok) {
                    contactForm.reset();
                    if (contactStatus) {
                        contactStatus.textContent = '✓ Sent. I\'ll get back to you.';
                        contactStatus.className   = 'contact-form-status success';
                    }
                } else {
                    throw new Error('Server error');
                }
            } catch (_) {
                if (contactStatus) {
                    contactStatus.textContent = 'Something went wrong. Email me directly instead.';
                    contactStatus.className   = 'contact-form-status error';
                }
            } finally {
                if (contactSubmit) {
                    contactSubmit.disabled    = false;
                    contactSubmit.innerHTML   = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                }
            }
        });
    }

});
