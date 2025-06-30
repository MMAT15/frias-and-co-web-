// js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // Throttle helper
  function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= wait) {
        fn.apply(this, args);
        last = now;
      }
    };
  }

  // NAVIGATION TOGGLE
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('show');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open);
    });
  }

  // SMOOTH SCROLL FOR IN-PAGE LINKS
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        // close mobile nav if open
        if (mainNav.classList.contains('show')) {
          mainNav.classList.remove('show');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // BACK TO TOP BUTTON
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', throttle(() => {
      backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    }, 200));
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // LAZY ANIMATION ON SCROLL
  const animItems = document.querySelectorAll('.animate-on-scroll');
  if (animItems.length) {
    const animObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animItems.forEach(item => animObserver.observe(item));
  }

  // SCROLLSPY (only if nav links to in-page sections exist)
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const navLink = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
        if (navLink) {
          navLink.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    sections.forEach(sec => spyObserver.observe(sec));
  }

  // INITIALIZE ALL SWIPER CAROUSELS
  // HERO CAROUSEL
  new Swiper('.swiper-hero .swiper-container', {
    loop: true,
    speed: 800,
    effect: 'fade',
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: {
      el: '.swiper-hero .swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-hero .swiper-button-next',
      prevEl: '.swiper-hero .swiper-button-prev'
    }
  });
  if (typeof Swiper !== 'undefined') {
    document.querySelectorAll('.swiper-container').forEach(container => {
      // Skip hero carousel to avoid reinitialization
      if (container.closest('.swiper-hero')) return;
      // default config
      const config = {
        loop: true,
        speed: 600,
        pagination: { el: container.querySelector('.swiper-pagination'), clickable: true },
      };
      if (container.classList.contains('swiper-novedades') || container.classList.contains('swiper-featured')) {
        config.navigation = {
          nextEl: container.querySelector('.swiper-button-next'),
          prevEl: container.querySelector('.swiper-button-prev')
        };
      }
      if (container.classList.contains('swiper-testimonios')) {
        config.autoplay = { delay: 5000 };
      }
      new Swiper(container, config);
    });
  }

  // CONTACT FORM
  const contactForm = document.getElementById('form-contacto');
  const contactResp = document.getElementById('form-respuesta');
  if (contactForm && contactResp) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = contactForm.nombre.value.trim();
      const email = contactForm.email.value.trim();
      const asunto = contactForm.asunto ? contactForm.asunto.value.trim() : '';
      const mensaje = contactForm.mensaje.value.trim();
      if (!nombre || !email || !asunto || !mensaje) {
        contactResp.textContent = 'Por favor completa todos los campos.';
        contactResp.style.color = 'red';
      } else {
        contactResp.textContent = `¡Gracias, ${nombre}! Hemos recibido tu mensaje sobre "${asunto}".`;
        contactResp.style.color = 'green';
        contactForm.reset();
      }
    });
  }

  // NEWSLETTER FORM
  const newsletterForm = document.getElementById('form-newsletter');
  const newsletterResp = document.getElementById('newsletter-response');
  if (newsletterForm && newsletterResp) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailField = newsletterForm['email-newsletter'];
      const emailVal = emailField.value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!validEmail) {
        newsletterResp.textContent = 'Ingresa un correo válido.';
        newsletterResp.style.color = 'red';
      } else {
        newsletterResp.textContent = '¡Suscripción exitosa! Gracias.';
        newsletterResp.style.color = 'green';
        newsletterForm.reset();
      }
    });
  }
});