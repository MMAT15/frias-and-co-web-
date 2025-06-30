// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 script.js cargado y DOM listo');

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
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
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

  // SCROLLSPY
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

  // INITIALIZE SWIPERS
  if (typeof Swiper !== 'undefined') {
    // Hero
    new Swiper('.swiper-hero .swiper-container', {
      loop: true,
      speed: 800,
      effect: 'fade',
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        newsletterResp.textContent = 'Ingresa un correo válido.';
        newsletterResp.style.color = 'red';
      } else {
        newsletterResp.textContent = '¡Suscripción exitosa! Gracias.';
        newsletterResp.style.color = 'green';
        newsletterForm.reset();
      }
    });
  }

  // PRODUCTS FILTERING
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    const filterTipo = document.getElementById('filter-tipo');
    const filterTalle = document.getElementById('filter-talle');
    const sortBySelect = document.getElementById('sort-by');
    const productItems = Array.from(productsGrid.children);

    function applyFilters() {
      const tipoVal = filterTipo.value;
      const talleVal = filterTalle.value;
      const sortBy = sortBySelect.value;
      let filtered = productItems.filter(item => {
        return (!tipoVal || item.dataset.tipo === tipoVal) &&
               (!talleVal || item.dataset.talle === talleVal);
      });
      filtered.sort((a, b) => {
        const pa = parseFloat(a.dataset.precio) || 0;
        const pb = parseFloat(b.dataset.precio) || 0;
        if (sortBy === 'precio-asc') return pa - pb;
        if (sortBy === 'precio-desc') return pb - pa;
        return 0;
      });
      productsGrid.innerHTML = '';
      filtered.forEach(item => productsGrid.appendChild(item));
    }

    filterTipo.addEventListener('change', applyFilters);
    filterTalle.addEventListener('change', applyFilters);
    sortBySelect.addEventListener('change', applyFilters);
    applyFilters();
  }

  // SHOPPING CART
  const cartToggleBtn = document.querySelector('.cart-toggle');
  const cartCountEl = document.querySelector('.cart-count');
  const cartModalElm = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartCount() {
    const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalCount;
  }
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    updateCartCount();
    // Show confirmation toast
    showToast('Se ha añadido al carrito');
  }

  // Toast message utility
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    // Automatically remove after 2 seconds
    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 2000);
  }

  updateCartCount();

  // Delegate add-to-cart clicks
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    const product = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price) || 0
    };
    addToCart(product);
  });

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
    cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i.id !== btn.dataset.id);
        saveCart();
        updateCartCount();
        renderCartPage();
      });
    });
  }

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
  }
});