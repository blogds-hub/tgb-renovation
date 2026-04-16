// ─── Keywords hover — background image swap ──────────────────────────────────
const kwBg = document.querySelector('.keywords-bg');
if (kwBg) {
  document.querySelectorAll('.kw-word').forEach(word => {
    word.addEventListener('mouseenter', () => {
      kwBg.style.backgroundImage = `url('${word.dataset.bg}')`;
    });
  });
}

// ─── Hero crossfade ───────────────────────────────────────────────────────────
const heroFadeImgs = document.querySelectorAll('.hero-fade-img');
if (heroFadeImgs.length > 1) {
  let heroCurrent = 0;
  setInterval(() => {
    heroFadeImgs[heroCurrent].classList.remove('is-active');
    heroCurrent = (heroCurrent + 1) % heroFadeImgs.length;
    heroFadeImgs[heroCurrent].classList.add('is-active');
  }, 4000);
}

// ─── Locomotive Scroll — init après chargement complet ───────────────────────
const locoScroll = new LocomotiveScroll({
  el: document.querySelector('#scroll-container'),
  smooth: true,
  smoothMobile: false,
  multiplier: 0.9,
  lerp: 0.08,
  smartphone: { smooth: false },
  tablet: { smooth: false },
});

// ─── Reveal on scroll (via Locomotive) ───────────────────────────────────────

// Utilise l'IntersectionObserver sur le vrai DOM (Locomotive transforme les positions)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-inview');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Ancres smooth via Locomotive ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) locoScroll.scrollTo(target, { offset: -80, duration: 1200 });
  });
});

// ─── Counter animation ────────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counters = document.querySelectorAll('.stat-num [data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ─── Mise à jour Locomotive après resize et chargement des images ─────────────
window.addEventListener('resize', () => locoScroll.update());

// Recalcul une fois toutes les images lazy chargées
const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
let loaded = 0;
lazyImgs.forEach(img => {
  if (img.complete) {
    loaded++;
    if (loaded === lazyImgs.length) locoScroll.update();
  } else {
    img.addEventListener('load', () => {
      loaded++;
      if (loaded === lazyImgs.length) locoScroll.update();
    }, { once: true });
  }
});

// ─── Pills services — affichage texte au clic ────────────────────────────────
document.querySelectorAll('.svc-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const block = pill.closest('.svc-pills-block');
    block.querySelectorAll('.svc-pill').forEach(p => p.classList.remove('is-active'));
    block.querySelectorAll('.svc-pill-panel').forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    document.getElementById(pill.dataset.panel).classList.add('is-active');
  });
});

// ─── Galeries services — autoplay 2s + clic vignettes ────────────────────────
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const imgs   = gallery.querySelectorAll('.svc-gallery-img');
  const thumbs = gallery.querySelectorAll('.svc-gallery-thumb');
  let current  = 0;
  let timer;

  function goTo(index) {
    imgs[current].classList.remove('is-active');
    thumbs[current].classList.remove('is-active');
    current = (index + imgs.length) % imgs.length;
    imgs[current].classList.add('is-active');
    thumbs[current].classList.add('is-active');
  }

  function startAutoplay() {
    timer = setInterval(() => goTo(current + 1), 2000);
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startAutoplay();
    });
  });

  startAutoplay();
});

// ─── Form devis — soumission AJAX (Formspree) ─────────────────────────────────
const devisForm = document.getElementById('devis-form');
if (devisForm) {
  devisForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!devisForm.checkValidity()) {
      devisForm.reportValidity();
      return;
    }

    const btn = document.getElementById('form-btn');
    const status = document.getElementById('form-status');
    const originalHTML = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = 'Envoi en cours…';
    status.className = 'form-status';
    status.textContent = '';

    try {
      const data = new FormData(devisForm);
      const res = await fetch(devisForm.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        status.className = 'form-status form-status--ok';
        status.textContent = '✓ Votre demande a bien été envoyée. Nous vous recontactons sous 24h ouvrées.';
        devisForm.reset();
        locoScroll.update();
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Erreur serveur');
      }
    } catch (err) {
      status.className = 'form-status form-status--err';
      status.textContent = `Une erreur est survenue (${err.message}). Veuillez réessayer ou nous appeler directement.`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
}

// ─── Accordéon svc-card (mobile uniquement) ───────────────────────────────────
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('click', () => {
    if (window.innerWidth > 768) return;
    card.classList.toggle('is-open');
  });
});

// ─── Nav scroll compact (mobile) ─────────────────────────────────────────────
const navEl = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.innerWidth <= 768) {
    navEl.classList.toggle('is-scrolled', window.scrollY > 40);
  }
}, { passive: true });

// ─── Accordéon zones d'intervention (mobile) ─────────────────────────────────
document.querySelectorAll('.zones-area').forEach(area => {
  area.addEventListener('click', () => {
    if (window.innerWidth > 640) return;
    area.classList.toggle('is-open');
  });
});

// ─── Lightbox galerie réalisations ────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
});

// ─── Mobile menu ──────────────────────────────────────────────────────────────
const burger = document.querySelector('.nav-burger');
const mobileMenu = document.getElementById('nav-mobile');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fermeture au clic sur un lien
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}
