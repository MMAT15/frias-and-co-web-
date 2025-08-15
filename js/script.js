document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js cargado');
// ANNOUNCEMENT BAR (sticky + close with fold animation)
const annBar   = document.querySelector('.announcement-bar');
const annClose = document.querySelector('.ann-close');

if (annBar) {
  const DISMISSED = localStorage.getItem('annBarDismissed') === '1';

  if (!DISMISSED) {
    // hace que el header baje mientras el cartel esté visible
    document.documentElement.classList.add('has-ann');
    annBar.classList.remove('closing');    // por si venís de otra vista
    annBar.style.display = '';             // aseguro que esté visible
  } else {
    annBar.style.display = 'none';
    document.documentElement.classList.remove('has-ann');
  }

  annClose?.addEventListener('click', () => {
    // anima el plegado
    annBar.classList.add('closing');

    // cuando termina la transición, lo sacamos del flujo
    const onEnd = (e) => {
      if (e.propertyName !== 'max-height') return; // esperamos la prop correcta
      annBar.style.display = 'none';
      document.documentElement.classList.remove('has-ann');
      localStorage.setItem('annBarDismissed', '1');
      annBar.removeEventListener('transitionend', onEnd);
    };
    annBar.addEventListener('transitionend', onEnd);
  });
}
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
// COLLECTION MENU (BeraClothing) — animación + bloqueo scroll
const collectionToggle  = document.querySelector('.collection-toggle');
const collectionMenu    = document.getElementById('collection-menu');
const collectionOverlay = document.getElementById('collection-overlay');
const collectionClose   = document.getElementById('collection-close');

if (collectionToggle && collectionMenu && collectionOverlay) {

  const lockScroll   = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = '';       };

  const openMenu  = () => {
    collectionMenu.classList.add('show');
    collectionOverlay.classList.add('show');
    collectionToggle.setAttribute('aria-expanded','true');
    collectionMenu.setAttribute('aria-hidden','false');
    lockScroll();
  };

  const closeMenu = () => {
    collectionMenu.classList.remove('show');
    collectionOverlay.classList.remove('show');
    collectionToggle.setAttribute('aria-expanded','false');
    collectionMenu.setAttribute('aria-hidden','true');
    unlockScroll();
  };

  collectionToggle.addEventListener('click', openMenu);
  collectionClose?.addEventListener('click', closeMenu);
  collectionOverlay.addEventListener('click', closeMenu);
// Navegación desde el menú de Catálogo: si es hash en la misma página, hace scroll;
// si es a otra página (productos.html#seccion), navega y listo.
collectionMenu.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute('href');

  closeMenu(); // cerrar panel siempre

  if (href.startsWith('#')) {
    // mismo documento: scroll suave a la sección
    const target = document.querySelector(href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  } else {
    // otra página (ej: productos.html#remeras)
    window.location.href = href;
  }
});
  /* ESC para cerrar */
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && collectionMenu.classList.contains('show')) closeMenu();
  });

  /* Swipe izquierdo para cerrar */
  let startX;
  collectionMenu.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; });
  collectionMenu.addEventListener('touchend',e=>{
    if(startX!==undefined){
      if(e.changedTouches[0].clientX - startX < -60) closeMenu();
      startX=undefined;
    }
  });
}
  
  /* ---------- PRODUCT MODAL ---------- */
  const productData = {
    'featured-gris': {
      title: 'Prueba Gris',
      price: '$15.400',
      details: 'Talle: Único<br>Tela: Algodón 100%<br>Color: Gris',
      description: 'Gorra color gris de ala curva ideal para looks urbanos.',
      images: [
        'assets/images/Gorra.png',
        'assets/images/Gorra.png',
        'assets/images/Gorra.png'
      ]
    },
    'featured-buzo': {
      title: 'Prueba Buzo',
      price: '$58.200',
      details: 'Talle: S‑XL<br>Tela: Frisa premium 320 g<br>Corte: Oversize',
      description: 'Buzo unisex oversize de frisa suave, ideal para días fríos y estilo urbano.',
      images: [
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png'
      ]
    },
    'featured-over': {
      title: 'Prueba Over',
      price: '$45.500',
      details: 'Talle: 38‑44<br>Tela: Gabardina stretch<br>Bolsillos: Cargo laterales',
      description: 'Pantalón cargo oversize de gabardina elástica con múltiples bolsillos.',
      images: [
        'assets/images/PantalonS.png',
        'assets/images/PantalonS.png',
        'assets/images/PantalonS.png'
      ]
    },
    'featured-shift': {
      title: 'Prueba Shift',
      price: '$34.500',
      details: 'Talle: S‑XL<br>Tela: Algodón peinado 24/1<br>Estampa: Serigrafía eco‑friendly',
      description: 'Remera de algodón premium con estampa frontal, corte regular y costuras reforzadas.',
      images: [
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png'
      ]
    },
    'featured-rosa': {
      title: 'Prueba Rosa',
      price: '$21.200',
      details: 'Talle: Único<br>Tela: Acrílico hipoalergénico<br>Tejido: Punto inglés',
      description: 'Gorro tejido color gris, suave y abrigado, perfecto para el invierno.',
      images: [
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png'
      ]
    },
    'featured-dibujo': {
      title: 'Prueba Dibujo',
      price: '$34.500',
      details: 'Talle: S‑L<br>Tela: Frisa liviana<br>Ilustración: DTG edición limitada',
      description: 'Buzo oversize con ilustración exclusiva impresa mediante DTG de alta calidad.',
      images: [
        'assets/images/BuzoOver.png',
        'assets/images/BuzoOver.png',
        'assets/images/BuzoOver.png'
      ]
    },  /* ← mantiene coma porque hay más elementos */

    'remera-shift': {
      title: 'Remera Shift',
      price: '$15.400',
      details: 'Talle: ‑ <br>Tela: Algodón peinado 24/1<br>Color: gris con letras blancas',
      description: 'Gorra con estampa “BeraClothing”.',
      images: [
        'assets/images/Gorra.png',
        'assets/images/Gorra.png',
        'assets/images/Gorra.png'
      ]
    },
    'remera-dibujo': {
      title: 'Gorro Invierno',
      price: '$21.200',
      details: 'Talle: S‑XL<br>Tela: Algodón 100%<br>Estampa: BeraClothing',
      description: 'Gorro de invierno de algodon con estampa BeraClothing.',
      images: [
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png'
      ]
    },
    'buzo-gris': {
      title: 'Buzo Gris oscuro',
      price: '$58.200',
      details: 'Talle: XL<br>Tela: Frisa premium 320 g<br>Corte: Oversize',
      description: 'Buzo unisex oversize color gris oscuro, interior súper suave para días fríos.',
      images: [
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png'
      ]
    },
    'buzo-over': {
      title: 'Remera Gris s',
      price: '$34.500',
      details: 'Talle: L<br>Tela: French Terry<br>Fit: Oversize relajado',
      description: 'Remera gris S con Estampa.',
      images: [
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png'
      ]
    },
    'pantalon-rosa': {
      title: 'Pantalon Over negro',
      price: '$45.000',
      details: 'Talle: S<br>Tela: Gabardina stretch<br>Corte: Cargo slim',
      description: 'Pantalón cargo negro con bolsillos laterales y cintura elástica.',
      images: [
        'assets/images/PantalonS.png',
        'assets/images/PantalonS.png',
        'assets/images/PantalonS.png'
      ]
    },
    'pantalon-gris': {
      title: 'Pantalón Gris',
      price: '$50.400',
      details: 'Talle: L<br>Tela: Gabardina premium<br>Corte: Recto',
      description: 'Pantalón gris de gabardina con bolsillos profundos y ajuste cómodo.',
      images: [
        'assets/images/BuzoOver.png',
        'assets/images/BuzoOver.png',
        'assets/images/BuzoOver.png'
      ]
    },
    // Shorts y combos nuevos
    'shorts-cuero': {
      title: 'Shorts cuero negro',
      price: '$18.000',
      details: 'Talle: S<br>Tela: Símil cuero<br>Color: Negro',
      description: 'Shorts de símil cuero negro, tiro alto, ideal para looks urbanos y nocturnos.',
      images: ['assets/images/IMG_7221.jpeg']
    },
    'falda-cuero': {
      title: 'Falda cuero negro',
      price: '$17.000',
      details: 'Talle: S<br>Tela: Símil cuero<br>Color: Negro',
      description: 'Falda corta de símil cuero negro, corte clásico, perfecta para combinar.',
      images: ['assets/images/IMG_7222.jpeg']
    },
    'shorts-hebilla': {
      title: 'Shorts negro hebilla',
      price: '$18.500',
      details: 'Talle: S<br>Tela: Símil cuero<br>Detalle: Hebilla metálica',
      description: 'Shorts negro con hebilla decorativa, estilo moderno y versátil.',
      images: ['assets/images/IMG_7223.jpeg']
    },
    'top-halter': {
      title: 'Top halter negro',
      price: '$12.000',
      details: 'Talle: Único<br>Tela: Lycra<br>Color: Negro',
      description: 'Top halter negro, espalda descubierta, ideal para salidas y fiestas.',
      images: ['assets/images/IMG_7224.jpeg']
    },
    'combo-body': {
      title: 'Combo body vino y marrón',
      price: '$22.000',
      details: 'Talle: Único<br>Incluye: Body color vino y body color marrón',
      description: 'Combo de dos bodys: uno color vino y otro marrón, ambos de lycra suave.',
      images: ['assets/images/IMG_7226.jpeg']
    },
    'combo-shorts': {
      title: 'Combo shorts marrón y negro',
      price: '$35.000',
      details: 'Talle: S<br>Incluye: Shorts marrón y shorts negro',
      description: 'Combo de dos shorts: uno marrón y uno negro, ambos en símil cuero.',
      images: ['assets/images/IMG_7227.jpeg']
    },
    'combo-blusa-falda': {
      title: 'Combo blusa transparente negra + falda cuero',
      price: '$32.000',
      details: 'Talle: Único<br>Incluye: Blusa transparente negra y falda de cuero negro',
      description: 'Combo elegante para noche: blusa transparente negra y falda de cuero.',
      images: ['assets/images/IMG_7228.jpeg']
    },
    'combo-halter-shorts': {
      title: 'Combo top halter negro + shorts negro (dos modelos)',
      price: '$29.500',
      details: 'Talle: Único<br>Incluye: Top halter negro y dos modelos de shorts negro',
      description: 'Combo de top halter negro y shorts negro, dos estilos para combinar.',
      images: ['assets/images/IMG_7229.jpeg']
    },
    'combo-body-falda': {
      title: 'Combo body vino y marrón + falda cuero negro',
      price: '$37.000',
      details: 'Talle: Único<br>Incluye: Body vino, body marrón y falda cuero negro',
      description: 'Combo completo: dos bodys y una falda de cuero negro.',
      images: ['assets/images/IMG_7230.jpeg']
    },
    'tops-animal': {
      title: 'Tops manga larga animal print gris y marrón',
      price: '$14.000',
      details: 'Talle: Único<br>Incluye: Top gris y top marrón animal print',
      description: 'Tops manga larga con estampado animal print, colores gris y marrón.',
      images: ['assets/images/IMG_7231.jpeg']
    },
    'body-vino-falda': {
      title: 'Body vino con falda cuero negro',
      price: '$21.000',
      details: 'Talle: Único<br>Incluye: Body color vino y falda cuero negro',
      description: 'Body color vino combinado con falda de cuero negro.',
      images: ['assets/images/IMG_7232.jpeg']
    }
  };

  const productModal      = document.getElementById('product-modal');
  const galleryWrapper    = document.getElementById('product-gallery-wrapper');
  const modalTitle        = document.getElementById('product-modal-title');
  const modalPrice        = document.getElementById('product-modal-price');
  const modalDescription  = document.getElementById('product-modal-description');
  const modalCloseBtn     = document.querySelector('.product-modal-close');

  if (productModal) {
    let lastOpener = null;
    // Override buttons to open modal
    document.querySelectorAll('.view-product-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        lastOpener = btn;
        openProductModal(btn.dataset.id);
      });
    });

    function openProductModal(id) {
      const data = productData[id];
      if (!data) return;
      modalTitle.textContent = data.title;
      modalPrice.textContent = data.price;
      modalDescription.innerHTML = `
  <p>${data.details}</p>
  <p>${data.description}</p>
`;
      galleryWrapper.innerHTML = '';
      data.images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${src}" alt="${data.title}" loading="lazy">`;
        galleryWrapper.appendChild(slide);
      });

      // init / update Swiper
      if (window.productGallerySwiper) {
        window.productGallerySwiper.update();
        window.productGallerySwiper.slideTo(0);
      } else if (typeof Swiper !== 'undefined') {
        window.productGallerySwiper = new Swiper('.product-gallery', {
          pagination: { el: '.product-gallery .swiper-pagination', clickable: true },
          navigation: {
            nextEl: '.product-gallery .swiper-button-next',
            prevEl: '.product-gallery .swiper-button-prev'
          },
          loop: true
        });
      }

      productModal.classList.add('show');
      productModal.setAttribute('aria-hidden','false');
      // Focus management for accessibility
      const previouslyFocused = document.activeElement;
      productModal.dataset.prevFocus = previouslyFocused && previouslyFocused instanceof HTMLElement ? (previouslyFocused.className || previouslyFocused.id || previouslyFocused.tagName) : '';
      const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = productModal.querySelectorAll(focusableSelectors);
      const firstFocusable = focusables[0];
      if (firstFocusable) firstFocusable.focus();

      const trap = (e) => {
        if (!productModal.classList.contains('show') || e.key !== 'Tab') return;
        const focusable = productModal.querySelectorAll(focusableSelectors);
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      productModal._trapFocus = trap;
      productModal.addEventListener('keydown', trap);
      productModal.dataset.trap = '1';
    }

    function closeProductModal() {
      // restore focus and remove trap
      if (productModal.dataset.trap && productModal._trapFocus) {
        productModal.removeEventListener('keydown', productModal._trapFocus);
        delete productModal._trapFocus;
        delete productModal.dataset.trap;
      }
      productModal.classList.remove('show');
      productModal.setAttribute('aria-hidden','true');
      if (lastOpener) {
        lastOpener.focus();
      }
    }

    modalCloseBtn?.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', e => {
      if (e.target === productModal) closeProductModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && productModal.classList.contains('show')) {
        closeProductModal();
      }
    });
  }

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        if (mainNav && navToggle && mainNav.classList.contains('show')) {
          mainNav.classList.remove('show');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // BACK TO TOP
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', throttle(() => {
      backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    }, 200));
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Header shadow on scroll
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', throttle(() => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 50);
    }, 100));
  }

  // LAZY ANIMATIONS
  const animItems = document.querySelectorAll('.animate-on-scroll');
  if (animItems.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animItems.forEach(item => observer.observe(item));
  }

  // SCROLLSPY
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
        if (link) {
          link.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    sections.forEach(sec => spyObserver.observe(sec));
  }

  // SWIPER CAROUSELS
  if (typeof Swiper !== 'undefined') {
    // Hero
    new Swiper('.swiper-hero .swiper-container', {
      loop: true, speed: 800, effect: 'fade',
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-hero .swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-hero .swiper-button-next',
        prevEl: '.swiper-hero .swiper-button-prev'
      }
    });
    // Others
    document.querySelectorAll('.swiper-container').forEach(container => {
      if (container.closest('.swiper-hero')) return;
      const config = { loop: true, speed: 600,
        pagination: { el: container.querySelector('.swiper-pagination'), clickable: true }
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
      const { nombre, email, asunto, mensaje } = contactForm;
      if (!nombre.value.trim() || !email.value.trim() || !asunto.value.trim() || !mensaje.value.trim()) {
        contactResp.textContent = 'Por favor completa todos los campos.';
        contactResp.style.color = 'red';
      } else {
        contactResp.textContent = `¡Gracias, ${nombre.value.trim()}! Hemos recibido tu mensaje.`;
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
      const emailVal = newsletterForm['email-newsletter'].value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!valid) {
        newsletterResp.textContent = 'Ingresa un correo válido.';
        newsletterResp.style.color = 'red';
      } else {
        newsletterResp.textContent = '¡Suscripción exitosa! Gracias.';
        newsletterResp.style.color = 'green';
        newsletterForm.reset();
      }
    });
  }

  // PRODUCTS FILTERING & SORTING
  const allProductItems = Array.from(document.querySelectorAll('.producto-item'));
  const filterTipo  = document.getElementById('filter-tipo');
  const filterTalle = document.getElementById('filter-talle');
  const sortBy      = document.getElementById('sort-by');
// Secciones de categoría y contenedor para "sin resultados"
const categorySections = Array.from(document.querySelectorAll('.product-category'));
const productosMain = document.querySelector('.productos-main'); // ajusta si tu contenedor es otro
let emptyStateEl;
  const typeToSection = {
    remera: 'remeras',
    top: 'tops',
    camisa: 'camisas',
    short: 'shorts',
    pantalon: 'pantalones',
    buzo: 'buzos',
    set: 'sets',
    abrigo: 'abrigos',
    vestido: 'vestidos'
  };

  function applyFilters() {
  const tipoVal  = filterTipo ? filterTipo.value : '';
  const talleVal = filterTalle ? filterTalle.value : '';

  // 1) Mostrar/ocultar CADA producto según los filtros
  allProductItems.forEach(item => {
    const match =
      (!tipoVal  || item.dataset.tipo  === tipoVal) &&
      (!talleVal || item.dataset.talle === talleVal);
    item.style.display = match ? '' : 'none';
  });

  // 2) Ordenar los visibles (como ya hacías)
  applySorting();

  // 3) Ocultar secciones sin productos visibles
  categorySections.forEach(sec => {
    const visibles = Array
      .from(sec.querySelectorAll('.producto-item'))
      .filter(el => el.style.display !== 'none').length;
    sec.classList.toggle('is-hidden', visibles === 0);
  });

  // 4) Mensaje "sin resultados" si TODO quedó vacío
  const anyVisible = allProductItems.some(el => el.style.display !== 'none');
  if (!anyVisible) {
    if (!emptyStateEl) {
      emptyStateEl = document.createElement('p');
      emptyStateEl.className = 'empty-state';
      emptyStateEl.textContent = 'No encontramos productos con esos filtros.';
      productosMain?.prepend(emptyStateEl);
    }
  } else if (emptyStateEl) {
    emptyStateEl.remove();
    emptyStateEl = null;
  }

  // 5) Si eligió un tipo, desplazate a su sección (y ya está oculta cualquier otra)
  if (tipoVal && typeToSection[tipoVal]) {
    const targetSec = document.getElementById(typeToSection[tipoVal]);
    if (targetSec && !targetSec.classList.contains('is-hidden')) {
      const offset = targetSec.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }
}

  function applySorting() {
    if (!sortBy) return;
    const sortVal = sortBy.value;

    // Only price sorting for now; "relevancia" keeps natural order
    if (sortVal === 'precio-asc' || sortVal === 'precio-desc') {
      document.querySelectorAll('.grid-products').forEach(grid => {
        const visible = Array.from(grid.children).filter(
          c => c.classList.contains('producto-item') && c.style.display !== 'none'
        );
        visible.sort((a, b) => {
          const pa = parseFloat(a.dataset.price) || 0;
          const pb = parseFloat(b.dataset.price) || 0;
          return sortVal === 'precio-asc' ? pa - pb : pb - pa;
        });
        visible.forEach(el => grid.appendChild(el));
      });
    }
  }

  // Attach listeners
  [filterTipo, filterTalle].forEach(sel => {
    if (sel) sel.addEventListener('change', applyFilters);
  });
  if (sortBy) sortBy.addEventListener('change', applySorting);

  // Initial run
  applyFilters();

  // SHOPPING CART & MODAL
  let cart = [];
  try {
    const raw = localStorage.getItem('cart');
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (_) {
    cart = [];
  }
  const cartCount = document.querySelector('.cart-count');
  const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
  const addToCart = prod => {
    const ex = cart.find(i => i.id === prod.id);
    if (ex) {
      ex.qty = Math.min(ex.qty + 1, 10);   // límite 10
    } else {
      cart.push({ ...prod, qty: 1 });
    }
    saveCart(); updateCartCount();
  };
  document.querySelectorAll('.add-to-cart-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      // Read price from data attribute
      let price = Number(btn.dataset.price);
      // Fallback: parse from DOM text, removing thousand separators and handling decimals
      const priceEl = btn.closest('.producto-item')?.querySelector('.price') ||
                      btn.closest('.product-item')?.querySelector('.price');
      if (priceEl) {
        let text = priceEl.textContent.trim();
        // Remove currency symbols, spaces
        text = text.replace(/[^0-9.,]/g, '');
        // Remove thousand separators (dots), convert comma to dot for decimals
        text = text.replace(/\./g, '').replace(/,/g, '.');
        const domPrice = parseFloat(text) || 0;
        // If data-price is not a valid number or mismatched, use domPrice
        if (isNaN(price) || price !== domPrice) {
          price = domPrice;
        }
      }
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: price || 0
      };
      addToCart(product);
      showCartToast();
      openCartPanel?.();
    });
  });

  /* --------------------------------------------------
   Floating Cart references
-------------------------------------------------- */
const cartFab          = document.getElementById('cart-fab');
const cartCounterFab   = cartFab?.querySelector('[data-count]');
const cartTotalFab     = cartFab?.querySelector('[data-total]');
const cartPanelElm     = document.getElementById('cart-panel');
const cartOverlayElm   = document.getElementById('cart-overlay');
const cartItemsList    = cartPanelElm?.querySelector('[data-items]');
const cartTotalFinalEl = document.getElementById('cart-total') 
                      || cartPanelElm?.querySelector('[data-total-final]');
const cartCloseFab     = cartPanelElm?.querySelector('.cart-close');

/* --------------------------------------------------
   Update counters & totals (reemplaza la función vieja)
-------------------------------------------------- */
const updateCartCount = () => {
  const totalItems = cart.reduce((sum,i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum,i) => sum + i.qty * i.price, 0);

  if (cartCount)       cartCount.textContent        = totalItems;
  if (cartCounterFab)  cartCounterFab.textContent   = totalItems;
  if (cartTotalFab)    cartTotalFab.textContent     = '$' + totalPrice.toLocaleString('es-AR');
  // actualiza todos los elementos con data-total-final
  document.querySelectorAll('[data-total-final]').forEach(el => {
    el.textContent = '$' + totalPrice.toLocaleString('es-AR');
  });

  if (cartPanelElm?.classList.contains('show')) renderCartPanel();
};
// Inicializa contadores + total al cargar
updateCartCount();

/* --------------------------------------------------
   Floating Cart Panel Logic
-------------------------------------------------- */
const lockScroll   = () => { document.body.style.overflow = 'hidden'; };
const unlockScroll = () => { document.body.style.overflow = '';       };

function renderCartPanel() {
  if (!cartItemsList) return;
  cartItemsList.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.id = item.id;
  li.innerHTML = `
  <span class="name">${item.name}</span>
  <div class="qty-stepper">
    <button class="qty-dec" aria-label="Menos">−</button>
    <input type="number" class="qty" min="1" max="10" value="${item.qty}" data-qty>
    <button class="qty-inc" aria-label="Más">+</button>
  </div>
  <span class="price" data-price>$${(item.price * item.qty).toLocaleString('es-AR')}</span>
  <button class="remove" aria-label="Quitar">×</button>
`;
    cartItemsList.appendChild(li);
  });

  // Qty + remove events
  cartItemsList.querySelectorAll('[data-qty]').forEach(input => {
    input.addEventListener('change', () => {
     const id  = input.closest('.cart-item').dataset.id;
const raw = parseInt(input.value, 10) || 1;
const qty = Math.max(1, Math.min(10, raw));
input.value = qty;          // fuerza valor válido
updateItemQty(id, qty);
refreshStepperState();
    });
  });
  // Botones + / -
cartItemsList.querySelectorAll('.qty-inc').forEach(btn => {
  btn.addEventListener('click', () => {
    changeQty(btn.closest('.cart-item').dataset.id, +1);
  });
});
cartItemsList.querySelectorAll('.qty-dec').forEach(btn => {
  btn.addEventListener('click', () => {
    changeQty(btn.closest('.cart-item').dataset.id, -1);
  });
});

// Habilita / deshabilita flechas según límites
function refreshStepperState() {
  cartItemsList.querySelectorAll('.cart-item').forEach(li => {
    const item = cart.find(i => i.id === li.dataset.id);
    if (!item) return;
    li.querySelector('.qty-dec').disabled = item.qty <= 1;
    li.querySelector('.qty-inc').disabled = item.qty >= 10;
  });
}
refreshStepperState();
  cartItemsList.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeItem(btn.closest('.cart-item').dataset.id);
    });
  });
}
// Cambia cantidad con delta (+1 / -1)
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const newQty = Math.max(1, Math.min(10, item.qty + delta));
  if (newQty !== item.qty) {
    item.qty = newQty;
    saveCart(); updateCartCount();
    if (typeof refreshStepperState === 'function') refreshStepperState();
  }
}
function updateItemQty(id, qty) {
  qty = Math.max(1, Math.min(10, qty));   // 1‑10 allowed
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = qty;
  saveCart(); updateCartCount();
}
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartCount();
}

function openCartPanel() {
  if (!cartPanelElm) return;
  renderCartPanel();
  cartPanelElm.classList.remove('hidden');
  cartPanelElm.classList.add('show');
  cartOverlayElm?.classList.remove('hidden');
  cartOverlayElm?.classList.add('show');
  lockScroll();
  updateCartCount();   // refresca total dentro del panel
}
function closeCartPanel() {
  if (!cartPanelElm) return;
  cartPanelElm.classList.add('hidden');
  cartPanelElm.classList.remove('show');
  cartOverlayElm?.classList.add('hidden');
  cartOverlayElm?.classList.remove('show');
  unlockScroll();
}

// Event bindings
cartFab?.addEventListener('click', openCartPanel);
cartCloseFab?.addEventListener('click', closeCartPanel);
cartOverlayElm?.addEventListener('click', closeCartPanel);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartPanelElm?.classList.contains('show')) closeCartPanel();
});
let startX;
cartPanelElm?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
cartPanelElm?.addEventListener('touchend',   e => {
  if (startX !== undefined && e.changedTouches[0].clientX - startX < -60) closeCartPanel();
  startX = undefined;
});

  // Cart modal
  const cartToggleBtn = document.querySelector('.cart-toggle');
  const cartModalElm = document.getElementById('cart-modal');
  const closeCartBtn  = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  if (cartToggleBtn && cartModalElm && closeCartBtn) {
    cartToggleBtn.addEventListener('click', e => {
      e.preventDefault();
      renderCartPage();
      cartModalElm.classList.remove('hidden');
      cartToggleBtn.classList.add('open');
    });
    closeCartBtn.addEventListener('click', () => {
      cartModalElm.classList.add('hidden');
      cartToggleBtn.classList.remove('open');
    });
    cartModalElm.addEventListener('click', e => {
      if (e.target === cartModalElm) {
        cartModalElm.classList.add('hidden');
        cartToggleBtn.classList.remove('open');
      }
    });
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        cartModalElm.classList.add('hidden');
        cartToggleBtn.classList.remove('open');
        window.location.href = 'finalizarcompra.html';
      });
    }
  }

  function renderCartPage() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      const line = item.price * item.qty;
      total += line;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <span>${item.name} x${item.qty}</span>
          <span>$${line.toFixed(2)}</span>
        </div>
        <button class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.name}">&times;</button>
      `;
      cartItemsContainer.appendChild(row);
    });
    if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
    cartItemsContainer.querySelectorAll('.remove-item').forEach(btn =>
      btn.addEventListener('click', () => {
        cart = cart.filter(i=>i.id!==btn.dataset.id);
        saveCart(); updateCartCount(); renderCartPage();
      })
    );
  }

  // CHECKOUT PAGE FUNCTIONALITY (temporarily disabled to restore core features)
  /*
  if (document.getElementById('checkout-items')) {
    const PAYMENT_TAX_RATE = 0.21;
    const zipInput = document.getElementById('zip-input');
    const shippingContainer = document.getElementById('shipping-methods');
    const shippingConfigs = [
      {
        name: 'gratis-local',
        range: zip=>/^(1884|1878|1882|1900|1901|1902|1903|1904)$/.test(zip),
        standard:{cost:0,days:'1–2 días'},
        express:{cost:300,days:'mismo día'}
      },
      {
        name:'gba',
        range:zip=>/^[17-19]\d{2}$/.test(zip),
        standard:{cost:500,days:'2–4 días'},
        express:{cost:900,days:'1–2 días'}
      },
      {
        name:'caba',
        range:zip=>/^1[0-4]\d{2}$/.test(zip),
        standard:{cost:600,days:'2–3 días'},
        express:{cost:1000,days:'1 día'}
      },
      {
        name:'centro',
        range:zip=>/^[2-3]\d{3}$/.test(zip),
        standard:{cost:800,days:'4–6 días'},
        express:{cost:1200,days:'2–3 días'}
      },
      {
        name:'resto',
        range:zip=>true,
        standard:{cost:1000,days:'6–10 días'},
        express:{cost:1500,days:'3–5 días'}
      }
    ];

    function updateShippingOptions() {
      if (!zipInput||!shippingContainer) return;
      const zip = zipInput.value.trim();
      const cfg = shippingConfigs.find(c=>c.range(zip))||shippingConfigs[4];
      const radios = shippingContainer.querySelectorAll('input[name="shipping"]');
      radios.forEach(radio=>{
        const type = radio.value==='envio-standard'?'standard':'express';
        radio.dataset.cost = cfg[type].cost;
        const lbl = radio.closest('label');
        lbl.textContent = `${radio.nextSibling.textContent.split('–')[0].trim()} – ${cfg[type].days} – $${cfg[type].cost}`;
        lbl.prepend(radio);
      });
      calculateCheckout();
    }

    function calculateCheckout() {
      checkoutItemsTbody.innerHTML = '';
      let net=0, tax=0, gross=0;
      cart.forEach(it=>{
        const grossLine=it.price*it.qty;
        const netLine=grossLine/(1+PAYMENT_TAX_RATE);
        const taxLine=grossLine-netLine;
        net+=netLine; tax+=taxLine; gross+=grossLine;
        const tr=document.createElement('tr');
        tr.innerHTML=`
          <td>${it.name}</td><td>${it.qty}</td><td>$${it.price.toFixed(2)}</td><td>$${grossLine.toFixed(2)}</td>
        `;
        checkoutItemsTbody.appendChild(tr);
      });
      let ship=0;
      shippingContainer.querySelectorAll('input[name="shipping"]').forEach(r=>{
        if(r.checked)ship=parseFloat(r.dataset.cost)||0;
      });
      const total=gross+ship;
      summarySubtotal.textContent=`$${net.toFixed(2)}`;
      summaryTax.textContent=`$${tax.toFixed(2)}`;
      summaryShipping.textContent=`$${ship.toFixed(2)}`;
      summaryTotal.textContent=`$${total.toFixed(2)}`;
    }

    const checkoutItemsTbody=document.getElementById('checkout-items');
    const summarySubtotal=document.getElementById('summary-subtotal');
    const summaryTax=document.getElementById('summary-tax');
    const summaryShipping=document.getElementById('summary-shipping');
    const summaryTotal=document.getElementById('summary-total');
    const shippingRadios=document.querySelectorAll('input[name="shipping"]');

    shippingRadios.forEach(r=>r.addEventListener('change',calculateCheckout));
    zipInput.addEventListener('change',updateShippingOptions);
    zipInput.addEventListener('input',updateShippingOptions);

    updateShippingOptions();
  }
  */

});
          // Marca el item activo según la URL en TODAS las navs (desktop + off-canvas)
(function setActiveNav() {
  // nombre de archivo actual (index.html si viene vacío)
  let current = location.pathname.split('/').pop() || 'index.html';

  // normalizaciones y typos comunes
  const lc = current.toLowerCase();
  if (lc === '' || lc === '/') current = 'index.html';
  if (lc.includes('newst')) current = 'newsletter.html'; // "newsteller" -> newsletter

  // quita activos previos y marca el correcto
  document.querySelectorAll('#primary-navigation a, .collection-menu a').forEach(a => {
    a.classList.remove('active');
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === current) a.classList.add('active');
  });
})();
function showCartToast(msg = 'Producto agregado al carrito') {
  const t = document.createElement('div');
  t.className = 'cart-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('hide'), 1400);
  setTimeout(() => t.remove(), 1800);
} 
// ===== Header & Menu search (global) =====
document.addEventListener('DOMContentLoaded', () => {
  const handleSubmit = (form, inputSelector) => {
    form.addEventListener('submit', () => {
      const input = form.querySelector(inputSelector);
      const q = (input?.value || '').trim();
      form.action = q ? `productos.html?q=${encodeURIComponent(q)}` : 'productos.html';

      // Si es el buscador del menú, cerramos el off‑canvas al enviar
      if (form.classList.contains('menu-search')) {
        const nav = document.getElementById('primary-navigation');
        const toggle = document.querySelector('.nav-toggle');
        if (nav && toggle && nav.classList.contains('show')) {
          nav.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  };

  // Header search (desktop / global)
  document.querySelectorAll('form.header-search:not(.header-search-desktop)')
    .forEach(f => handleSubmit(f, '.header-search-input'));

  // Menu search (dentro del menú hamburguesa)
  document.querySelectorAll('form.menu-search')
    .forEach(f => handleSubmit(f, '.menu-search-input'));

  // Prefill cuando llegás a productos.html?q=...
  if (window.location.pathname.endsWith('productos.html')) {
    const q = new URLSearchParams(location.search).get('q') || '';
    if (q) {
      document.querySelectorAll('.header-search-input, .menu-search-input')
        .forEach(inp => inp.value = q);
    }
  }
});
// ==== Desktop Search Controller (single source of truth) ====
(() => {
  if (window.__beraSearchWired) return;  // evita múltiples bindings
  window.__beraSearchWired = true;

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.header-search-toggle');
  const form   = document.querySelector('form.header-search-desktop');
  const input  = form?.querySelector('.header-search-input');
  const btn    = form?.querySelector('.header-search-btn');
  const mq     = window.matchMedia('(min-width: 769px)');

  function isOpen(){ return header?.classList.contains('search-open'); }
  function openSearch(){ header?.classList.add('search-open'); input?.focus(); }
  function closeSearch(){ header?.classList.remove('search-open'); }

  // 1) Click en la lupita: abre/cierra (no busca)
  toggle?.addEventListener('click', (e) => {
    if (!mq.matches) return; // en mobile no hace nada
    e.preventDefault();
    isOpen() ? closeSearch() : openSearch();
  });

  // 2) Cerrar con click fuera
  document.addEventListener('click', (e) => {
    if (!mq.matches || !isOpen()) return;
    const clickDentroForm = form?.contains(e.target);
    const clickEnToggle   = toggle?.contains(e.target);
    if (!clickDentroForm && !clickEnToggle) closeSearch();
  });

  // 3) Cerrar con Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  // 4) Enviar: SOLO si hay texto (si está vacío, enfoca y NO navega)
  form?.addEventListener('submit', (e) => {
    const q = (input?.value || '').trim();
    if (!q) { e.preventDefault(); input?.focus(); return; }
    form.action = `productos.html?q=${encodeURIComponent(q)}`;
  });
  btn?.addEventListener('click', (e) => {
    const q = (input?.value || '').trim();
    if (!q) { e.preventDefault(); input?.focus(); }
  });

  // 5) Si pasa a mobile, cerrar búsqueda si estaba abierta
  mq.addEventListener?.('change', (ev) => { if (!ev.matches) closeSearch(); });
})();

// ==== Patch: ruteo consistente para los demás buscadores (header simple / menú) ====
(function(){
  document.querySelectorAll('form.header-search, form.menu-search').forEach((form) => {
    form.addEventListener('submit', () => {
      const inp = form.querySelector('input[name="q"], .header-search-input, .menu-search-input');
      const q = (inp?.value || '').trim();
      // en desktop header-search-desktop lo maneja el bloque de arriba
      if (form.classList.contains('header-search-desktop')) return;
      form.action = q ? `productos.html?q=${encodeURIComponent(q)}` : 'productos.html';
    });
  });
})();
// Lock/unlock scroll cuando se abre/cierra el menú mobile
(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav   = document.querySelector('.main-nav');
  if (!navToggle || !mainNav) return;

  const lock   = () => document.body.style.overflow = 'hidden';
  const unlock = () => document.body.style.overflow = '';

  const sync = () => mainNav.classList.contains('show') ? lock() : unlock();
  // ya tenés el click que hace toggle; acá solo sincronizo
  navToggle.addEventListener('click', sync);

  // cerrar por tap fuera del panel
  document.addEventListener('click', (e) => {
    if (!mainNav.classList.contains('show')) return;
    const inside = mainNav.contains(e.target) || navToggle.contains(e.target);
    if (!inside){ mainNav.classList.remove('show'); navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); unlock(); }
  });

  // cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('show')){
      mainNav.classList.remove('show');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      unlock();
    }
  });
})();