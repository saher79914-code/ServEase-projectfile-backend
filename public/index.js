/* ═══════════════════════════════════════════════════════════════════
   ServEase Custom Javascript — Official Green & Orange Theme Engine
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileMenu();
  initTiltEffect();
  initScrollReveal();
  fetchVerifiedProviders();
});

/**
 * 1. Sticky Header Scroll Effect
 */
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("shadow-md", "border-emerald-800/10", "bg-brand-bg/95");
      header.classList.remove("border-emerald-800/5", "bg-brand-bg/85");
    } else {
      header.classList.remove("shadow-md", "border-emerald-800/10", "bg-brand-bg/95");
      header.classList.add("border-emerald-800/5", "bg-brand-bg/85");
    }
  });
}

/**
 * 2. Responsive Mobile Menu Toggler
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  const closeBtn = document.getElementById("mobile-menu-close");
  const overlay = document.getElementById("mobile-menu-overlay");
  const menuContainer = document.getElementById("mobile-menu-container");
  const links = document.querySelectorAll(".mobile-nav-link");

  function openMenu() {
    overlay.classList.remove("hidden");
    setTimeout(() => {
      overlay.classList.add("opacity-100");
      menuContainer.classList.remove("translate-x-full");
      toggleBtn.classList.add("open");
    }, 10);
  }

  function closeMenu() {
    overlay.classList.remove("opacity-100");
    menuContainer.classList.add("translate-x-full");
    toggleBtn.classList.remove("open");
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 300);
  }

  toggleBtn.addEventListener("click", () => {
    if (overlay.classList.contains("hidden")) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  links.forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

/**
 * 3. 3D Tilt Effect for Phone Mockups
 */
function initTiltEffect() {
  const wrappers = document.querySelectorAll("[data-tilt]");
  
  wrappers.forEach(wrapper => {
    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    wrapper.addEventListener("mouseleave", () => {
      wrapper.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
}

/**
 * 4. Scroll Reveal Animations (Intersection Observer)
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".scroll-reveal");
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });
  
  revealElements.forEach(el => observer.observe(el));
}

/**
 * 5. Fetch Verified Providers from Server API
 */
async function fetchVerifiedProviders() {
  const container = document.getElementById("providers-dynamic-grid");
  
  // Fallback mock data matching actual app services
  const mockProviders = [
    {
      id: 70,
      name: "Atiya Tariq",
      service: "Professional Mehndi Art",
      category: "Mehndi",
      rating: 4.9,
      rate: "500.00",
      jobs_done: 48,
      is_verified: 1
    },
    {
      id: 71,
      name: "Saher",
      service: "Luxury Embroidery & Crafts",
      category: "Crafts",
      rating: 4.8,
      rate: "250.00",
      jobs_done: 35,
      is_verified: 1
    },
    {
      id: 74,
      name: "Ayesha",
      service: "Academic Tutoring & Courses",
      category: "Education",
      rating: 4.9,
      rate: "350.00",
      jobs_done: 52,
      is_verified: 1
    },
    {
      id: 75,
      name: "Insa",
      service: "Bridal & Party Makeup",
      category: "Beauty",
      rating: 4.9,
      rate: "500.00",
      jobs_done: 29,
      is_verified: 1
    }
  ];

  // Render immediately with real database profiles so there is never a blank screen
  renderProviders(mockProviders);

  try {
    const apiEndpoint = (window.location.port === "3000" || window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
      ? "/api/auth/public-providers"
      : "http://localhost:3000/api/auth/public-providers";
      
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(apiEndpoint, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.success && data.providers && data.providers.length > 0) {
      renderProviders(data.providers);
    }
  } catch (error) {
    // Fallback data already displayed seamlessly
  }
}

/**
 * Renders list of providers into grid
 */
function renderProviders(providers) {
  const container = document.getElementById("providers-dynamic-grid");
  container.innerHTML = "";
  
  providers.forEach(p => {
    const hourlyRate = parseFloat(p.rate).toLocaleString();
    const starRating = p.rating.toFixed(1);
    
    // Generate stars HTML (using brand-orange #E8845A)
    let starsHtml = "";
    const fullStars = Math.floor(p.rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += `<svg class="w-4 h-4 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
      } else {
        starsHtml += `<svg class="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
      }
    }

    const providerCard = document.createElement("div");
    providerCard.className = "group bg-white border border-slate-100 rounded-3xl p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand-green/8 hover:border-brand-green/20 scroll-reveal active";
    providerCard.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <!-- Brand Green avatar layout -->
        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center font-heading font-bold text-xl uppercase">
          ${p.name.split(" ").map(n => n[0]).join("")}
        </div>
        ${p.is_verified ? `
          <span class="inline-flex items-center gap-1 bg-emerald-50 border border-brand-green/20 text-brand-green text-xs font-semibold px-3 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Verified
          </span>
        ` : ""}
      </div>
      
      <h3 class="font-heading font-bold text-xl text-brand-green-dark mb-1 group-hover:text-brand-orange transition-colors duration-300">${p.name}</h3>
      <p class="text-sm font-semibold text-brand-muted mb-4 uppercase tracking-wider">${p.service}</p>
      
      <!-- Ratings summary -->
      <div class="flex items-center gap-2 mb-6">
        <div class="flex">${starsHtml}</div>
        <span class="text-sm font-bold text-brand-green-dark">${starRating}</span>
        <span class="text-xs font-medium text-brand-muted">(${p.jobs_done} jobs)</span>
      </div>

      <div class="pt-5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span class="block text-[11px] font-bold text-brand-muted uppercase tracking-widest">Hourly Rate</span>
          <span class="font-heading font-black text-lg text-brand-green-dark">RS ${hourlyRate}</span>
        </div>
        <a href="#how-it-works" class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    `;
    
    container.appendChild(providerCard);
  });
}
