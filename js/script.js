document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 script.js cargado');

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

if (collectionToggle && collectionMenu && collectionOverlay && collectionClose) {

  const lockScroll   = () => { document.body.style.overflow = 'hidden'; };
  const unlockScroll = () => { document.body.style.overflow = '';       };

  const openMenu  = () => {
    dropClothingEmojis();   // 🎉 lluvia de emojis
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
  collectionClose .addEventListener('click', closeMenu);
  collectionOverlay.addEventListener('click', closeMenu);

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
  
  /* --------------------------------------------------
     Falling Clothing Emojis 🎉
  -------------------------------------------------- */
  function dropClothingEmojis() {
    const emojis = ['👚','👕','👗','🧢','🥼','👔','👖'];
    const spawnDuration = 2000;   // ms de generación
    const fallDuration  = 4000;   // ms caída
    const spawnEvery    = 120;    // intervalo entre emojis

    const start = Date.now();
    const spawner = setInterval(() => {
      if (Date.now() - start > spawnDuration) clearInterval(spawner);
      createEmoji();
    }, spawnEvery);

    function createEmoji() {
      const span = document.createElement('span');
      span.className = 'fall-emoji';
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = Math.random() * 100 + 'vw';
      span.style.fontSize = (20 + Math.random() * 16) + 'px';
      span.style.setProperty('--emoji-duration',
                              (fallDuration + Math.random() * 1500) + 'ms');
      document.body.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    }
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
      description: 'Gorro tejido color rosa, suave y abrigado, perfecto para el invierno.',
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
      details: 'Talle: S‑XL<br>Tela: Algodón peinado 24/1<br>Color: Blanco con print',
      description: 'Remera manga corta con estampa “Shift”. Corte regular y tacto suave.',
      images: [
        'assets/images/Gorra.png',
        'assets/images/Gorra.png',
        'assets/images/Gorra.png'
      ]
    },
    'remera-dibujo': {
      title: 'Remera Dibujo',
      price: '$21.200',
      details: 'Talle: S‑XL<br>Tela: Algodón 100%<br>Estampa: Dibujo artístico',
      description: 'Remera básica con ilustración frontal impresa en serigrafía eco.',
      images: [
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png',
        'assets/images/Gorroinv.png'
      ]
    },
    'buzo-gris': {
      title: 'Buzo Gris',
      price: '$58.200',
      details: 'Talle: XL<br>Tela: Frisa premium 320 g<br>Corte: Oversize',
      description: 'Buzo unisex oversize color gris, interior súper suave para días fríos.',
      images: [
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png',
        'assets/images/Buzoxl.png'
      ]
    },
    'buzo-over': {
      title: 'Buzo Over',
      price: '$34.500',
      details: 'Talle: L<br>Tela: French Terry<br>Fit: Oversize relajado',
      description: 'Buzo liviano oversize con cuello redondo y terminaciones en rib.',
      images: [
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png',
        'assets/images/RemeraL.png'
      ]
    },
    'pantalon-rosa': {
      title: 'Pantalón Rosa',
      price: '$45.000',
      details: 'Talle: S<br>Tela: Gabardina stretch<br>Corte: Cargo slim',
      description: 'Pantalón cargo rosa con bolsillos laterales y cintura elástica.',
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
    }
  };

  const productModal      = document.getElementById('product-modal');
  const galleryWrapper    = document.getElementById('product-gallery-wrapper');
  const modalTitle        = document.getElementById('product-modal-title');
  const modalPrice        = document.getElementById('product-modal-price');
  const modalDescription  = document.getElementById('product-modal-description');
  const modalCloseBtn     = document.querySelector('.product-modal-close');

  if (productModal) {
    // Override buttons to open modal
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
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
        productGallerySwiper.update();
        productGallerySwiper.slideTo(0);
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
    }

    function closeProductModal() {
      productModal.classList.remove('show');
      productModal.setAttribute('aria-hidden','true');
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
        if (mainNav.classList.contains('show')) {
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

    allProductItems.forEach(item => {
      const match =
        (!tipoVal  || item.dataset.tipo  === tipoVal) &&
        (!talleVal || item.dataset.talle === talleVal);
      item.style.display = match ? '' : 'none';
    });

    applySorting(); // re‑sort visible items after filtering

    // Auto-scroll to the relevant section if a specific tipo is selected
    if (tipoVal && typeToSection[tipoVal]) {
      const targetSec = document.getElementById(typeToSection[tipoVal]);
      if (targetSec) {
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
          const pa = parseFloat(a.dataset.precio) || 0;
          const pb = parseFloat(b.dataset.precio) || 0;
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
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = document.querySelector('.cart-count');
  const updateCartCount = () => {
    const total = cart.reduce((sum,i) => sum + i.qty, 0);
    if (cartCount) cartCount.textContent = total;
  };
  const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
  const addToCart = prod => {
    const ex = cart.find(i=>i.id===prod.id);
    if (ex) ex.qty++;
    else cart.push({ ...prod, qty:1 });
    saveCart(); updateCartCount();
  };
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
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
    });
  });
  updateCartCount();

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
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
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