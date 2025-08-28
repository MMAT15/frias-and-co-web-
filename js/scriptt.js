/* ===========================
   1) BOOT GUARD (poner al principio del fichero)
   =========================== */
if (window.__beraBooted) {
  // Ya inicializado, no volvemos a cablear eventos
} else {
  window.__beraBooted = true;

  document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js cargado');

    /* ===========================
       3) THROTTLE HELPER (único en todo el archivo)
       =========================== */
    const throttle = (fn, wait = 100) => {
      let last = 0;
      let t;
      return function throttled(...args) {
        const now = Date.now();
        const remaining = wait - (now - last);
        if (remaining <= 0) {
          last = now;
          fn.apply(this, args);
        } else {
          clearTimeout(t);
          t = setTimeout(() => {
            last = Date.now();
            fn.apply(this, args);
          }, remaining);
        }
      };
    };

    /* ===========================
       2) ANNOUNCEMENT BAR (sticky + close con animación + compensación automática)
       - Usa la CSS var --ann-h para desplazar header/scroll.
       - Recuerda cierre en localStorage.
       =========================== */
    const annBar   = document.querySelector('.announcement-bar');
  const annClose = document.querySelector('.ann-close');

    const setAnnHeightVar = () => {
      // Lee altura real (hasta max-height actual) y la vuelca a --ann-h
      const h = annBar && getComputedStyle(annBar).display !== 'none'
        ? Math.ceil(annBar.getBoundingClientRect().height)
        : 0;
      document.documentElement.style.setProperty('--ann-h', h + 'px');
      document.documentElement.classList.toggle('has-ann', h > 0);
    };

    if (annBar) {
      // Siempre visible al cargar (no persistimos cierre entre recargas)
      annBar.classList.remove('closing');
      annBar.style.display = '';
      // Asegura que el bar sea sticky vía CSS. Si no lo tenés, podés añadir:
      // .announcement-bar{ position: sticky; top: 0; z-index: 50; }

      // Ajusta var al cargar y al redimensionar
      setAnnHeightVar();
      window.addEventListener('resize', throttle(setAnnHeightVar, 120), { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setAnnHeightVar()).catch(()=>{});
      }
      if (window.visualViewport && window.visualViewport.addEventListener) {
        window.visualViewport.addEventListener('resize', throttle(setAnnHeightVar, 120), { passive: true });
      }
      window.addEventListener('orientationchange', () => setAnnHeightVar(), { passive: true });
      window.addEventListener('load', () => setAnnHeightVar(), { passive: true });

      /* === Altura real del header → CSS var --hdr-h (estable en mobile) === */
      const headerEl = document.querySelector('.site-header');
      function setHeaderHeightVar(){
        const h = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--hdr-h', h + 'px');
      }
      // Medición inicial + corrección tras pintura y carga de fuentes
      setHeaderHeightVar();
      requestAnimationFrame(() => setHeaderHeightVar());
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setHeaderHeightVar()).catch(()=>{});
      }
      // Recalcular en cambios de viewport típicos de mobile Safari (barra de URL)
      if (window.visualViewport && window.visualViewport.addEventListener) {
        window.visualViewport.addEventListener('resize', throttle(setHeaderHeightVar, 120), { passive: true });
      }
      window.addEventListener('orientationchange', () => setHeaderHeightVar(), { passive: true });
      window.addEventListener('load', () => setHeaderHeightVar(), { passive: true });
      window.addEventListener('resize', throttle(() => setHeaderHeightVar(), 120), { passive: true });
      annClose?.addEventListener('click', () => {
        // Anima plegado (usa transición de max-height + overflow:hidden en CSS)
        annBar.classList.add('closing');
        const onEnd = (e) => {
          if (e.propertyName !== 'max-height') return;
          annBar.style.display = 'none';
          setAnnHeightVar();
          annBar.removeEventListener('transitionend', onEnd);
        };
        annBar.addEventListener('transitionend', onEnd);
      });
    }

// === Helper para bloquear el foco del contenido principal cuando hay modales ===
function setAppInert(on){
  const main = document.getElementById('main-content') || document.querySelector('main');
  if (!main) return;
  if (on) main.setAttribute('inert',''); else main.removeAttribute('inert');
}
    /* ===========================
       NAVIGATION TOGGLE (accesible) + lock/unlock scroll + cierres
       =========================== */
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav   = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
      // Asegura atributos ARIA
      if (!navToggle.getAttribute('aria-controls')) {
        // Usa id existente o inyecta uno
        if (!mainNav.id) mainNav.id = 'primary-navigation';
        navToggle.setAttribute('aria-controls', mainNav.id);
      }
      navToggle.setAttribute('aria-expanded', 'false');

      const lock   = () => document.body.style.overflow = 'hidden';
      const unlock = () => document.body.style.overflow = '';

      const openMenu = () => {
        mainNav.classList.add('show');
        navToggle.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        lock();
      };
      const closeMenu = () => {
        mainNav.classList.remove('show');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        unlock();
      };

      navToggle.addEventListener('click', () => {
        mainNav.classList.contains('show') ? closeMenu() : openMenu();
      });

      // Cerrar por click fuera
      document.addEventListener('click', (e) => {
        if (!mainNav.classList.contains('show')) return;
        const inside = mainNav.contains(e.target) || navToggle.contains(e.target);
        if (!inside) closeMenu();
      });

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav.classList.contains('show')) closeMenu();
      });
    }

    /* ===========================
       COLLECTION MENU (tu panel lateral) — sin cambios de lógica, con cierres + lock/unlock
       =========================== */
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

      // Navegación del menú de colecciones (misma página: solo scroll; otras páginas: navegar)
      collectionMenu.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;

        const href = a.getAttribute('href') || '';

        // Caso 1: ancla dentro de la misma página ("#seccion"): no filtrar, solo mostrar todo y scrollear
        if (href.startsWith('#')) {
          e.preventDefault();

          // Resetear búsqueda y filtros para que no desaparezcan secciones
          clearSearch('catalog-hash');
          if (typeof filterTipo  !== 'undefined' && filterTipo)  filterTipo.value  = '';
          if (typeof filterTalle !== 'undefined' && filterTalle) filterTalle.value = '';
          try {
            localStorage.removeItem(LS_KEYS.tipo);
            localStorage.removeItem(LS_KEYS.talle);
          } catch(_) {}

          // Reaplicar mostrando todo y actualizar URL (sin ?tipo/?talle)
          applyFiltersWrapped();
          updateURLParams();

          // Cerrar panel y hacer scroll a la sección
          closeMenu();
          const target = document.querySelector(href);
          if (target) {
            const top = typeof computeOffsetTop === 'function' ? computeOffsetTop(target) : (target.getBoundingClientRect().top + window.scrollY - 60);
            window.scrollTo({ top, behavior: 'smooth' });
          }
          return;
        }

        // Caso 2: enlaces que van a productos.html (desde otras páginas) → cerrar y permitir la navegación por defecto
        if (href.includes('productos.html') || href.startsWith('productos')) {
          closeMenu();
          return; // no preventDefault → el navegador navega
        }

        // Caso 3: cualquier otra página/URL absoluta → cerrar y permitir navegación
        if (/^[a-z]+:\/\//i.test(href) || href.endsWith('.html')) {
          closeMenu();
          return;
        }
      });

      document.addEventListener('keydown', e=>{
        if(e.key==='Escape' && collectionMenu.classList.contains('show')) closeMenu();
      });
      let startX;
      collectionMenu.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; }, {passive:true});
      collectionMenu.addEventListener('touchend',e=>{
        if(startX!==undefined){
          if(e.changedTouches[0].clientX - startX < -60) closeMenu();
          startX=undefined;
        }
      }, {passive:true});
    }

    /* ===========================
       4) SMOOTH SCROLL con offset (header + --ann-h)
       - Cierra menú mobile si estaba abierto
       =========================== */
    function readAnnH() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--ann-h').trim();
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }
    function headerHeight() {
      const h = document.querySelector('.site-header');
      return h ? Math.ceil(h.getBoundingClientRect().height) : 0;
    }
    function computeOffsetTop(el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, y - (headerHeight() + readAnnH()));
    }

    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
      link.addEventListener('click', e => {
        const sel = link.getAttribute('href');
        const target = document.querySelector(sel);
        if (!target) return;
        e.preventDefault();
        // cierra mainNav si estaba abierto
        if (mainNav && navToggle && mainNav.classList.contains('show')) {
          mainNav.classList.remove('show');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = ''; // unlock
        }
        window.scrollTo({ top: computeOffsetTop(target), behavior: 'smooth' });
      });
    });

    // Categorías del nav superior: limpiar búsqueda y aplicar tipo
    const topNav = document.querySelector('.nav-list');
    if (topNav) {
      topNav.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href') || '';

        // Sólo actuamos si apunta a productos o a un hash de categoría
        if (href.includes('productos') || href.startsWith('#')) {
          clearSearch('topnav-click');

          let nextTipo = '';
          try {
            if (href.includes('?')) {
              const u = new URL(href, location.origin);
              nextTipo = (u.searchParams.get('tipo') || '').trim();
            } else if (href.startsWith('#')) {
              nextTipo = sectionToType[href.slice(1)] || '';
            }
          } catch (_) {}

          if (nextTipo && filterTipo) filterTipo.value = nextTipo;

          applyFiltersWrapped();
          updateURLParams();
        }
      });
    }

    /* ===========================
       5) BÚSQUEDA DESKTOP MEJORADA
       - Toggle en la lupa
       - Cierre fuera/Escape
       - Atajo "/" (si no estás tipear en un input/textarea/contenteditable)
       - Enviar solo si hay texto
       =========================== */
    (() => {
      if (window.__beraSearchWired) return;  // evita múltiples bindings
      window.__beraSearchWired = true;

      const header = document.querySelector('.site-header');
      const toggle = document.querySelector('.header-search-toggle');
      const form   = document.querySelector('form.header-search-desktop');
      const input  = form?.querySelector('.header-search-input');
      const btn    = form?.querySelector('.header-search-btn');
      const mq     = window.matchMedia('(min-width: 769px)');

      const isOpen = () => header?.classList.contains('search-open');
      const openSearch  = () => { header?.classList.add('search-open'); input?.focus(); };
      const closeSearch = () => { header?.classList.remove('search-open'); };

      // Click en la lupa
      toggle?.addEventListener('click', (e) => {
        if (!mq.matches) return;
        e.preventDefault();
        isOpen() ? closeSearch() : openSearch();
      });

      // Click fuera
      document.addEventListener('click', (e) => {
        if (!mq.matches || !isOpen()) return;
        const insideForm = form?.contains(e.target);
        const onToggle   = toggle?.contains(e.target);
        if (!insideForm && !onToggle) closeSearch();
      });

      // Escape
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

      // Submit solo con texto
      form?.addEventListener('submit', (e) => {
        const q = (input?.value || '').trim();
        if (!q) { e.preventDefault(); input?.focus(); return; }
        form.action = `productos.html?q=${encodeURIComponent(q)}`;
      });
      btn?.addEventListener('click', (e) => {
        const q = (input?.value || '').trim();
        if (!q) { e.preventDefault(); input?.focus(); }
      });

      // Cierra si pasa a mobile
      mq.addEventListener?.('change', (ev) => { if (!ev.matches) closeSearch(); });

      // Atajo "/" para abrir
      document.addEventListener('keydown', (e) => {
        if (e.key !== '/') return;
        const el = document.activeElement;
        const typing = el && (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable
        );
        if (typing) return;
        if (!mq.matches) return;
        e.preventDefault();
        openSearch();
      });
    })();

    // Ruteo consistente para buscadores simples (header/menu no-desktop)
    (function(){
      const handleSubmit = (form, inputSelector) => {
        form.addEventListener('submit', (e) => {
          const input = form.querySelector(inputSelector);
          const q = (input?.value || '').trim();
          form.action = q ? `productos.html?q=${encodeURIComponent(q)}` : 'productos.html';
          // Si es el buscador del menú, cerramos el off‑canvas al enviar
          if (form.classList.contains('menu-search')) {
            const nav = document.getElementById('primary-navigation') || document.querySelector('.main-nav');
            const toggle = document.querySelector('.nav-toggle');
            if (nav && toggle && nav.classList.contains('show')) {
              nav.classList.remove('show');
              toggle.setAttribute('aria-expanded', 'false');
              document.body.style.overflow = '';
            }
          }
        });
      };
      document.querySelectorAll('form.header-search:not(.header-search-desktop)').forEach(f => handleSubmit(f, '.header-search-input'));
      document.querySelectorAll('form.menu-search').forEach(f => handleSubmit(f, '.menu-search-input'));
    })();

    /* ---------- PRODUCT MODAL (SIN CAMBIOS DE LÓGICA) ---------- */
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
      },

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
setAppInert(true);
        productModal.classList.add('show');
        productModal.setAttribute('aria-hidden','false');
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
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        };
        productModal._trapFocus = trap;
        productModal.addEventListener('keydown', trap);
        productModal.dataset.trap = '1';
      }

      function closeProductModal() {
        if (productModal.dataset.trap && productModal._trapFocus) {
          productModal.removeEventListener('keydown', productModal._trapFocus);
          delete productModal._trapFocus;
          delete productModal.dataset.trap;
        }
        setAppInert(false);
        productModal.classList.remove('show');
        productModal.setAttribute('aria-hidden','true');
        // Restaurar foco si fuera necesario
      }

      modalCloseBtn?.addEventListener('click', closeProductModal);
      productModal.addEventListener('click', e => { if (e.target === productModal) closeProductModal(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && productModal.classList.contains('show')) closeProductModal(); });
    }

    /* ===========================
       7) SCROLL LISTENERS OPTIMIZADOS (passive:true)
       =========================== */

    // BACK TO TOP
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', throttle(() => {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
      }, 200), { passive: true });
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Header shadow on scroll
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      window.addEventListener('scroll', throttle(() => {
        siteHeader.classList.toggle('scrolled', window.scrollY > 50);
      }, 100), { passive: true });
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

    // SWIPER CAROUSELS (sin cambios)
    if (typeof Swiper !== 'undefined') {
      new Swiper('.swiper-hero .swiper-container', {
        loop: true, speed: 800, effect: 'fade',
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-hero .swiper-pagination', clickable: true },
        navigation: {
          nextEl: '.swiper-hero .swiper-button-next',
          prevEl: '.swiper-hero .swiper-button-prev'
        }
      });
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

    // CONTACT FORM (igual)
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

    // NEWSLETTER FORM (validación en español + mensajes propios)
const newsletterForm = document.getElementById('form-newsletter');
const newsletterResp = document.getElementById('newsletter-response');
if (newsletterForm) {
  const emailInput = newsletterForm.querySelector('input[type="email"], #email-newsletter, [name="email-newsletter"]');
  newsletterForm.setAttribute('novalidate', 'novalidate');

  const setMsg = (msg, ok=false) => {
    if (!newsletterResp) return;
    newsletterResp.textContent = msg;
    newsletterResp.style.color = ok ? 'green' : 'red';
  };

  emailInput?.addEventListener('input', () => { emailInput.setCustomValidity(''); });

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailInput?.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email) { setMsg('Ingresá tu correo electrónico.'); emailInput?.focus(); return; }
    if (!valid) { setMsg('El formato de correo no es válido. Ejemplo: nombre@dominio.com'); emailInput?.focus(); return; }
    setMsg('¡Suscripción exitosa! Gracias.', true);
    newsletterForm.reset();
  });
}

    /* ===========================
   10) PRODUCTS FILTERING & SORTING + recordar selección
   =========================== */
const allProductItems = Array.from(document.querySelectorAll('.producto-item'));
// --- Helpers búsqueda en productos: contar y hacer scroll + actualizar héroe
function countVisibleProducts(){
  let n = 0, first = null;
  for (const it of allProductItems){
    // detecta visibilidad real, no solo el style inline
    const hidden = !it || getComputedStyle(it).display === 'none' || it.offsetParent === null;
    if (!hidden){ n++; if (!first) first = it; }
  }
  return { n, first };
}
function scrollToCard(card){
  if (!card) return;
  const y = (typeof computeOffsetTop === 'function')
    ? computeOffsetTop(card)
    : (card.getBoundingClientRect().top + window.scrollY - 80);
  window.scrollTo({ top: y, behavior: 'smooth' });
}
function setHeroResultText(q, n){
  const h = document.getElementById('hero-title');
  const sub = document.querySelector('.productos-hero .hero-subtitle');
  if (!h) return;
  if (q){
    h.textContent = `Resultados para "${q}"`;
    if (sub) sub.textContent = `${n} prenda${n===1?'':'s'} encontrad${n===1?'a':'as'}`;
  } else {
    h.textContent = 'Descubrí nuestra colección';
    if (sub) sub.textContent = 'Prendas urbanas, cómodas y con estilo';
  }
}
const filterTipo  = document.getElementById('filter-tipo');
const filterTalle = document.getElementById('filter-talle');
const sortBy      = document.getElementById('sort-by');
// --- Query de búsqueda proveniente de la lupa (productos.html?q=...)
let searchQuery = '';
try {
  const usp = new URLSearchParams(location.search);
  searchQuery = (usp.get('q') || '').trim().toLowerCase();
} catch (_) {}
const categorySections = Array.from(document.querySelectorAll('.product-category'));
const productosMain = document.querySelector('.productos-main');
let emptyStateEl;

const LS_KEYS = {
  tipo:  'bera:filters:tipo',
  talle: 'bera:filters:talle',
  sort:  'bera:filters:sort'
};
// --- Helper: limpiar búsqueda activa (q) y campos de input
function clearSearch(reason){
  try{
    if (typeof searchQuery !== 'undefined') searchQuery = '';
        setHeroResultText('', 0);
    // Vaciar inputs de búsqueda visibles (header y menú)
    document.querySelectorAll('.header-search-input, .menu-search-input')
      .forEach(inp => inp.value = '');
    // Quitar ?q= de la URL actual manteniendo otros filtros
    const usp = new URLSearchParams(location.search);
    usp.delete('q');
    const qs = usp.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    history.replaceState(null, '', url);
  }catch(_){}
}

// Restaurar selección guardada
try {
  const t = localStorage.getItem(LS_KEYS.tipo);
  const l = localStorage.getItem(LS_KEYS.talle);
  const s = localStorage.getItem(LS_KEYS.sort);
  if (filterTipo && t)  filterTipo.value = t;
  if (filterTalle && l) filterTalle.value = l;
  if (sortBy && s)      sortBy.value = s;
} catch(_) {}
// Lee query params (prioriza URL > localStorage)
try {
  const usp = new URLSearchParams(location.search);
  const qpTipo  = usp.get('tipo');
  const qpTalle = usp.get('talle');
  const qpSort  = usp.get('sort');
  if (filterTipo && qpTipo !== null)   filterTipo.value  = qpTipo;
  if (filterTalle && qpTalle !== null) filterTalle.value = qpTalle;
  if (sortBy && qpSort !== null)       sortBy.value      = qpSort;
} catch(_) {}
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
const sectionToType = Object.fromEntries(
  Object.entries(typeToSection).map(([tipo, sec]) => [sec, tipo])
);
function updateURLParams() {
  try {
    const usp = new URLSearchParams(location.search);
    const qStr = (usp.get('q') || '').trim(); // preservar q

    if (filterTipo && filterTipo.value)   usp.set('tipo',  filterTipo.value); else usp.delete('tipo');
    if (filterTalle && filterTalle.value) usp.set('talle', filterTalle.value); else usp.delete('talle');
    if (sortBy && sortBy.value)           usp.set('sort',  sortBy.value);     else usp.delete('sort');

    if (qStr) usp.set('q', qStr); else usp.delete('q');

    const q = usp.toString();
    const url = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
    history.replaceState(null, '', url);
  } catch(_) {}
}
function applySorting() {
  if (!sortBy) return;
  const sortVal = sortBy.value;
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
  updateURLParams();
}
// --- Normalización básica (quita acentos y pasa a minúsculas)
function norm(str){
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();
}
// Mapa simple de plurales ↔ singulares para categorías comunes
const TERM_ALIASES = {
  remeras:'remera', remera:'remera',
  buzos:'buzo', buzo:'buzo',
  pantalones:'pantalon', pantalon:'pantalon',
  shorts:'short', short:'short',
  tops:'top', top:'top',
  camisas:'camisa', camisa:'camisa',
  faldas:'falda', falda:'falda',
  bodys:'body', body:'body',
  vestidos:'vestido', vestido:'vestido',
  abrigos:'abrigo', abrigo:'abrigo',
  sets:'set', set:'set'
};
function applyFilters() {
 const tipoVal  = filterTipo ? filterTipo.value : '';
const talleVal = filterTalle ? filterTalle.value : '';
const qValRaw  = searchQuery || '';
const q = norm(qValRaw);

// Construye variantes del término (singular/plural + alias de categoría)
const variants = new Set();
if (q) {
  variants.add(q);
  if (q.endsWith('es')) variants.add(q.slice(0, -2));
  if (q.endsWith('s'))  variants.add(q.slice(0, -1));
  if (TERM_ALIASES[q])  variants.add(TERM_ALIASES[q]);
}

// 1) Mostrar/ocultar según filtros
allProductItems.forEach(item => {
  const nameAttr = item.getAttribute('data-name');
  const itemText = (nameAttr || item.dataset.name || item.querySelector('h3')?.textContent || item.textContent || '');
  const itemNorm = norm(itemText);
  const tipoNorm = norm(item.dataset.tipo);

  let textOk = true;
  if (q) {
    // hace match por texto o por el tipo de prenda
    textOk = Array.from(variants).some(v => itemNorm.includes(v) || tipoNorm === v);
  }

  const match = textOk &&
    (!tipoVal  || item.dataset.tipo  === tipoVal) &&
    (!talleVal || item.dataset.talle === talleVal);

  item.style.display = match ? '' : 'none';
});

  // 2) Ordenar visibles
  applySorting();

  // 3) Ocultar secciones vacías
  categorySections.forEach(sec => {
    const visibles = Array
      .from(sec.querySelectorAll('.producto-item'))
      .filter(el => el.style.display !== 'none').length;
    sec.classList.toggle('is-hidden', visibles === 0);
  });

  // 4) Mensaje "sin resultados" accesible
  const anyVisible = allProductItems.some(el => el.style.display !== 'none');
  if (!anyVisible) {
    if (!emptyStateEl) {
      emptyStateEl = document.createElement('p');
      emptyStateEl.className = 'empty-state';
      emptyStateEl.setAttribute('role', 'status');
      emptyStateEl.setAttribute('aria-live', 'polite');
      emptyStateEl.tabIndex = -1;
      emptyStateEl.textContent = 'No encontramos productos con esos filtros.';
      productosMain?.prepend(emptyStateEl);
      requestAnimationFrame(()=> emptyStateEl.focus());
    }
  } else if (emptyStateEl) {
    emptyStateEl.remove();
    emptyStateEl = null;
  }

  // 5) Si eligió tipo, scrollea a su sección visible
  if (tipoVal && typeToSection[tipoVal]) {
    const targetSec = document.getElementById(typeToSection[tipoVal]);
    if (targetSec && !targetSec.classList.contains('is-hidden')) {
      window.scrollTo({ top: computeOffsetTop(targetSec), behavior: 'smooth' });
    }
  }
  updateURLParams();
  // --- Actualizar contador de resultados (si existe barra de filtros)
  try {
    const countHost = document.querySelector('.filters-bar .results-count');
    if (countHost) {
      const visibles = allProductItems.filter(el => el.style.display !== 'none').length;
      countHost.textContent = `${visibles} producto${visibles===1?'':'s'} encontrado${visibles===1?'':'s'}.`;
    }
  } catch(_) {}
}

/* ---------- Loader helpers (envoltorios) ---------- */
function withLoader(container, fn) {
  const host = typeof container === 'string' ? document.querySelector(container) : container;
  if (!host) return fn();
  host.setAttribute('aria-busy', 'true');
  host.classList.add('is-loading');
  const done = () => { host.removeAttribute('aria-busy'); host.classList.remove('is-loading'); };
  requestAnimationFrame(() => { Promise.resolve().then(fn).finally(done); });
}
const productsShell = document.querySelector('.productos-main') || document.querySelector('.grid-products');

function applyFiltersWrapped() { withLoader(productsShell, () => applyFilters()); }
function applySortingWrapped() { withLoader(productsShell, () => applySorting()); }

/* ---------- Listeners (únicos) ---------- */
[filterTipo, filterTalle].forEach(sel => {
  if (sel) sel.addEventListener('change', () => {
    try {
      if (sel === filterTipo)  localStorage.setItem(LS_KEYS.tipo, sel.value);
      if (sel === filterTalle) localStorage.setItem(LS_KEYS.talle, sel.value);
    } catch(_) {}
    // Al cambiar tipo/talle, la búsqueda deja de ser el driver
    clearSearch('filter-change');
    applyFiltersWrapped();
    updateURLParams();
  });
});
if (sortBy) sortBy.addEventListener('change', () => {
  try { localStorage.setItem(LS_KEYS.sort, sortBy.value); } catch(_) {}
  clearSearch('sort-change');
  applySortingWrapped();
  updateURLParams();
});

/* ---------- Primera corrida (con loader) ---------- */
applyFiltersWrapped();
applySortingWrapped();
updateURLParams();
// ---- Prefill diferido para productos.html?q=... (después de inicializar filtros) ----
(function runSearchPrefill(){
  if (!window.location.pathname.endsWith('productos.html')) return;
  const usp = new URLSearchParams(location.search);
  const q = (usp.get('q') || '').trim();
  if (!q) { setHeroResultText('', 0); return; }

  // Mostrar el término en inputs visibles
  document.querySelectorAll('.header-search-input, .menu-search-input')
    .forEach(inp => inp.value = q);

  // Asegurar que filtros previos no oculten resultados de la búsqueda
  if (filterTipo)  filterTipo.value = '';
  if (filterTalle) filterTalle.value = '';
  try {
    localStorage.removeItem(LS_KEYS.tipo);
    localStorage.removeItem(LS_KEYS.talle);
  } catch (_) {}

  searchQuery = q.toLowerCase();
  // Ejecutar filtro de forma sincrónica para que el conteo sea correcto
  applyFilters();

  const { n, first } = countVisibleProducts();
  setHeroResultText(q, n);
  if (n > 0) scrollToCard(first);
  updateURLParams();
})();
// Crear botón y contador si existen filtros
if (productosMain && (filterTipo || filterTalle)) {
  const bar = document.createElement('div');
  bar.className = 'filters-bar';
  bar.innerHTML = `
    <button type="button" class="btn clear-filters" aria-label="Limpiar filtros">Limpiar filtros</button>
    <span class="results-count" aria-live="polite"></span>
  `;
  productosMain.prepend(bar);

  const clearBtn = bar.querySelector('.clear-filters');
  const countEl  = bar.querySelector('.results-count');

  clearBtn.addEventListener('click', () => {
    if (filterTipo)  filterTipo.value = '';
    if (filterTalle) filterTalle.value = '';
    try {
      localStorage.removeItem('bera:filters:tipo');
      localStorage.removeItem('bera:filters:talle');
    } catch(_) {}
    clearSearch('filters-clear');
    applyFiltersWrapped();
    updateURLParams();
  });

  // Inicializa el contador con el estado actual
  (function initResultsCount(){
    const visiblesNow = allProductItems.filter(el => el.style.display !== 'none').length;
    countEl.textContent = `${visiblesNow} producto${visiblesNow===1?'':'s'} encontrado${visiblesNow===1?'':'s'}.`;
  })();
}
    /* ===========================
       8) TOAST DEL CARRITO SIN STACKING
       =========================== */
    function showCartToast(msg = 'Producto agregado al carrito') {
  let container = document.getElementById('toast-layer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-layer';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('role', 'status');
    document.body.appendChild(container);
  }
  const prev = container.querySelector('.cart-toast');
  if (prev) prev.remove();

  const t = document.createElement('div');
  t.className = 'cart-toast';
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(()=> t.classList.add('show'));
  setTimeout(() => t.classList.add('hide'), 1600);
  setTimeout(() => t.remove(), 2000);
}

    /* ===========================
       SHOPPING CART & MODAL (con delegación para add-to-cart)
       =========================== */
    let cart = [];
    try {
      const raw = localStorage.getItem('cart');
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch (_) {
      cart = [];
    }
    const cartCount = document.querySelector('.cart-count');
    const saveCart = () => {
      try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (_) {}
    };
    const updateCartCount = () => {
      const totalItems = cart.reduce((sum,i) => sum + i.qty, 0);
      const totalPrice = cart.reduce((sum,i) => sum + i.qty * i.price, 0);

      if (cartCount) cartCount.textContent = totalItems;

      const cartFab          = document.getElementById('cart-fab');
      const cartCounterFab   = cartFab?.querySelector('[data-count]');
      const cartTotalFab     = cartFab?.querySelector('[data-total]');
      if (cartCounterFab) cartCounterFab.textContent = totalItems;
      if (cartTotalFab) cartTotalFab.textContent = '$' + totalPrice.toLocaleString('es-AR');

      document.querySelectorAll('[data-total-final]').forEach(el => {
        el.textContent = '$' + totalPrice.toLocaleString('es-AR');
      });

      if (document.getElementById('cart-panel')?.classList.contains('show')) renderCartPanel();
    };
    // Mantener el contador del carrito sincronizado entre pestañas/páginas
    window.addEventListener('storage', (e) => {
      if (e.key !== 'cart') return;
      try {
        const next = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(next)) {
          cart = next;
          updateCartCount();
          // Si el panel está abierto, re-renderizamos para reflejar cambios externos
          if (document.getElementById('cart-panel')?.classList.contains('show')) {
            renderCartPanel?.();
          }
        }
      } catch (_) { /* noop */ }
    });
    const addToCart = prod => {
      const ex = cart.find(i => i.id === prod.id);
      if (ex) {
        ex.qty = Math.min(ex.qty + 1, 10);
      } else {
        cart.push({ ...prod, qty: 1 });
      }
      saveCart(); updateCartCount();
    };

    // 9) DELEGACIÓN: clicks en .add-to-cart-icon (soporta productos dinámicos)
    document.body.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.add-to-cart-icon, .add-to-cart-btn');
      if (!btn) return;

      // Read price from data attribute
      let price = Number(btn.dataset.price);
      const priceEl = btn.closest('.producto-item')?.querySelector('.price') ||
                      btn.closest('.product-item')?.querySelector('.price');
      if (priceEl) {
        let text = priceEl.textContent.trim();
        text = text.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(/,/g, '.');
        const domPrice = parseFloat(text) || 0;
        if (isNaN(price) || price !== domPrice) price = domPrice;
      }

      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name || btn.closest('.producto-item')?.querySelector('h3')?.textContent?.trim() || 'Producto',
        price: Number.isFinite(price) ? price : 0
      };
      addToCart(product);
      showCartToast();
      // Abrir carrito automáticamente solo en escritorio; en móvil mostramos solo el toast
      if (window.matchMedia && window.matchMedia('(min-width: 1024px)').matches) {
        openCartPanel?.();
      }
    });

    /* -------- Floating Cart references -------- */
    const cartFab          = document.getElementById('cart-fab');
    const cartCounterFab   = cartFab?.querySelector('[data-count]');
    const cartTotalFab     = cartFab?.querySelector('[data-total]');
    const cartPanelElm     = document.getElementById('cart-panel');
    const cartOverlayElm   = document.getElementById('cart-overlay');
    const cartItemsList    = cartPanelElm?.querySelector('[data-items]');
    const cartTotalFinalEl = document.getElementById('cart-total') 
                          || cartPanelElm?.querySelector('[data-total-final]');
    const cartCloseFab     = cartPanelElm?.querySelector('.cart-close');

    const lockScrollCart   = () => { document.body.style.overflow = 'hidden'; };
    const unlockScrollCart = () => { document.body.style.overflow = '';       };

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

      cartItemsList.querySelectorAll('[data-qty]').forEach(input => {
        input.addEventListener('change', () => {
          const id  = input.closest('.cart-item').dataset.id;
          const raw = parseInt(input.value, 10) || 1;
          const qty = Math.max(1, Math.min(10, raw));
          input.value = qty;
          updateItemQty(id, qty);
          refreshStepperState();
        });
      });
      cartItemsList.querySelectorAll('.qty-inc').forEach(btn => {
        btn.addEventListener('click', () => changeQty(btn.closest('.cart-item').dataset.id, +1));
      });
      cartItemsList.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => changeQty(btn.closest('.cart-item').dataset.id, -1));
      });
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
        btn.addEventListener('click', () => removeItem(btn.closest('.cart-item').dataset.id));
      });
    }
    function changeQty(id, delta) {
      const item = cart.find(i => i.id === id);
      if (!item) return;
      const newQty = Math.max(1, Math.min(10, item.qty + delta));
      if (newQty !== item.qty) {
        item.qty = newQty;
        saveCart(); updateCartCount();
      }
    }
    function updateItemQty(id, qty) {
      qty = Math.max(1, Math.min(10, qty));
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
     lockScrollCart();
setAppInert(true);
updateCartCount();
    }
    function closeCartPanel() {
      if (!cartPanelElm) return;
      cartPanelElm.classList.add('hidden');
      cartPanelElm.classList.remove('show');
      cartOverlayElm?.classList.add('hidden');
      cartOverlayElm?.classList.remove('show');
      unlockScrollCart();
      setAppInert(false);
    }
    window.openCartPanel = openCartPanel; // opcional, por si lo llamás desde otros lados

    cartFab?.addEventListener('click', openCartPanel);
    cartCloseFab?.addEventListener('click', closeCartPanel);
    cartOverlayElm?.addEventListener('click', closeCartPanel);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cartPanelElm?.classList.contains('show')) closeCartPanel();
    });
    let startXCart;
    cartPanelElm?.addEventListener('touchstart', e => { startXCart = e.touches[0].clientX; }, {passive:true});
    cartPanelElm?.addEventListener('touchend',   e => {
      if (startXCart !== undefined && e.changedTouches[0].clientX - startXCart < -60) closeCartPanel();
      startXCart = undefined;
    }, {passive:true});

    // Cart modal (igual que tenías)
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
        setAppInert(true);
        cartToggleBtn.classList.add('open');
      });
      closeCartBtn.addEventListener('click', () => {
  setAppInert(false);
  cartModalElm.classList.add('hidden');
  cartToggleBtn.classList.remove('open');
});
      cartModalElm.addEventListener('click', e => {
       if (e.target === cartModalElm) {
  setAppInert(false);
  cartModalElm.classList.add('hidden');
  cartToggleBtn.classList.remove('open');
}
      });
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          setAppInert(false);
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

    // Inicializa contadores
    updateCartCount();

  }); // DOMContentLoaded end
} // boot guard

/* ===========================
   11) setActiveNav más robusto (fuera de DOMContentLoaded para ejecutar siempre)
   - Ignora hash (#...) y query (?...)
   =========================== */
(function setActiveNav() {
  // Normaliza path actual sin query ni hash
  const url = new URL(window.location.href);
  let current = url.pathname.split('/').pop() || 'index.html';
  // normalizaciones
  const lc = current.toLowerCase();
  if (lc === '' || lc === '/') current = 'index.html';
  if (lc.includes('newst')) current = 'newsletter.html';

  document.querySelectorAll('#primary-navigation a, .collection-menu a').forEach(a => {
    a.classList.remove('active');
    const hrefRaw = a.getAttribute('href') || '';
    // Ignorar anchors internos (hash) para no marcarlos como activos por filename
    if (hrefRaw.startsWith('#')) return;
    // Quita query/hash del href del link
    const hrefUrl = new URL(hrefRaw, window.location.origin);
    const hrefFile = hrefUrl.pathname.split('/').pop() || 'index.html';
    if (hrefFile === current) a.classList.add('active');
  });
})();
// === CTA flotante a Instagram + tracking GA ===
(function () {
  const IG_URL = 'https://instagram.com/beraclothingg';

  // Crea el botón flotante si no existe
  function ensureIGFab() {
    if (document.getElementById('ig-fab')) return;

    const a = document.createElement('a');
    a.id = 'ig-fab';
    a.className = 'ig-fab';
    a.href = IG_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Abrir Instagram de BERA clothing');

    // Ícono SVG liviano
    a.innerHTML = `
      <svg class="ig-fab__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zM18 6.25a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5z"/>
      </svg>
    `;
    document.body.appendChild(a);
  }

  // Tracking: cuenta cualquier click hacia IG (botón flotante o links del sitio)
  function setupIGClickTracking() {
    document.addEventListener('click', function (ev) {
      const a = ev.target.closest('a[href*="instagram.com/beraclothingg"]');
      if (!a) return;
      try {
        window.gtag && gtag('event', 'instagram_click', {
          event_category: 'outbound',
          event_label: location.pathname + location.search
        });
      } catch (e) { /* silencioso */ }
    }, { capture: true });
  }

  // Init cuando el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureIGFab();
      setupIGClickTracking();
    });
  } else {
    ensureIGFab();
    setupIGClickTracking();
  }
})();