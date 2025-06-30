document.addEventListener('DOMContentLoaded', () => {
    // Leer carrito de LocalStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderList         = document.querySelector('.order-items');
    const TAX_RATE          = 0.21;
    const summaryNet        = document.getElementById('summary-subtotal');
    const summaryTax        = document.getElementById('summary-tax');
    const summaryShip       = document.getElementById('summary-shipping');
    const summaryTotal      = document.getElementById('summary-total');
    const zipInput          = document.getElementById('zip-input');
    const shippingContainer = document.getElementById('shipping-methods');
  
    // Configuraciones de envío por zona postal
    const shippingConfigs = [
      {
        name: 'gratis-local',
        range: zip => /^(1884|1878|1882|1900|1901|1902|1903|1904)$/.test(zip),
        standard: { cost: 0,   days: '1–2 días' },
        express:  { cost: 300, days: 'mismo día' }
      },
      {
        name: 'gba',
        range: zip => /^(18[5-9]\d|19[0-4]\d)$/.test(zip),
        standard: { cost: 500, days: '2–4 días' },
        express:  { cost: 900, days: '1–2 días' }
      },
      {
        name: 'caba',
        range: zip => /^1(0\d{2}|1\d{2}|2\d{2}|3\d{2}|4\d{2})$/.test(zip),
        standard: { cost: 600, days: '2–3 días' },
        express:  { cost:1000,days: '1 día' }
      },
      {
        name: 'resto-prov',
        range: zip => /^[2-9]\d{3}$/.test(zip),
        standard: { cost: 800, days: '4–6 días' },
        express:  { cost:1200,days: '2–3 días' }
      }
    ];
  
    // Actualiza las opciones de envío según el código postal
    function updateShippingOptions() {
      if (!zipInput || !shippingContainer) return;
      const zip = zipInput.value.trim();
      const cfg = shippingConfigs.find(c => c.range(zip)) || shippingConfigs[3];
  
      shippingContainer.querySelectorAll('label').forEach(label => {
        const radio = label.querySelector('input[name="shipping"]');
        const type  = radio.value;
        let detail;
        if (type === 'pickup') {
          radio.dataset.cost = 0;
          detail = 'Gratis';
        } else {
          const ship = cfg[type];
          radio.dataset.cost = ship.cost;
          detail = `${ship.days} – $${ship.cost}`;
        }
        label.querySelector('.option-detail').textContent = detail;
      });
  
      calculateCheckout();
    }
  
    // Renderiza la lista de ítems y calcula totales
    function calculateCheckout() {
      // 1) Renderizar lista
      if (orderList) {
        orderList.innerHTML = '';
        cart.forEach(item => {
          const grossLine = item.price * item.qty;
          const li = document.createElement('li');
          li.textContent = `${item.name} x${item.qty} — $${grossLine.toFixed(2)}`;
          orderList.appendChild(li);
        });
      }
  
      // 2) Calcular neto e impuestos
      let netTotal   = 0;
      let taxTotal   = 0;
      let grossTotal = 0;
      cart.forEach(item => {
        const gross = item.price * item.qty;
        const net   = gross / (1 + TAX_RATE);
        const tax   = gross - net;
        netTotal   += net;
        taxTotal   += tax;
        grossTotal += gross;
      });
  
      // 3) Obtener costo de envío
      let shipCost = 0;
      document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        if (radio.checked) shipCost = parseFloat(radio.dataset.cost) || 0;
      });
  
      // 4) Mostrar en DOM
      summaryNet.textContent   = `$${netTotal.toFixed(2)}`;
      summaryTax.textContent   = `$${taxTotal.toFixed(2)}`;
      summaryShip.textContent  = `$${shipCost.toFixed(2)}`;
      summaryTotal.textContent = `$${(grossTotal + shipCost).toFixed(2)}`;
    }
  
    // Asociar eventos
    if (zipInput) {
      zipInput.addEventListener('input',  updateShippingOptions);
      zipInput.addEventListener('change', updateShippingOptions);
    }
    document.querySelectorAll('input[name="shipping"]').forEach(radio =>
      radio.addEventListener('change', calculateCheckout)
    );
  
    // Botón de arrepentimiento
    const cancelBtn = document.getElementById('cancel-checkout');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => window.location.href = 'index.html');
    }
  
    // Gestión del formulario de checkout
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', e => {
        e.preventDefault();
        const method = checkoutForm.payment.value;
        if (method === 'mercadopago') {
          // Aquí dispararías el flujo MP (ya configurado en mp-checkout.js)
          return;
        }
        // Métodos offline
        alert('¡Gracias! Tu pedido fue recibido.');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      });
    }
  
    // Inicializar
    updateShippingOptions();
  });