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
          // Fuerza a que componentes dependientes del layout (ej: menú mobile) actualicen offset
          window.dispatchEvent(new Event('resize'));
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

    const heroSubtitleEl = document.querySelector('.productos-hero .hero-subtitle');
    const heroCopyEl = document.querySelector('.productos-hero .hero-copy');
    const heroPhrases = heroCopyEl?.dataset.phrases
      ? heroCopyEl.dataset.phrases.split('|').map(str => str.trim()).filter(Boolean)
      : [];
    let heroRotationTimer;
    let heroRotationIndex = 0;
    if (heroSubtitleEl) {
      const base = heroSubtitleEl.textContent.trim();
      heroSubtitleEl.dataset.base = base || (heroPhrases[0] || '');
      heroSubtitleEl.dataset.frozen = 'false';
      if (heroPhrases.length) {
        heroSubtitleEl.textContent = heroPhrases[0];
        startHeroRotation();
      }
    }
    function startHeroRotation() {
      if (!heroSubtitleEl || heroPhrases.length < 2) return;
      clearInterval(heroRotationTimer);
      heroRotationIndex = 0;
      heroRotationTimer = window.setInterval(() => {
        if (heroSubtitleEl.dataset.frozen === 'true') return;
        heroRotationIndex = (heroRotationIndex + 1) % heroPhrases.length;
        heroSubtitleEl.textContent = heroPhrases[heroRotationIndex];
      }, 4500);
    }

    document.querySelectorAll('[data-scroll]').forEach(ctrl => {
      ctrl.addEventListener('click', e => {
        const targetSel = ctrl.getAttribute('data-scroll');
        if (!targetSel) return;
        const target = document.querySelector(targetSel);
        if (!target) return;
        e.preventDefault();
        const top = typeof computeOffsetTop === 'function'
          ? computeOffsetTop(target)
          : (target.getBoundingClientRect().top + window.scrollY - 80);
        window.scrollTo({ top, behavior: 'smooth' });
      }, { passive: false });
    });
    /* ===========================
       NAVIGATION TOGGLE (mobile panel)
       =========================== */
    const hamburgerBtn = document.querySelector('.hamburger');
    const mobileMenu   = document.getElementById('mobile-menu');

    const readRootNumber = (name, fallback = 0) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
      const num = parseFloat(raw);
      return Number.isFinite(num) ? num : fallback;
    };

    const applyMobileMenuOffset = () => {
      if (!mobileMenu) return;

      const header = document.querySelector('.site-header');
      const annFallback = readRootNumber('--ann-h', 0);
      const hdrFallback = Math.max(readRootNumber('--hdr-h', 64), 64);
      const fallback = annFallback + hdrFallback;
      const gap = 0;

      let offset = fallback;
      if (header) {
        const rect = header.getBoundingClientRect();
        if (rect.height > 0) {
          offset = Math.ceil(rect.bottom + gap);
        }
      }

      const root = document.documentElement;
      root.style.setProperty('--menu-offset', `${offset}px`);
    };

    const closeMobileMenu = ({ focusTrigger = false } = {}) => {
      if (!hamburgerBtn || !mobileMenu) return;
      if (mobileMenu.hidden) return;
      mobileMenu.classList.remove('is-open');
      mobileMenu.hidden = true;
      mobileMenu.setAttribute('hidden', '');
      mobileMenu.style.display = '';
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      hamburgerBtn.classList.remove('open');
      document.body.classList.remove('no-scroll');
      document.body.classList.remove('menu-open');
      document.documentElement.style.removeProperty('--menu-offset');
      if (focusTrigger) {
        try {
          hamburgerBtn.focus({ preventScroll: true });
        } catch (err) {
          hamburgerBtn.focus();
        }
      }
    };

    const openMobileMenu = () => {
      if (!hamburgerBtn || !mobileMenu) return;
      if (!mobileMenu.hidden) return;
      mobileMenu.hidden = false;
      mobileMenu.removeAttribute('hidden');
      mobileMenu.classList.add('is-open');
      mobileMenu.style.display = 'flex';
      applyMobileMenuOffset();
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      hamburgerBtn.classList.add('open');
      document.body.classList.add('no-scroll');
      document.body.classList.add('menu-open');
    };

    if (hamburgerBtn && mobileMenu) {
      const navCloseBtn = mobileMenu.querySelector('.nav-close');
      const desktopMq = window.matchMedia('(min-width: 769px)');

      const setHeaderHeightVar = () => {
        const header = document.querySelector('.site-header');
        if (!header) return;
        const height = Math.ceil(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--hdr-h', `${height}px`);
      };
      const handleLayoutMetrics = () => {
        setHeaderHeightVar();
        applyMobileMenuOffset();
      };
      const scheduleHeaderVar = throttle(handleLayoutMetrics, 120);

      function toggleMobileMenu() {
        const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          closeMobileMenu();
        } else {
          handleLayoutMetrics();
          openMobileMenu();
        }
      }

      hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu();
      });

      navCloseBtn?.addEventListener('click', () => closeMobileMenu({ focusTrigger: true }));

      mobileMenu.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', () => closeMobileMenu());
      });

      document.addEventListener('click', (event) => {
        if (mobileMenu.hidden) return;
        const isInside = mobileMenu.contains(event.target) || hamburgerBtn.contains(event.target);
        if (!isInside) closeMobileMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.hidden) closeMobileMenu({ focusTrigger: true });
      });

      const syncMenuWithViewport = (mqEvent) => {
        if (mqEvent.matches) {
          mobileMenu.hidden = false;
          mobileMenu.removeAttribute('hidden');
          mobileMenu.classList.add('is-open');
          mobileMenu.style.display = '';
          document.body.classList.remove('no-scroll');
          document.body.classList.remove('menu-open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          hamburgerBtn.classList.remove('open');
          document.documentElement.style.removeProperty('--menu-offset');
        } else {
          if (hamburgerBtn.getAttribute('aria-expanded') !== 'true') {
            mobileMenu.classList.remove('is-open');
            mobileMenu.hidden = true;
            mobileMenu.setAttribute('hidden', '');
            mobileMenu.style.display = '';
            hamburgerBtn.classList.remove('open');
            document.body.classList.remove('menu-open');
            document.documentElement.style.removeProperty('--menu-offset');
          }
          applyMobileMenuOffset();
        }
      };

      handleLayoutMetrics();
      syncMenuWithViewport(desktopMq);
      desktopMq.addEventListener('change', syncMenuWithViewport);

      window.addEventListener('resize', scheduleHeaderVar, { passive: true });
      window.addEventListener('orientationchange', () => setTimeout(handleLayoutMetrics, 0), { passive: true });
      window.addEventListener('load', handleLayoutMetrics, { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(handleLayoutMetrics).catch(() => {});
      }
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

        // Caso 2: enlaces que van a productos/proximamente (desde otras páginas) → cerrar y permitir la navegación por defecto
        if (
          href.includes('productos.html') ||
          href.includes('proximamente.html') ||
          href.startsWith('productos') ||
          href.startsWith('proximamente')
        ) {
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
        // cierra el menú mobile si estaba abierto
        if (hamburgerBtn && mobileMenu && !mobileMenu.hidden) {
          closeMobileMenu();
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
        if (href.includes('productos') || href.includes('proximamente') || href.startsWith('#')) {
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
        form.action = `proximamente.html?q=${encodeURIComponent(q)}`;
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
          form.action = q ? `proximamente.html?q=${encodeURIComponent(q)}` : 'proximamente.html';
          // Si es el buscador del menú mobile, cierra el panel
          if (form.classList.contains('menu-search')) {
            if (hamburgerBtn && mobileMenu && !mobileMenu.hidden) {
              closeMobileMenu();
            }
          }
        });
      };
      document.querySelectorAll('form.header-search:not(.header-search-desktop)').forEach(f => handleSubmit(f, '.header-search-input'));
      document.querySelectorAll('form.menu-search').forEach(f => handleSubmit(f, '.menu-search-input'));
    })();

    /* ---------- PRODUCT MODAL (SIN CAMBIOS DE LÓGICA) ---------- */
    const productData = {
      'remera-night-glow': {
        title: 'Remera Night Glow',
        price: '$18.500',
        details: 'Medida: Único<br>Textura: algodón suave<br>Vibe: after office',
        description: 'Remera negra con brillo sutil y fit relajado para salir cómoda pero con onda.',
        images: ['assets/images/IMG_7221.jpeg']
      },
      'remera-neon-wave': {
        title: 'Remera Neon Wave',
        price: '$19.200',
        details: 'Medida: Único<br>Estilo: crop relajado<br>Detalle: print holográfico',
        description: 'Remera crop con estampa neón inspirada en las luces de la city.',
        images: ['assets/images/IMG_7222.jpeg']
      },
      'remera-after-party': {
        title: 'Remera After Party',
        price: '$20.500',
        details: 'Medida: Único<br>Textura: algodón soft<br>Color: gris humo',
        description: 'Remera oversized gris diseñada para acompañarte en el after sin perder estilo.',
        images: ['assets/images/IMG_7223.jpeg']
      },
      'jean-mom-fit': {
        title: 'Jean Mom Fit',
        price: '$52.000',
        details: 'Medida: Único<br>Corte: mom fit<br>Lavado: blue night',
        description: 'Jean tiro alto con calce relajado y lavado profundo para combinar con cualquier top.',
        images: ['assets/images/IMG_7231.jpeg']
      },
      'cargo-fucsia': {
        title: 'Cargo Fucsia',
        price: '$47.000',
        details: 'Medida: Único<br>Material: gabardina con spandex<br>Extras: bolsillos cargo',
        description: 'Cargo fucsia con cintura elasticada y bolsillos amplios para salir con actitud.',
        images: ['assets/images/IMG_7229.jpeg']
      },
      'skort-satin': {
        title: 'Mini Skort Satin',
        price: '$22.000',
        details: 'Medida: Único<br>Material: satén stretch<br>Ideal para: noches de verano',
        description: 'Mini skort satinada que mezcla comodidad de short y vibra de falda.',
        images: ['assets/images/IMG_7230.jpeg']
      },
      'top-halter-black': {
        title: 'Top Halter Black',
        price: '$16.000',
        details: 'Medida: Único<br>Escote: halter regulable<br>Acabado: mate',
        description: 'Top halter negro ajustable perfecto para un look de noche sin complicaciones.',
        images: ['assets/images/IMG_7224.jpeg']
      },
      'body-lace-midnight': {
        title: 'Body Lace Midnight',
        price: '$23.000',
        details: 'Medida: Único<br>Material: encaje + powernet<br>Detalle: espalda abierta',
        description: 'Body de encaje negro con espaldas abiertas para sumar drama a tu outfit.',
        images: ['assets/images/IMG_7226.jpeg']
      },
      'set-velvet-night': {
        title: 'Set Velvet Night',
        price: '$39.000',
        details: 'Medida: Único<br>Incluye: top + pantalón<br>Textura: terciopelo soft',
        description: 'Conjunto de terciopelo elástico listo para la noche, cómodo y glam a la vez.',
        images: ['assets/images/IMG_7228.jpeg']
      },
      'buzo-oversize-cherry': {
        title: 'Buzo Oversize Cherry',
        price: '$65.000',
        details: 'Medida: Único<br>Interior: frisa premium<br>Corte: oversized',
        description: 'Buzo oversize color cherry con frisa ultra suave para cubrirte después de la fiesta.',
        images: ['assets/images/IMG_7227.jpeg']
      },
      'vestido-midnight': {
        title: 'Vestido Midnight Spark',
        price: '$45.000',
        details: 'Medida: Único<br>Fit: ajustado con caída<br>Brillo: destello sutil',
        description: 'Vestido negro con destellos metálicos pensado para noches eternas.',
        images: ['assets/images/IMG_7232.jpeg']
      },
      'clutch-mirror': {
        title: 'Clutch Mirror',
        price: '$12.000',
        details: 'Medida: Único<br>Textura: vinilo espejado<br>Cierre: imán oculto',
        description: 'Clutch espejado para llevar lo básico y sumar luz a tu outfit.',
        images: ['assets/images/IMG_7238.PNG']
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
    [{ formId: 'form-newsletter', responseId: 'newsletter-response' },
     { formId: 'form-prelaunch', responseId: 'prelaunch-response' }]
    .forEach(({ formId, responseId }) => {
      const formEl = document.getElementById(formId);
      const respEl = responseId ? document.getElementById(responseId) : null;
      if (!formEl) return;
      const emailInput = formEl.querySelector('input[type="email"], [name="email-newsletter"], [name="email-prelaunch"]');
      formEl.setAttribute('novalidate', 'novalidate');

      const setMsg = (msg, ok = false) => {
        if (!respEl) return;
        respEl.textContent = msg;
        respEl.style.color = ok ? 'var(--color-acento)' : '#f66';
      };

      emailInput?.addEventListener('input', () => { emailInput.setCustomValidity(''); });

      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (emailInput?.value || '').trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!email) { setMsg('Ingresá tu correo electrónico.'); emailInput?.focus(); return; }
        if (!valid) { setMsg('Formato inválido. Ejemplo: nombre@dominio.com'); emailInput?.focus(); return; }
        setMsg('¡Gracias! Te avisamos cuando se active el drop.', true);
        formEl.reset();
      });
    });

    /* ===========================
       REVIEWS (Supabase REST)
       =========================== */
    (function initCrewReviews() {
      const reviewList = document.querySelector('[data-review-list]');
      const reviewForm = document.querySelector('[data-review-form]');
      if (!reviewList || !reviewForm) return;

      const reviewSubmitBtn = reviewForm.querySelector('[data-review-submit]');
      const reviewResp = reviewForm.querySelector('[data-review-response]');
      const honeypot = reviewForm.querySelector('.hp-field');

      const SUPABASE_URL = 'https://qylrooxrmrdqrvvzqwsq.supabase.co';
      const SUPABASE_PROJECT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bHJvb3hybXJkcXJ2dnpxd3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTQxMTgsImV4cCI6MjA3NDI5MDExOH0.ZXmvOPjjQGk1pxJv10pBVkrhLNwOkA4tzSKGDS3cHJg';
      const supabaseAnon = window.supabase.createClient(SUPABASE_URL, SUPABASE_PROJECT_KEY, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      });

      const REVIEWS_ENDPOINT = `${SUPABASE_URL}/rest/v1/rese%C3%B1as`;
      const SELECT_COLUMNS = ['Nombre', 'Comentario', 'Valoración', 'created_at']
        .map(encodeURIComponent)
        .join(',');
      const SELECT_QUERY = `?select=${SELECT_COLUMNS}&approved=eq.true&order=created_at.desc&limit=12`;
      const DEFAULT_HEADERS = {
        apikey: SUPABASE_PROJECT_KEY
      };

      const renderStars = (value) => {
        const rating = Math.max(1, Math.min(5, Number(value) || 0));
        return '★★★★★☆☆☆☆☆'.slice(5 - rating, 10 - rating);
      };

      const escapeHTML = (str = '') => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      const formatDate = (iso) => {
        if (!iso) return '';
        try {
          return new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
        } catch (_) {
          return '';
        }
      };

      const clearList = () => {
        reviewList.innerHTML = '';
      };

      const renderEmpty = () => {
        const msg = document.createElement('p');
        msg.className = 'empty-reviews';
        msg.textContent = 'Todavía no hay reseñas aprobadas. Sé la primera persona en compartir tu experiencia.';
        reviewList.appendChild(msg);
      };

      const renderReviews = (rows) => {
        clearList();
        if (!rows?.length) {
          renderEmpty();
          return;
        }

        rows.forEach((row) => {
          const card = document.createElement('article');
          card.className = 'testimonial-card';
          const rating = renderStars(row['Valoración']);
          const comment = (row['Comentario'] || '').trim();
          const name = (row['Nombre'] || 'Anónimo').trim();
          const dateLabel = formatDate(row.created_at);

          card.innerHTML = `
            <div class="testimonial-rating" aria-hidden="true">${rating}</div>
            <blockquote>${comment ? escapeHTML(comment) : 'Sin comentario.'}</blockquote>
            <cite>${escapeHTML(name)}${dateLabel ? ` · ${dateLabel}` : ''}</cite>
          `;

          reviewList.appendChild(card);
        });
      };

      const fetchReviews = async () => {
        try {
          const res = await fetch(`${REVIEWS_ENDPOINT}${SELECT_QUERY}`, {
            headers: { ...DEFAULT_HEADERS, Accept: 'application/json' }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          renderReviews(data);
        } catch (error) {
          console.error('Error cargando reseñas', error);
          clearList();
          const err = document.createElement('p');
          err.className = 'empty-reviews';
          err.textContent = 'No pudimos cargar las reseñas. Intentá nuevamente en unos minutos.';
          reviewList.appendChild(err);
        }
      };

      const setFormMessage = (text, ok = false) => {
        if (!reviewResp) return;
        reviewResp.textContent = text;
        reviewResp.style.color = ok ? 'var(--color-acento)' : '#f66';
      };

      const handleAuthState = async () => {
        const { data: { session } } = await supabaseAnon.auth.getSession();
        const loginArea = document.querySelector('[data-review-login]');

        if (!session) {
          reviewForm.setAttribute('hidden', 'hidden');
          reviewForm.classList.add('is-disabled');
          reviewSubmitBtn?.setAttribute('disabled', 'disabled');
          if (loginArea) loginArea.removeAttribute('hidden');
          return;
        }

        reviewForm.removeAttribute('hidden');
        reviewForm.classList.remove('is-disabled');
        reviewSubmitBtn?.removeAttribute('disabled');
        if (loginArea) loginArea.setAttribute('hidden', 'hidden');

        const userName = session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0] || '';
        const nameInput = reviewForm.querySelector('input[name="name"]');
        if (nameInput && !nameInput.value) {
          nameInput.value = userName;
        }
      };

      const startOAuth = async () => {
        await supabaseAnon.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/index.html`
          }
        });
      };

      document.querySelector('[data-review-google]')?.addEventListener('click', (ev) => {
        ev.preventDefault();
        startOAuth();
      });

      supabaseAnon.auth.onAuthStateChange(() => {
        handleAuthState();
      });

      reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (honeypot && honeypot.value.trim()) {
          reviewForm.reset();
          return;
        }

        const { data: { session } } = await supabaseAnon.auth.getSession();
        if (!session) {
          setFormMessage('Ingresá con Google para dejar tu reseña.');
          return;
        }

        const formData = new FormData(reviewForm);
        const rating = Number(formData.get('rating'));
        const comment = (formData.get('comment') || '').trim();
        const name = (formData.get('name') || '').trim();
        const captchaToken = window.hcaptcha?.getResponse?.();

        if (!rating || rating < 1 || rating > 5) {
          setFormMessage('Elegí cuántas estrellas querés dar.');
          return;
        }
        if (comment.length < 10) {
          setFormMessage('Contanos un poco más (mínimo 10 caracteres).');
          return;
        }
        if (!captchaToken) {
          setFormMessage('Confirmá que no sos un robot.');
          return;
        }

        setFormMessage('Enviando reseña…', true);
        reviewSubmitBtn?.setAttribute('disabled', 'disabled');

        try {
          const payload = {
            'Valoración': rating,
            'Comentario': comment,
            'Nombre': name || null
          };

          const res = await fetch(REVIEWS_ENDPOINT, {
            method: 'POST',
            headers: {
              ...DEFAULT_HEADERS,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          reviewForm.reset();
          window.hcaptcha?.reset?.();
          setFormMessage('¡Gracias! Revisamos tu reseña y la publicamos dentro de poco.', true);
        } catch (error) {
          console.error('Error enviando reseña', error);
          setFormMessage('No pudimos guardar tu reseña. Intentá de nuevo en un momento.');
        } finally {
          reviewSubmitBtn?.removeAttribute('disabled');
        }
      });

      fetchReviews();
      handleAuthState();
    })();

    /* ===========================
       Modernización de grilla de productos (acciones, datos auxiliares)
       =========================== */
    const productCards = Array.from(document.querySelectorAll('.producto-item'));
    productCards.forEach(card => {
      const viewBtn = card.querySelector('.view-product-btn');
      const addWrapper = card.querySelector('.add-to-cart-wrapper');
      const addBtn = card.querySelector('.add-to-cart-icon');
      const addLabel = card.querySelector('.add-to-cart-label');

      if (!viewBtn || !addBtn) return;

      // Asegura data-name consistente para filtros y accesibilidad
      if (!card.dataset.name) {
        const nameFromHeading = card.querySelector('h3')?.textContent?.trim();
        if (nameFromHeading) card.dataset.name = nameFromHeading;
      }

      let actions = card.querySelector('.product-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'product-actions';
        viewBtn.parentElement !== actions && actions.appendChild(viewBtn);

        if (addWrapper) {
          actions.appendChild(addBtn);
          if (addLabel) actions.appendChild(addLabel);
          addWrapper.remove();
        } else {
          actions.appendChild(addBtn);
          if (addLabel) actions.appendChild(addLabel);
        }

        card.appendChild(actions);
      }
    });

    const tallaSelect = document.getElementById('filter-talle');
    if (tallaSelect) {
      const tallaLabels = { u: 'Único', xs: 'XS', s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: 'XXL', xxxl: 'XXXL' };
      const talles = Array.from(new Set(productCards
        .map(card => (card.dataset.talle || '').toLowerCase())
        .filter(Boolean)));
      const order = ['u', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
      talles.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      tallaSelect.innerHTML = '<option value="">Todas las opciones</option>' +
        talles.map(t => `<option value="${t}">${tallaLabels[t] || t.toUpperCase()}</option>`).join('');
    }

    /* ===========================
       10) PRODUCTS FILTERING & SORTING + recordar selección
       =========================== */
const allProductItems = productCards;
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
function freezeHeroSubtitle(frozen, text){
  if (!heroSubtitleEl) return;
  if (frozen) {
    heroSubtitleEl.dataset.frozen = 'true';
    if (typeof text === 'string') heroSubtitleEl.textContent = text;
  } else {
    heroSubtitleEl.dataset.frozen = 'false';
    const base = text || heroSubtitleEl.dataset.base || heroPhrases[0] || heroSubtitleEl.textContent;
    heroSubtitleEl.textContent = base;
    if (heroPhrases.length) {
      const idx = heroPhrases.indexOf(base);
      heroRotationIndex = idx >= 0 ? idx : 0;
    }
    startHeroRotation();
  }
}

function setHeroResultText(q, n){
  const h = document.getElementById('hero-title');
  if (!h) return;
  if (q){
    h.textContent = `Resultados para "${q}"`;
    freezeHeroSubtitle(true, `${n} prenda${n===1?'':'s'} encontrad${n===1?'a':'as'}`);
  } else {
    h.textContent = 'Descubrí nuestra colección';
    freezeHeroSubtitle(false);
  }
}
const filterTipo  = document.getElementById('filter-tipo');
const filterTalle = document.getElementById('filter-talle');
const sortBy      = document.getElementById('sort-by');
const resultsCountEl = document.getElementById('results-count');
const chipButtons = Array.from(document.querySelectorAll('.chip-filter'));
const chipState = { priceMax: null, badge: '' };
const filtersResetBtn = document.getElementById('filters-reset');
// --- Query de búsqueda proveniente de la lupa (productos.html?q=...)
let searchQuery = '';
try {
  const usp = new URLSearchParams(location.search);
  searchQuery = (usp.get('q') || '').trim().toLowerCase();
} catch (_) {}
const categorySections = Array.from(document.querySelectorAll('.product-category'));
const productosMain = document.querySelector('.productos-main');
let emptyStateEl;
const filtrosSection = document.getElementById('productos-filtros');
if (filtrosSection && 'IntersectionObserver' in window) {
  const sentinel = document.createElement('div');
  sentinel.className = 'filters-sentinel';
  filtrosSection.parentElement?.insertBefore(sentinel, filtrosSection);
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    filtrosSection.classList.toggle('is-floating', !!entry && entry.intersectionRatio === 0);
  }, { threshold: [0] });
  observer.observe(sentinel);
}

const resetChipState = () => {
  chipState.priceMax = null;
  chipState.badge = '';
};

const syncQuickFilters = () => {
  chipButtons.forEach(btn => {
    btn.classList.remove('is-active');
    if (btn.dataset.chipTipo && filterTipo && filterTipo.value === btn.dataset.chipTipo) {
      btn.classList.add('is-active');
    } else if (btn.dataset.chipSort && sortBy && sortBy.value === btn.dataset.chipSort) {
      btn.classList.add('is-active');
    } else if (btn.dataset.chipPriceMax && chipState.priceMax) {
      const max = parseFloat(btn.dataset.chipPriceMax);
      if (Number.isFinite(max) && max === chipState.priceMax) btn.classList.add('is-active');
    } else if (btn.dataset.chipBadge && chipState.badge) {
      if (norm(btn.dataset.chipBadge) === chipState.badge) btn.classList.add('is-active');
    }
  });
};

chipButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const isActive = btn.classList.contains('is-active');
    chipButtons.forEach(other => { if (other !== btn) other.classList.remove('is-active'); });

    if (btn.dataset.chipTipo || btn.dataset.chipSort) {
      resetChipState();
    }

    if (isActive) {
      btn.classList.remove('is-active');
      if (btn.dataset.chipPriceMax || btn.dataset.chipBadge) {
        resetChipState();
      }
      if (!btn.dataset.chipTipo && !btn.dataset.chipSort) {
        applyFiltersWrapped();
      } else {
        if (btn.dataset.chipTipo && filterTipo) {
          filterTipo.value = '';
          filterTipo.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (btn.dataset.chipSort && sortBy) {
          sortBy.value = 'relevancia';
          sortBy.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      return;
    }

    btn.classList.add('is-active');

    if (!btn.dataset.chipTipo && !btn.dataset.chipSort) {
      resetChipState();
    }
    if (btn.dataset.chipTipo && filterTipo) {
      filterTipo.dataset.chipTrigger = '1';
      filterTipo.value = btn.dataset.chipTipo;
      filterTipo.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (btn.dataset.chipSort && sortBy) {
      sortBy.dataset.chipTrigger = '1';
      sortBy.value = btn.dataset.chipSort;
      sortBy.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (btn.dataset.chipPriceMax) {
      const max = parseFloat(btn.dataset.chipPriceMax);
      chipState.priceMax = Number.isFinite(max) ? max : null;
    }
    if (btn.dataset.chipBadge) {
      chipState.badge = norm(btn.dataset.chipBadge);
    }

    if (!btn.dataset.chipTipo && !btn.dataset.chipSort) {
      applyFiltersWrapped();
    }
  });
});

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
syncQuickFilters();
const typeToSection = {
  remera: 'remeras',
  denim: 'denim',
  pantalon: 'pantalones',
  short: 'shorts',
  top: 'tops',
  body: 'bodys',
  set: 'sets',
  abrigo: 'abrigos',
  vestido: 'vestidos',
  accesorio: 'accesorios'
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
const priceMax = chipState.priceMax;
const badgeFilter = chipState.badge;

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

  const priceValue = parseFloat(item.dataset.price) || 0;
  const badgeNorm = norm(item.dataset.badge);

  const match = textOk &&
    (!tipoVal  || item.dataset.tipo  === tipoVal) &&
    (!talleVal || item.dataset.talle === talleVal) &&
    (!priceMax || priceValue <= priceMax) &&
    (!badgeFilter || badgeNorm === badgeFilter);

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
  if (resultsCountEl) {
    const visibles = allProductItems.filter(el => el.style.display !== 'none').length;
    let text = visibles === 0
      ? 'Sin resultados con esos filtros.'
      : `${visibles} producto${visibles===1?'':'s'} disponible${visibles===1?'':'s'}.`;
    if (priceMax && visibles > 0) {
      text += ` · Hasta $${priceMax.toLocaleString('es-AR')}`;
    }
    if (tipoVal && filterTipo) {
      const label = filterTipo.options[filterTipo.selectedIndex]?.textContent?.trim();
      if (label) text += ` · ${label}`;
    }
    resultsCountEl.textContent = text;
    resultsCountEl.dataset.count = String(visibles);
  }
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

    if (sel === filterTipo && sel.dataset.chipTrigger !== '1') {
      chipButtons.forEach(btn => { if (btn.dataset.chipTipo) btn.classList.remove('is-active'); });
    }
    sel.dataset.chipTrigger = '';

    // Al cambiar tipo/talle, la búsqueda deja de ser el driver
    clearSearch('filter-change');
    applyFiltersWrapped();
    updateURLParams();
  });
});
if (sortBy) sortBy.addEventListener('change', () => {
  try { localStorage.setItem(LS_KEYS.sort, sortBy.value); } catch(_) {}
  if (sortBy.dataset.chipTrigger !== '1') {
    chipButtons.forEach(btn => { if (btn.dataset.chipSort) btn.classList.remove('is-active'); });
  }
  sortBy.dataset.chipTrigger = '';
  clearSearch('sort-change');
  applySortingWrapped();
  updateURLParams();
});

if (filtersResetBtn) {
  filtersResetBtn.addEventListener('click', () => {
    if (filterTipo) {
      filterTipo.value = '';
      filterTipo.dataset.chipTrigger = '';
    }
    if (filterTalle) {
      filterTalle.value = '';
    }
    if (sortBy) {
      sortBy.value = 'relevancia';
      sortBy.dataset.chipTrigger = '';
      try { localStorage.setItem(LS_KEYS.sort, 'relevancia'); } catch(_) {}
    }
    try {
      localStorage.removeItem(LS_KEYS.tipo);
      localStorage.removeItem(LS_KEYS.talle);
    } catch(_) {}
    resetChipState();
    syncQuickFilters();
    clearSearch('filters-reset');
    applyFiltersWrapped();
    applySortingWrapped();
    updateURLParams();
  });
}

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
    let cartCurrencyFormatter;
    const formatCartMoney = (value) => {
      const amount = Number.isFinite(value) ? value : 0;
      try {
        if (!cartCurrencyFormatter) {
          cartCurrencyFormatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        }
        return cartCurrencyFormatter.format(amount);
      } catch (_) {
        return '$' + Math.round(amount || 0).toString();
      }
    };
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
      if (cartTotalFab) cartTotalFab.textContent = formatCartMoney(totalPrice);

      document.querySelectorAll('[data-total-final]').forEach(el => {
        el.textContent = formatCartMoney(totalPrice);
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
  <span class="price" data-price="${item.price}">${formatCartMoney(item.price * item.qty)}</span>
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
    document.querySelectorAll('[data-open-cart]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openCartPanel();
      });
    });
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

  document.querySelectorAll('#mobile-menu a, .collection-menu a').forEach(a => {
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

  // Init cuando el DOM está listo (excepto en productos.html donde lo ocultamos)
  const shouldShowFab = () => {
    try {
      const file = (location.pathname.split('/').pop() || '').toLowerCase();
      return file !== 'productos.html' && file !== 'finalizarcompra.html';
    } catch { return true; }
  };

  const initIG = () => {
    if (shouldShowFab()) ensureIGFab();
    setupIGClickTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIG);
  } else {
    initIG();
  }
})();
