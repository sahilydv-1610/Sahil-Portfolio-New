// ============================================
// PORTFOLIO — Performance-Optimized + Liquid Glass
// ============================================

// Wait for all deferred scripts to load, then init
window.addEventListener('load', async () => {
    // Run intro animation immediately
    runIntroSequence();

    try {
        await fetchData();
    } catch (e) {
        console.error("Data rendering failed:", e);
    }

    // Defer heavy inits using requestIdleCallback (or fallback)
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

    idle(() => {
        try { initThreeJS(); } catch (e) { console.warn("Three.js failed:", e); }
    });
    idle(() => {
        try { initLenis(); } catch (e) { console.warn("Lenis failed:", e); }
    });
    idle(() => {
        initScrollProgress();
        initMagneticTilt();
        initMouseGlow();
    });
});

// ============================================
// INTRO SEQUENCE — Cinematic Name Reveal
// ============================================
async function runIntroSequence() {
    const screen = document.getElementById('intro-screen');
    if (!screen) return;

    const letters = screen.querySelectorAll('.intro-letter');
    const lineAccent = screen.querySelector('.intro-line-accent');
    const subtitleText = screen.querySelector('.intro-subtitle-text');
    const tagline = screen.querySelector('.intro-tagline');

    // Wait a beat before starting
    await sleep(400);

    // Phase 1: Reveal letters one by one with glitch flash
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        letter.classList.add('flash');
        await sleep(80);
        letter.classList.remove('flash');
        letter.classList.add('revealed');
        await sleep(120);
    }

    await sleep(300);

    // Phase 2: Expand accent line + typewriter subtitle
    if (lineAccent) lineAccent.classList.add('expanded');
    await sleep(400);

    const subtitle = "Full Stack Developer";
    if (subtitleText) {
        for (let i = 0; i <= subtitle.length; i++) {
            subtitleText.textContent = subtitle.slice(0, i);
            await sleep(45);
        }
    }

    await sleep(300);

    // Phase 3: Tagline fade in
    if (tagline) tagline.classList.add('visible');

    await sleep(1200);

    // Phase 4: Exit — zoom + blur out
    screen.classList.add('exit');

    await sleep(1000);
    screen.classList.add('hidden');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// SMOOTH SCROLL — Lenis
// ============================================
function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
    }
}

// ============================================
// THREE.JS — Optimized Particles (2000 count)
// ============================================
let threeAnimId;

function initThreeJS() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Reduced particle count for performance
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 10;
    for (let i = 0; i < count; i++) velocities[i] = Math.random() * 0.015 + 0.005;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.006,
        color: '#10b981',
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let isVisible = true;

    // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    function animate() {
        threeAnimId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const pos = particles.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 2] += velocities[i] * 4;
            if (pos[i * 3 + 2] > 2) pos[i * 3 + 2] = -8;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    animate();

    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 200);
    });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}

// ============================================
// MOUSE GLOW FOLLOWING
// ============================================
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let active = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!active) {
            active = true;
            glow.style.opacity = '1';
        }
    }, { passive: true });

    function updateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(updateGlow);
    }
    requestAnimationFrame(updateGlow);
}

// ============================================
// MAGNETIC TILT ON CARDS
// ============================================
function initMagneticTilt() {
    const cards = document.querySelectorAll('.glass-card, .project-card-v2, .cert-dossier');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -3;
            const rotateY = (x - centerX) / centerX * 3;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

            // Update inner glow position for glass-card::after
            card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
            card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// SKILL ORBIT
// ============================================
let skillOrbitTimeline;

function renderOrbitingSkills(skills) {
    const container = document.getElementById('skill-orbit');
    if (!container || !skills || skills.length === 0) return;

    const uniqueSkills = [...new Set(skills)];
    const batchSize = 8;
    let currentStartIndex = 0;

    function showBatch() {
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            batch.push(uniqueSkills[(currentStartIndex + i) % uniqueSkills.length]);
        }
        currentStartIndex = (currentStartIndex + batchSize) % uniqueSkills.length;

        const radius = window.innerWidth > 768 ? 200 : 150;
        const html = batch.map((skill, i) => {
            const angle = (i / batchSize) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return `<div class="skill-circle opacity-0" style="left: calc(50% + ${x}px); top: calc(50% + ${y}px); transform: translate(-50%, -50%) scale(0.5);">${skill}</div>`;
        }).join('');

        if (typeof gsap === 'undefined') {
            container.innerHTML = html;
            return;
        }

        gsap.to(container.children, {
            opacity: 0,
            scale: 0,
            duration: 0.8,
            stagger: 0.05,
            onComplete: () => {
                container.innerHTML = html;
                gsap.to(container.children, {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    stagger: 0.08,
                    ease: 'elastic.out(1, 0.5)'
                });
            }
        });
    }

    showBatch();

    if (typeof gsap !== 'undefined') {
        if (skillOrbitTimeline) skillOrbitTimeline.kill();
        skillOrbitTimeline = gsap.to(container, {
            rotation: 360,
            duration: 50,
            repeat: -1,
            ease: 'none',
            onUpdate: function () {
                const currentRotation = gsap.getProperty(container, "rotation");
                gsap.set(container.children, { rotation: -currentRotation });
            }
        });
    }

    setInterval(showBatch, 7000);
}

// ============================================
// GSAP ANIMATIONS — Intersection Observer Powered
// ============================================
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const tl = gsap.timeline();
    tl.to('#hero-content', { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' })
      .to('#hero-contact-block', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.6');

    // Scroll-triggered reveals with stagger
    document.querySelectorAll('section').forEach(section => {
        const reveals = section.querySelectorAll('.reveal-stagger');
        if (reveals.length > 0) {
            gsap.to(Array.from(reveals), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    once: true // only trigger once for performance
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });
}

function initInteractivity() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.05, duration: 0.3, ease: 'power2.out' }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }));
    });
}

// ============================================
// DATA FETCH & RENDER
// ============================================
async function fetchData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        window.portfolioData = data;

        // Batch all renders
        renderPersonal(data.personal);
        renderEducation(data.education);
        renderExperience(data.experience);
        renderSkills(data.skills);
        renderServices(data.services);
        renderProjects(data.projects);
        renderCertificates(data.certificates);
        renderTestimonials(data.testimonials);
        renderContact(data.contact);
        renderSocial(data.personal.social);

        // Collect ALL skills for orbit
        let allSkills = [];
        if (data.skills.timeline) {
            data.skills.timeline.forEach(t => allSkills.push(...t.skills));
        }
        if (data.skills.soft) {
            data.skills.soft.forEach(s => allSkills.push(s.name));
        }
        renderOrbitingSkills(allSkills);

        // Init animations after DOM is populated
        requestAnimationFrame(() => {
            initInteractivity();
            initGSAPAnimations();
            // Re-init magnetic tilt for dynamically created cards
            initMagneticTilt();
        });

        initNameTypingLoop(data.personal.name);
        initRoleTypingLoop(data.personal.role);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}

function setContent(id, content, isHTML = false) {
    const el = document.getElementById(id);
    if (el) el[isHTML ? 'innerHTML' : 'textContent'] = content;
}

function renderPersonal(personal) {
    if (!personal) return;
    setContent('hero-bio', personal.bio);
    setContent('nav-brand', `${personal.name.toUpperCase()}.`);
    const img = document.getElementById('profile-img');
    if (img && personal.profileImage) img.src = personal.profileImage;
    const heroActions = document.getElementById('hero-actions');
    if (heroActions && personal.cvUrl) {
        heroActions.innerHTML = `
            <a href="${personal.cvUrl}" target="_blank" class="px-8 py-5 btn-primary text-dark font-black rounded-2xl flex items-center justify-center shadow-lg">
                DOWNLOAD CV <i class="fas fa-download ml-2 text-sm"></i>
            </a>
            <a href="${personal.cvUrl}" target="_blank" class="px-8 py-5 glass-card text-white font-black rounded-2xl flex items-center justify-center border border-white/10 hover:border-primary/50 transition-all font-heading">
                VIEW FULL CV <i class="fas fa-eye ml-2 text-sm"></i>
            </a>
        `;
    }
}

function renderEducation(edu) {
    const container = document.getElementById('education-container');
    if (container && edu) container.innerHTML = edu.map(e => `<div class="relative reveal-stagger group pl-8 border-l border-white/5 mb-10"><div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"></div><h4 class="font-black text-xl mb-1">${e.degree}</h4><p class="text-primary text-[10px] uppercase font-bold mb-2">${e.institution} • ${e.period}</p><p class="text-slate-400 text-sm font-light">${e.description}</p></div>`).join('');
}

function renderExperience(exp) {
    const container = document.getElementById('experience-container');
    if (container && exp) container.innerHTML = exp.map(e => `<div class="relative reveal-stagger mb-12"><h4 class="font-black text-2xl mb-1">${e.role}</h4><p class="text-secondary text-xs font-bold mb-4 uppercase tracking-widest">${e.company} • ${e.period}</p><p class="text-slate-400 font-light leading-relaxed">${e.description}</p></div>`).join('');
}

function renderSkills(skills) {
    const verticalContainer = document.getElementById('skills-vertical-container');
    const softContainer = document.getElementById('soft-skills-container');

    if (verticalContainer && skills.timeline) {
        verticalContainer.innerHTML = skills.timeline.map((item) => `
            <div class="timeline-item reveal-vertical">
                <div class="timeline-dot-v"></div>
                <div class="timeline-card-v glass-card p-8 rounded-[2rem] hover:border-primary/30 transition-all duration-500">
                    <span class="text-4xl font-black opacity-10 block mb-4 font-heading">${item.year}</span>
                    <h4 class="text-xl font-black mb-3 font-heading tracking-tight">${item.title}</h4>
                    <p class="text-slate-400 mb-6 font-light leading-relaxed text-sm">${item.description}</p>
                    <div class="flex flex-wrap gap-2">
                        ${item.skills.map(s => `<span class="px-3 py-1 bg-white/5 text-slate-300 text-[9px] font-black rounded-full uppercase tracking-widest border border-white/5">${s}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.utils.toArray('.reveal-vertical').forEach((item) => {
                gsap.from(item, {
                    scrollTrigger: { trigger: item, start: 'top 85%', once: true },
                    x: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            });
        }
    }

    if (softContainer && skills.soft) {
        softContainer.innerHTML = skills.soft.map((s, i) => `
            <div class="soft-pill" style="
                animation-delay: ${Math.random() * 2}s; 
                margin-left: ${i % 2 === 0 ? '0px' : '50px'};
                margin-right: ${i % 2 !== 0 ? '0px' : '50px'};
                margin-top: 10px;
                margin-bottom: 10px;
            ">${s.name}</div>
        `).join('');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (container && projects) {
        container.innerHTML = projects.map(p => `
            <div class="project-card-v2 group reveal-stagger magnetic-tilt">
                <img src="${p.image}" alt="${p.title}" class="project-image-bg" loading="lazy">
                
                <div class="project-static-info">
                    <h3 class="text-3xl font-black font-heading tracking-tighter text-white">${p.title}</h3>
                    <p class="project-institute">${p.institute || 'Lovely Professional University'}</p>
                </div>

                <div class="project-hover-reveal">
                    <div class="project-back-content">
                        <div class="tech-pills">
                            ${p.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                        </div>
                        <p class="text-slate-200 mb-6 font-light text-sm leading-relaxed">${p.description}</p>
                        <a href="${p.link}" target="_blank" class="w-fit px-6 py-3 bg-primary text-dark text-[10px] font-black tracking-[0.2em] rounded-xl flex items-center transition-all hover:bg-white">
                            MISSION DETAILS <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderCertificates(certs) {
    const container = document.getElementById('certificates-container');
    if (container && certs) {
        container.innerHTML = certs.map(c => `
            <div class="cert-dossier group reveal-stagger magnetic-tilt">
                <div class="cert-img-container">
                    <img src="${c.image}" alt="${c.title}" loading="lazy">
                </div>
                
                <div class="cert-static-info">
                    <h4 class="font-black text-xl font-heading tracking-tight text-white">${c.title}</h4>
                    <p class="cert-issuer">${c.issuer}</p>
                </div>

                <div class="cert-hover-reveal">
                    <p class="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">${c.date}</p>
                    ${c.verifyUrl ? `
                        <a href="${c.verifyUrl}" target="_blank" class="cert-verify-btn">
                            VERIFY CREDENTIAL <i class="fas fa-external-link-alt ml-2"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (container && testimonials) {
        container.innerHTML = [...testimonials, ...testimonials].map(t => `
            <div class="testimonial-card">
                <div class="flex items-center mb-6">
                    <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">${t.avatar[0]}</div>
                    <div class="ml-4">
                        <h5 class="font-black">${t.name}</h5>
                        <p class="text-primary text-[10px] font-black uppercase">${t.role}</p>
                    </div>
                </div>
                <p class="text-slate-400 italic text-sm font-light leading-relaxed">${t.content}</p>
            </div>
        `).join('');

        if (typeof gsap !== 'undefined') {
            gsap.to('.animate-scroll-testimonials', {
                xPercent: -50,
                repeat: -1,
                duration: 30,
                ease: 'none'
            });
        }
    }
}

function renderContact(c) {
    if (c) {
        setContent('contact-email', c.email);
        setContent('contact-location', c.location);
        setContent('hero-email', c.email);
        setContent('hero-location', c.location);
    }
}

function renderServices(services) {
    const container = document.getElementById('services-container');
    const serviceIconMap = {
        'zap': 'fas fa-bolt', 'code': 'fas fa-code',
        'terminal': 'fas fa-terminal', 'layers': 'fas fa-layer-group',
        'palette': 'fas fa-palette', 'link': 'fas fa-link',
        'shield-check': 'fas fa-shield-alt'
    };
    if (container && services) container.innerHTML = services.map(s => `
        <div class="glass-card p-8 rounded-[2rem] reveal-stagger magnetic-tilt">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <i class="${serviceIconMap[s.icon] || 'fas fa-bolt'}"></i>
            </div>
            <h4 class="text-lg font-black mb-2">${s.title}</h4>
            <p class="text-slate-500 text-xs font-light">${s.description}</p>
        </div>
    `).join('');
}

function renderSocial(social) {
    const heroContainer = document.getElementById('hero-socials');
    const footerContainer = document.getElementById('footer-socials');
    const iconMap = {
        github: "fab fa-github", linkedin: "fab fa-linkedin",
        twitter: "fab fa-twitter", instagram: "fab fa-instagram"
    };

    if (social) {
        const validSocials = social.filter(item => item.url && item.url !== "#");
        const html = validSocials.map(s => `
            <a href="${s.url}" target="_blank" class="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-300 hover:text-primary transition-all border border-white/5 text-xl">
                <i class="${iconMap[s.icon] || 'fas fa-link'}"></i>
            </a>
        `).join('');

        if (heroContainer) heroContainer.innerHTML = html;
        if (footerContainer) footerContainer.innerHTML = html;
    }
}

// ============================================
// CONTACT MODAL
// ============================================
function toggleContactModal(e) {
    if (e) e.stopPropagation();
    const m = document.getElementById('contact-modal');
    if (!m) return;

    const isActive = m.classList.toggle('active');

    if (typeof gsap !== 'undefined') {
        if (isActive) {
            gsap.fromTo('.contact-reveal',
                { y: 15, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)', delay: 0.1 }
            );
        } else {
            gsap.to('.contact-reveal', { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' });
        }
    }
}

// Global Click-to-Close for Contact Popup
document.addEventListener('click', (e) => {
    const m = document.getElementById('contact-modal');
    const content = m?.querySelector('.modal-content');
    const fab = document.getElementById('floating-contact');

    if (m && m.classList.contains('active')) {
        if (content && !content.contains(e.target) && fab && !fab.contains(e.target)) {
            toggleContactModal();
        }
    }
});

// ============================================
// SCROLL TO TOP
// ============================================
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            scrollTopBtn.classList.remove('opacity-0', 'scale-0', 'pointer-events-none');
        } else {
            scrollTopBtn.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
            scrollTopBtn.classList.add('opacity-0', 'scale-0', 'pointer-events-none');
        }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// LIGHTBOX
// ============================================
function openLightbox(s, t) {
    const m = document.getElementById('lightbox-modal');
    if (m) {
        document.getElementById('lightbox-img').src = s;
        document.getElementById('lightbox-title').textContent = t;
        m.classList.remove('hidden');
        m.classList.add('active');
    }
}

function closeLightbox() {
    const m = document.getElementById('lightbox-modal');
    if (m) {
        m.classList.remove('active');
        setTimeout(() => m.classList.add('hidden'), 400);
    }
}

// ============================================
// NAME TYPING LOOP
// ============================================
async function initNameTypingLoop(name) {
    const el = document.getElementById('hero-name');
    if (!el) return;

    const styles = [
        'name-style-tech',
        'name-style-bold',
        'name-style-ghost',
        'name-style-italic'
    ];
    let styleIndex = 0;

    const type = async (text, speed = 120) => {
        for (let i = 0; i <= text.length; i++) {
            el.textContent = text.slice(0, i);
            await new Promise(r => setTimeout(r, speed));
        }
    };

    const backspace = async (speed = 50) => {
        const text = el.textContent;
        for (let i = text.length; i >= 0; i--) {
            el.textContent = text.slice(0, i);
            await new Promise(r => setTimeout(r, speed));
        }
    };

    while (true) {
        el.className = `text-6xl md:text-8xl font-black mb-6 font-heading tracking-tighter leading-none text-gradient ${styles[styleIndex]}`;
        await type(name.toUpperCase(), 120);
        await new Promise(r => setTimeout(r, 2000));
        await backspace(50);
        styleIndex = (styleIndex + 1) % styles.length;
        await new Promise(r => setTimeout(r, 400));
    }
}

// ============================================
// ROLE TYPING LOOP
// ============================================
async function initRoleTypingLoop(role) {
    const el = document.getElementById('hero-role');
    if (!el) return;

    const type = async (text, speed = 80) => {
        for (let i = 0; i <= text.length; i++) {
            el.textContent = text.slice(0, i);
            await new Promise(r => setTimeout(r, speed));
        }
    };

    const backspace = async (speed = 40) => {
        const text = el.textContent;
        for (let i = text.length; i >= 0; i--) {
            el.textContent = text.slice(0, i);
            await new Promise(r => setTimeout(r, speed));
        }
    };

    while (true) {
        await type(role.toUpperCase(), 80);
        await new Promise(r => setTimeout(r, 3000));
        await backspace(40);
        await new Promise(r => setTimeout(r, 800));
    }
}
