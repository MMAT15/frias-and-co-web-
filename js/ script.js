// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  // Helper: throttle function for scroll events
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

  // Navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-list a');

  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('show');
    navToggle.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Close mobile menu
      if (mainNav.classList.contains('show')) {
        mainNav.classList.remove('show');
        navToggle.classList.remove('open');
      }
      // Smooth scroll to section
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          const offset = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
    });
  });

  // ScrollSpy for active nav item
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const navItem = document.querySelector(`.nav-list a[href="#${id}"]`);
      if (navItem) {
        if (entry.isIntersecting) {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));

  // Initialize Swiper galleries
  if (typeof Swiper !== 'undefined') {
    new Swiper('.swiper-novedades', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });
    new Swiper('.swiper-testimonios', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      autoplay: { delay: 5000 }
    });
  }

  // Contact form handling
  const form = document.getElementById('form-contacto');
  const responseBox = document.getElementById('form-respuesta');
  if (form && responseBox) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();
      if (!nombre || !email || !mensaje) {
        responseBox.textContent = 'Por favor completa todos los campos.';
        responseBox.style.color = 'red';
        return;
      }
      responseBox.textContent = `¡Gracias por tu mensaje, ${nombre}! Te contactaremos pronto.`;
      responseBox.style.color = 'green';
      form.reset();
    });
  }

  // Back to top button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', throttle(() => {
      backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    }, 200));
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});