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
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    const filterTipo = document.getElementById('filter-tipo');
    const filterTalle = document.getElementById('filter-talle');
    const sortBy = document.getElementById('sort-by');
    const items = Array.from(productsGrid.children);
    function applyFilters() {
      let filtered = items.filter(it => {
        return (!filterTipo.value || it.dataset.tipo === filterTipo.value) &&
               (!filterTalle.value || it.dataset.talle === filterTalle.value);
      });
      // sort
      filtered.sort((a,b) => {
        const pa = parseFloat(a.dataset.precio), pb = parseFloat(b.dataset.precio);
        switch (sortBy.value) {
          case 'precio-asc': return pa - pb;
          case 'precio-desc': return pb - pa;
          default: return 0;
        }
      });
      productsGrid.innerHTML = '';
      filtered.forEach(f => productsGrid.appendChild(f));
    }
    [filterTipo,filterTalle,sortBy].forEach(el => el.addEventListener('change', applyFilters));
    applyFilters();
  }

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
      const prod = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price)||0
      };
      addToCart(prod);
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