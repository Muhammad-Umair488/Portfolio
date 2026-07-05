/* ===========================
   CIRCULAR FAVICON
   =========================== */
(function () {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = 'profile-pic.png';
  img.onload = function () {
    // Clip to circle
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, 64, 64);

    // Purple border ring
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Set as favicon
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
  };
})();

/* ===========================
   NAVBAR SCROLL EFFECT
   =========================== */
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // header glass effect
  header.classList.toggle('scrolled', scrollY > 30);

  // back to top visibility
  backToTop.classList.toggle('visible', scrollY > 400);

  // active nav link
  updateActiveNavLink();
});

/* ===========================
   ACTIVE NAV LINK ON SCROLL
   =========================== */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/* ===========================
   MOBILE HAMBURGER MENU
   =========================== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close on nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ===========================
   BACK TO TOP
   =========================== */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===========================
   COUNTER ANIMATION
   =========================== */
function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const isFloat = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = ease * target;

    el.textContent = isFloat ? value.toFixed(1) : Math.round(value);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ===========================
   SCROLL REVEAL + COUNTERS
   =========================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Counter observer (triggers once hero stats are visible)
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

/* ===========================
   PORTFOLIO FILTER
   =========================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    portfolioItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const show = filter === 'all' || category === filter;

      if (show) {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        item.style.display = 'block';
        setTimeout(() => {
          item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 50);
      } else {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => { item.style.display = 'none'; }, 350);
      }
    });
  });
});

/* ===========================
   TESTIMONIALS SLIDER
   =========================== */
const track = document.getElementById('testimonialsTrack');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer = null;
  const total = cards.length;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function getVisibleCount() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function goTo(index) {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);
    current = Math.max(0, Math.min(index, maxIndex));

    const cardWidth = cards[0].offsetWidth;
    const gap = 24;
    const offset = current * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function autoPlay() {
    autoTimer = setInterval(() => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, total - visible);
      goTo(current >= maxIndex ? 0 : current + 1);
    }, 4000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoPlay();
  }

  autoPlay();

  window.addEventListener('resize', () => goTo(0));
}

/* ===========================
   FAQ ACCORDION
   =========================== */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    // Open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

/* ===========================
   CONTACT FORM HANDLING
   =========================== */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Button loading state
    submitBtn.innerHTML = '<span>Sending...</span><i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        formSuccess.classList.add('show');
        submitBtn.innerHTML = '<span>Message Sent!</span><i class="fa-solid fa-check"></i>';
        submitBtn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';

        setTimeout(() => {
          formSuccess.classList.remove('show');
          submitBtn.innerHTML = '<span>Send Message</span><i class="fa-solid fa-paper-plane"></i>';
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      // Fallback: mailto
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const mailto = `mailto:umairsocialmediaspecialist@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      window.location.href = mailto;

      submitBtn.innerHTML = '<span>Send Message</span><i class="fa-solid fa-paper-plane"></i>';
      submitBtn.disabled = false;
    }
  });
}

/* ===========================
   SMOOTH ANCHOR LINKS
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===========================
   INIT
   =========================== */
// Open first FAQ by default
const firstFaq = document.querySelector('.faq-item');
if (firstFaq) firstFaq.classList.add('open');

console.log('%c Muhammad Umair Portfolio ', 'background:#6c63ff;color:#fff;font-size:14px;padding:6px 12px;border-radius:4px;font-weight:bold;');
console.log('%c Built with ❤️ for growth ', 'color:#8b9bc8;font-size:12px;');
