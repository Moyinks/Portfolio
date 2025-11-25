document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. THEME MANAGEMENT
       ========================================= */
    const html = document.documentElement;
    const desktopBtn = document.getElementById('theme-toggle');
    const mobileBtn = document.getElementById('mobile-theme-toggle');
    
    // Check LocalStorage or Default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // Event Listeners
    if (desktopBtn) desktopBtn.addEventListener('click', () => toggleTheme());
    if (mobileBtn) mobileBtn.addEventListener('click', () => toggleTheme());

    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'gradient' : 'dark';
        applyTheme(newTheme);
    }

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateIcons(desktopBtn, theme);
        updateIcons(mobileBtn, theme);
    }

    function updateIcons(btn, theme) {
        if (!btn) return;
        const sun = btn.querySelector('.icon-sun');
        const moon = btn.querySelector('.icon-moon');

        if (theme === 'dark') {
            if (sun) sun.style.display = 'block';
            if (moon) moon.style.display = 'none';
            btn.setAttribute('aria-label', 'Switch to gradient theme');
        } else {
            if (sun) sun.style.display = 'none';
            if (moon) moon.style.display = 'block';
            btn.setAttribute('aria-label', 'Switch to dark theme');
        }
    }


    /* =========================================
       2. SIDE DRAWER LOGIC (The Surprise)
       ========================================= */
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');
    const drawer = document.getElementById('side-drawer');
    const backdrop = document.getElementById('backdrop');

    function toggleDrawer() {
        if (!drawer || !backdrop) return;
        drawer.classList.toggle('open');
        backdrop.classList.toggle('open');
    }

    // Open/Close Events
    if (menuBtn) menuBtn.addEventListener('click', toggleDrawer);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleDrawer);
    if (backdrop) backdrop.addEventListener('click', toggleDrawer); // Close when clicking outside


    /* =========================================
       3. SHARE BUTTON LOGIC (Copy Link)
       ========================================= */
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            try {
                // Copy current URL to clipboard
                await navigator.clipboard.writeText(window.location.href);
                
                // Save original content
                const originalContent = shareBtn.innerHTML;
                
                // Show visual feedback (Green text + "Copied!")
                shareBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Copied!
                `;
                shareBtn.style.borderColor = '#10b981';
                shareBtn.style.color = '#10b981';

                // Revert back after 2 seconds
                setTimeout(() => {
                    shareBtn.innerHTML = originalContent;
                    shareBtn.style.borderColor = '';
                    shareBtn.style.color = '';
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy', err);
            }
        });
    }


    /* =========================================
       4. SCROLL SPY (Active Link Highlighting)
       ========================================= */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .dock-item');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -50% 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                setActiveLink(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    function setActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }

    
    /* =========================================
       5. SMOOTH SCROLLING
       ========================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignore placeholder links

            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close drawer if open (mobile UX)
                if (drawer && drawer.classList.contains('open')) {
                    toggleDrawer();
                }

                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                setActiveLink(targetId.substring(1));
            }
        });
    });
});
