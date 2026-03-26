document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Fetch and populate data
    fetchData();

    // Hero Entry Animation
    setTimeout(() => {
        const heroContent = document.getElementById('hero-content');
        heroContent.classList.remove('opacity-0', 'translate-y-10');
    }, 100);

    // Floating Navbar scroll effect
    const navPill = document.getElementById('nav-pill');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navPill.classList.add('py-2', 'px-6', 'bg-dark/90', 'border-primary/20');
            navPill.classList.remove('py-3', 'px-8', 'border-white/10');
        } else {
            navPill.classList.add('py-3', 'px-8', 'border-white/10');
            navPill.classList.remove('py-2', 'px-6', 'bg-dark/90', 'border-primary/20');
        }
    });

    // Mouse Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        document.body.style.overflow = '';
    };

    closeMenuBtn.addEventListener('click', closeMenu);
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Initial check for elements that need reveal
    window.addEventListener('load', () => {
        refreshReveals();
    });
});

async function fetchData() {
    if (typeof portfolioData !== 'undefined') {
        const data = portfolioData;
        console.log("Portfolio Data detected, initiating secure render...");
        
        const renderTasks = [
            { name: 'Personal', fn: () => renderPersonal(data.personal) },
            { name: 'Education', fn: () => renderEducation(data.education) },
            { name: 'Experience', fn: () => renderExperience(data.experience) },
            { name: 'Skills', fn: () => renderSkills(data.skills) },
            { name: 'Services', fn: () => renderServices(data.services) },
            { name: 'Projects', fn: () => renderProjects(data.projects) },
            { name: 'Certificates', fn: () => renderCertificates(data.certificates) },
            { name: 'Testimonials', fn: () => renderTestimonials(data.testimonials) },
            { name: 'Contact', fn: () => renderContact(data.contact) },
            { name: 'Social', fn: () => renderSocial(data.personal.social) }
        ];

        renderTasks.forEach(task => {
            try {
                task.fn();
                console.log(`Successfully rendered: ${task.name}`);
            } catch (err) {
                console.warn(`Failed to render ${task.name}:`, err.message);
            }
        });

        // Re-initialize for dynamic content
        refreshIcons();
        refreshReveals();
        initTilt();
    } else {
        console.error('CRITICAL: portfolioData variable not found in data.js scope.');
    }
}

// Helper for safe DOM updates
function setContent(id, content, isHTML = false) {
    const el = document.getElementById(id);
    if (el) {
        if (isHTML) el.innerHTML = content;
        else el.textContent = content;
        return true;
    }
    return false;
}

function initTilt() {
    document.querySelectorAll('.glass-card:not(.project-card)').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.03)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
        });
    });
}

function renderPersonal(personal) {
    if (!personal) return;
    document.title = `${personal.name} | Portfolio`;
    
    setContent('hero-name', personal.name.toUpperCase());
    setContent('hero-role', personal.role.toUpperCase());
    setContent('hero-bio', personal.bio);
    setContent('nav-brand', `${personal.name.toUpperCase()}.`);
    setContent('about-text', personal.bio);
    
    const profileImg = document.getElementById('profile-img');
    if (profileImg && personal.profileImage) {
        profileImg.src = personal.profileImage;
    }

    if (personal.cvUrl) {
        const heroActions = document.getElementById('hero-actions');
        if (heroActions && !document.getElementById('cv-button')) {
            const cvBtn = document.createElement('a');
            cvBtn.id = 'cv-button';
            cvBtn.href = personal.cvUrl;
            cvBtn.target = '_blank';
            cvBtn.className = 'px-8 py-5 btn-primary text-dark font-black rounded-2xl hover:scale-105 transition-all text-center flex items-center justify-center shadow-lg';
            cvBtn.innerHTML = `DOWNLOAD CV <i data-lucide="download" class="ml-2 w-4 h-4"></i>`;
            heroActions.appendChild(cvBtn);
            
            const previewBtn = document.createElement('a');
            previewBtn.href = personal.cvUrl;
            previewBtn.target = '_blank';
            previewBtn.className = 'px-6 py-2 glass-card text-xs font-black tracking-widest text-slate-300 hover:text-white transition-all uppercase rounded-xl border border-white/5';
            previewBtn.textContent = 'Preview CV';
            heroActions.appendChild(previewBtn);
            
            lucide.createIcons();
        }
    }
}

function renderEducation(education) {
    if (!education) return;
    const html = education.map(edu => `
        <div class="relative reveal group">
            <div class="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-dark border-2 border-primary shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform z-10"></div>
            <h4 class="font-black text-xl mb-1 font-heading group-hover:text-primary transition-colors text-white">${edu.degree}</h4>
            <div class="flex items-center text-primary text-[10px] font-black tracking-widest uppercase mb-4 opacity-80">
                <span>${edu.institution}</span>
                <span class="mx-2 opacity-30">•</span>
                <span>${edu.period}</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed font-light">${edu.description}</p>
        </div>
    `).join('');
    setContent('education-container', html, true);
}

function renderExperience(experience) {
    if (!experience) return;
    const html = experience.map(exp => `
        <div class="relative reveal">
            <div class="absolute -left-[54px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
            <h4 class="font-black text-2xl mb-1 font-heading tracking-tight">${exp.role}</h4>
            <div class="text-secondary text-xs font-bold mb-4 tracking-wide">${exp.company} • ${exp.period}</div>
            <p class="text-slate-400 leading-relaxed font-light">${exp.description}</p>
        </div>
    `).join('');
    setContent('experience-container', html, true);
}

function renderSkills(skills) {
    if (!skills) return;
    if (skills.timeline) {
        const timelineHtml = skills.timeline.map((item, index) => `
            <div class="timeline-item flex-shrink-0 flex flex-col items-center">
                <div class="timeline-card glass-card p-8 rounded-[2rem] border border-white/5 reveal group hover:border-primary/30 transition-all duration-500">
                    <div class="flex items-center justify-between mb-6">
                        <span class="text-4xl font-black text-white/10 group-hover:text-primary/20 transition-colors font-heading leading-none">${item.year}</span>
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <i data-lucide="award"></i>
                        </div>
                    </div>
                    <h4 class="text-xl font-black mb-3 font-heading tracking-tight">${item.title}</h4>
                    <p class="text-slate-500 text-xs mb-6 font-light leading-relaxed">${item.description}</p>
                    <div class="flex flex-wrap gap-2">
                        ${item.skills.map(s => `<span class="px-3 py-1 bg-white/5 text-slate-300 text-[9px] font-bold rounded-full uppercase tracking-widest border border-white/5">${s}</span>`).join('')}
                    </div>
                </div>
                <div class="timeline-dot-container hidden lg:block h-24 relative w-px">
                    <div class="timeline-dot"></div>
                </div>
            </div>
        `).join('');
        setContent('skills-timeline-container', timelineHtml, true);
    }

    if (skills.soft) {
        const softHtml = skills.soft.map(skill => `
            <div class="glass-card p-4 rounded-xl flex flex-col items-center text-center group cursor-default border border-white/5 reveal">
                <div class="w-1.5 h-1.5 rounded-full bg-primary/40 mb-3 group-hover:scale-150 group-hover:bg-primary transition-all"></div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">${skill.name}</span>
            </div>
        `).join('');
        setContent('soft-skills-container', softHtml, true);
    }
}

function renderProjects(projects) {
    if (!projects) return;
    const html = projects.map(project => `
        <div class="glass-card project-card rounded-[2.5rem] overflow-hidden group border border-white/5 reveal">
            <div class="h-72 overflow-hidden relative">
                <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                <div class="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent"></div>
                <div class="absolute bottom-6 left-8 flex flex-wrap gap-2">
                    ${project.tech.map(t => `<span class="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/10">${t}</span>`).join('')}
                </div>
            </div>
            <div class="p-10">
                <h3 class="text-3xl font-black mb-4 font-heading tracking-tighter group-hover:text-primary transition-colors">${project.title}</h3>
                <p class="text-slate-400 mb-8 font-light leading-relaxed line-clamp-2">${project.description}</p>
                <div class="flex items-center space-x-6">
                    <a href="${project.link}" target="_blank" class="inline-flex items-center text-[10px] font-black tracking-[0.2em] text-white hover:text-primary transition-colors uppercase">
                        LIVE DEMO <i data-lucide="external-link" class="ml-2 w-4 h-4 text-primary"></i>
                    </a>
                    <a href="${project.link}" target="_blank" class="inline-flex items-center text-[10px] font-black tracking-[0.2em] text-slate-500 hover:text-white transition-colors uppercase">
                        VIEW CODE <i data-lucide="github" class="ml-2 w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
    setContent('projects-container', html, true);
}

function renderCertificates(certificates) {
    if (!certificates) return;
    const html = certificates.map(cert => `
        <div class="glass-card p-8 rounded-3xl border border-white/5 reveal group relative flex flex-col h-full">
            <div class="h-48 rounded-2xl overflow-hidden mb-8 relative border border-white/5 bg-slate-900 cursor-pointer" onclick="openLightbox('${cert.image}', '${cert.title}', '${cert.issuer}')">
                <img src="${cert.image}" alt="${cert.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100">
                <div class="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-12 h-12 glass rounded-full flex items-center justify-center text-primary">
                        <i data-lucide="zoom-in"></i>
                    </div>
                </div>
            </div>
            <h4 class="font-black text-xl mb-2 font-heading tracking-tight group-hover:text-primary transition-colors">${cert.title}</h4>
            <p class="text-slate-500 text-xs font-bold mb-6">${cert.issuer.toUpperCase()} • ${cert.date}</p>
            <div class="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center cursor-pointer hover:text-white transition-colors" onclick="openLightbox('${cert.image}', '${cert.title}', '${cert.issuer}')">
                    PREVIEW <i data-lucide="maximize-2" class="ml-2 w-3 h-3"></i>
                </span>
                ${cert.verifyUrl ? `
                <a href="${cert.verifyUrl}" target="_blank" class="text-[10px] font-black text-primary hover:text-emerald-400 transition-colors tracking-[0.2em] uppercase flex items-center">
                    VERIFY LINK <i data-lucide="external-link" class="ml-2 w-3 h-3"></i>
                </a>` : ''}
            </div>
        </div>
    `).join('');
    setContent('certificates-container', html, true);
}

function renderContact(contact) {
    if (!contact) return;
    setContent('contact-email', contact.email);
    setContent('contact-location', contact.location);
}

function renderSocial(social) {
    if (!social) return;
    const html = social.map(s => `
        <a href="${s.url}" class="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-slate-500 hover:text-primary hover:-translate-y-2 transition-all border border-white/5">
            <i data-lucide="${s.icon}" class="w-5 h-5"></i>
        </a>
    `).join('');
    setContent('social-links', html, true);
}

function renderServices(services) {
    if (!services) return;
    const html = services.map(service => `
        <div class="glass-card p-8 rounded-[2rem] border border-white/5 reveal group hover:bg-white/5 transition-all duration-500">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-dark transition-all">
                <i data-lucide="${service.icon}" class="w-5 h-5"></i>
            </div>
            <h4 class="text-lg font-black mb-3 font-heading tracking-tight">${service.title}</h4>
            <p class="text-slate-500 text-xs font-light leading-relaxed">${service.description}</p>
        </div>
    `).join('');
    setContent('services-container', html, true);
}

function renderTestimonials(testimonials) {
    if (!testimonials) return;
    const list = [...testimonials, ...testimonials];
    const html = list.map(t => `
        <div class="glass-card p-10 rounded-[2.5rem] border border-white/5 w-[400px] flex-shrink-0">
            <div class="flex items-center mb-8">
                <div class="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-primary/20 flex items-center justify-center bg-primary/10 text-primary font-black text-xl">
                    ${t.avatar.length === 1 ? t.avatar : `<img src="${t.avatar}" alt="${t.name}" class="w-full h-full object-cover">`}
                </div>
                <div>
                    <h5 class="font-black text-white">${t.name}</h5>
                    <p class="text-primary text-[10px] font-black uppercase tracking-widest">${t.role}</p>
                </div>
            </div>
            <p class="text-slate-400 italic font-light leading-relaxed">"${t.content}"</p>
        </div>
    `).join('');
    setContent('testimonials-container', html, true);
}

// Contact Modal Logic
function toggleContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 400);
    }
}

// Lightbox Logic
function openLightbox(imgSrc, title, issuer) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const issuerEl = document.getElementById('lightbox-issuer');

    if (modal && img && titleEl && issuerEl) {
        img.src = imgSrc;
        titleEl.textContent = title;
        issuerEl.textContent = issuer;
        
        modal.classList.remove('hidden');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 400);
        document.body.style.overflow = '';
    }
}

// Mouse Interactions
document.addEventListener('mousemove', (e) => {
    // Mouse Glow
    const glow = document.getElementById('mouse-glow');
    if (glow) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
    }

    // Grid Mask Movement
    document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
});

document.addEventListener('mouseleave', () => {
    const glow = document.getElementById('mouse-glow');
    if (glow) glow.style.opacity = '0';
});

// Staggered Reveal Logic
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Staggering effect for peer elements
            const siblings = Array.from(entry.target.parentElement.children);
            const delay = siblings.indexOf(entry.target) * 20;
            
            setTimeout(() => {
                entry.target.classList.add('active');
            }, delay);
        }
    });
}, observerOptions);

function refreshReveals() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Ensure icons are re-processed
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
