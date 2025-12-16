document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       PROJECT DATA (MOCK CONTENT FOR MODAL)
       ========================================= */
    const projectsData = {
        obsidian: {
            title: "Obsidian Secure Vault",
            tags: ["Web Crypto API", "Supabase", "Zero Knowledge", "AES-GCM"],
            live: "https://obsidiansecurity.vercel.app/",
            github: "https://github.com/Moyinks/obsidian.git",
            heroImage: "image1a.png", // Placeholder
            problem: "Users lacked a truly private, client-side encrypted vault for sensitive data, forcing reliance on trust-based cloud providers. The challenge was building true Zero-Knowledge encryption into a Progressive Web App (PWA) that could function reliably offline.",
            solution: "A PWA implementing **Client-Side End-to-End Encryption** using the browser's Web Crypto API (AES-GCM for encryption and PBKDF2 for key derivation). Data is encrypted before leaving the browser, ensuring the server (Supabase) never holds unencrypted user secrets. Offline support is achieved using a Service Worker and IndexedDB for local caching and synchronization.",
            impact: "Established a market-ready, zero-knowledge data vault, preserving user privacy and providing access to sensitive records even in offline or intermittent network conditions. This model completely removes the threat of server-side data breaches compromising user information.",
            screenshots: [
                "image1b.png", // Placeholder
                "image1c.png", // Placeholder
                "image1d.png"  // Placeholder
            ]
        },
        quickshop: {
            title: "QuickShop Inventory",
            tags: ["Firebase Sync", "IndexedDB", "Auth", "Optimistic UI", "PWA"],
            live: "https://quickshop-ten.vercel.app/",
            github: "https://github.com/Moyinks/QuickShop.git",
            heroImage: "image2a.png", // Placeholder
            problem: "Retail Point-of-Sale (POS) systems in areas with poor internet connectivity suffer from frustrating latency and transaction failures, leading to poor user experience and lost sales.",
            solution: "Developed a mobile-first PWA with an **Optimistic UI**, giving instant feedback to the user on every action, regardless of network status. Transactions are immediately written to IndexedDB, and a background Service Worker manages synchronization, queuing failed transactions and automatically retrying when a stable connection is detected, ensuring data eventual consistency.",
            impact: "Created a resilient POS system capable of operating continuously in 100% offline mode. The Optimistic UI provides a seamless user experience, eliminating perceived latency and dramatically increasing operational reliability in low-bandwidth environments.",
            screenshots: [
                "image2b.png", // Placeholder
                "image2c.png", // Placeholder
                "image2d.png"  // Placeholder
            ]
        }
    };

    /* =========================================
       1. THEME MANAGEMENT
       ========================================= */
    const html = document.documentElement;
    const desktopBtn = document.getElementById('theme-toggle');
    const mobileBtn = document.getElementById('mobile-theme-toggle');
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

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

    if (menuBtn) menuBtn.addEventListener('click', toggleDrawer);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleDrawer);
    if (backdrop) backdrop.addEventListener('click', toggleDrawer);


    /* =========================================
       3. SHARE BUTTON LOGIC (Copy Link)
       ========================================= */
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                const originalContent = shareBtn.innerHTML;
                
                shareBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Copied!
                `;
                shareBtn.style.borderColor = '#10b981';
                shareBtn.style.color = '#10b981';

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
       4. PROJECT MODAL LOGIC (The Story)
       ========================================= */
    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const readMoreButtons = document.querySelectorAll('.project-card .project-read-more');

    // Modal elements
    const modalTitle = document.getElementById('modal-title');
    const modalTags = document.getElementById('modal-tech-tags');
    const modalProblem = document.getElementById('modal-problem');
    const modalSolution = document.getElementById('modal-solution');
    const modalImpact = document.getElementById('modal-impact');
    const modalLiveDemo = document.getElementById('modal-live-demo');
    const modalGithub = document.getElementById('modal-github');
    const modalHeroImage = document.getElementById('modal-hero-image');
    const modalImagesGrid = document.getElementById('modal-images-grid');

    function openModal(projectId) {
        const project = projectsData[projectId];
        if (!project) return;

        // Populate Modal Content
        modalTitle.textContent = project.title;
        modalProblem.textContent = project.problem;
        modalSolution.textContent = project.solution;
        modalImpact.textContent = project.impact;
        
        // CRITICAL FIX: Ensure href attributes are set correctly
        if (modalLiveDemo) modalLiveDemo.href = project.live;
        if (modalGithub) modalGithub.href = project.github;
        
        // Add Hero Image
        modalHeroImage.src = project.heroImage; // Set placeholder image name
        modalHeroImage.alt = `${project.title} screenshot`;

        // Add Tags
        modalTags.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

        // Add Screenshots (Placeholders)
        modalImagesGrid.innerHTML = project.screenshots.map(src => 
            `<img src="${src}" alt="${project.title} screenshot" loading="lazy">`
        ).join('');
        
        // Display Modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Event Listeners for project cards
    readMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.currentTarget.dataset.projectId;
            openModal(projectId);
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Close modal if user clicks outside the modal-content
            if (e.target.id === 'project-modal') {
                closeModal();
            }
        });
    }

    /* =========================================
       5. SCROLL SPY (Active Link Highlighting)
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
       6. SMOOTH SCROLLING (FIXED: Excludes modal links)
       ========================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        
        // FIX: If the anchor is inside the modal, skip it, as it should be an external link 
        // that shouldn't be prevented by smooth scrolling logic.
        if (anchor.closest('#project-modal')) {
             return; 
        }

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
