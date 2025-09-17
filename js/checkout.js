document.addEventListener('DOMContentLoaded', () => {
  console.log('[checkout] JS loaded');
  // Global guard to avoid double IG launches
  if (!window.__igLaunch) window.__igLaunch = { inProgress: false, timer: null };

  // Kill any pre-existing autolaunch anchors/buttons that might trigger IG immediately
  const strayAuto = document.getElementById('ig-autolaunch') || document.querySelector('.ig-autolaunch');
  if (strayAuto) {
    strayAuto.addEventListener('click', (e)=> e.preventDefault(), { passive: false });
    strayAuto.style.display = 'none';
  }
  // ====== Carrito desde LocalStorage ======
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];
  } catch (_) {
    cart = [];
  }

  // ====== Referencias DOM (IDs/clases del HTML de checkout) ======
  const orderList        = document.querySelector('.order-items');
  const summarySubtotal  = document.getElementById('summary-subtotal');      // CON IVA (precio final)
  const summaryNet       = document.getElementById('summary-net');           // SIN IVA
  const summaryCashDisc  = document.getElementById('summary-cash-discount'); // Descuento efectivo
  const summaryTotal     = document.getElementById('summary-total');         // Total a pagar
  const subtotalEl       = document.getElementById('subtotal');
  const totalEl          = document.getElementById('total');
  const checkoutForm     = document.getElementById('checkout-form');
  const confirmBtn       = document.getElementById('btn-confirmar');

  // Modal aviso IG DM
  // ====== Constantes ======
  const TAX_RATE = 0.21; // IVA 21%
  const CASH_OFF = 0.10; // 10% descuento en efectivo
  const IG_USER  = 'beraclothingg'; // sin @

  // ====== Helpers ======
  let currencyFormatter;
  try {
    currencyFormatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  } catch {
    currencyFormatter = null;
  }

  const money = (n) => {
    const val = Number.isFinite(n) ? n : 0;
    if (currencyFormatter) {
      try { return currencyFormatter.format(val); }
      catch { /* noop */ }
    }
    return '$' + Math.round(val).toString();
  };

  const currentPayment = () => {
    const r = document.querySelector('input[name="metodo_pago"]:checked');
    return r ? r.value : 'efectivo'; // 'efectivo' | 'mp'
  };

  // Datos de contacto opcionales (persistentes)
  function readContact() {
    const g = (sel) => (document.querySelector(sel)?.value || '').trim();
    const data = {
      nombre: g('#ck-nombre'),
      telefono: g('#ck-telefono'),
      email: g('#ck-email'),
      notas: g('#ck-notas')
    };
    try { localStorage.setItem('checkout_customer', JSON.stringify(data)); } catch {}
    return data;
  }
  function restoreContact() {
    try {
      const raw = localStorage.getItem('checkout_customer');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (data.nombre)   document.querySelector('#ck-nombre')?.setAttribute('value', data.nombre);
        if (data.telefono) document.querySelector('#ck-telefono')?.setAttribute('value', data.telefono);
        if (data.email)    document.querySelector('#ck-email')?.setAttribute('value', data.email);
        if (data.notas)    document.querySelector('#ck-notas')?.append(document.createTextNode(data.notas));
      }
    } catch {}
  }

  // Arma el texto para IG DM
  function buildIGMessage() {
    const grossTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    const isCash     = currentPayment() === 'efectivo';
    const cashDisc   = isCash ? grossTotal * CASH_OFF : 0;
    const toPay      = Math.max(0, grossTotal - cashDisc);
    const contact    = readContact();

    const items = cart.length
      ? cart.map((item) => {
          const qty = item.qty || 1;
          const lineTotal = money((item.price || 0) * qty);
          const priceText = lineTotal ? ` (${lineTotal})` : '';
          return `• ${item.name} x${qty}${priceText}`;
        })
      : ['• (Carrito vacío)'];

    const medio = isCash
      ? 'Efectivo (10% OFF aplicado)'
      : 'Mercado Pago (sin descuento)';

    const lines = [
      'Resumen de pedido – BERA Clothing',
      ...items,
      `Método de pago: ${medio}`,
      `Total a abonar: ${money(toPay)}`
    ];

    if (contact.nombre || contact.telefono || contact.email || contact.notas) {
      lines.push('');
      if (contact.nombre)   lines.push(`Nombre: ${contact.nombre}`);
      if (contact.telefono) lines.push(`Teléfono: ${contact.telefono}`);
      if (contact.email)    lines.push(`Email: ${contact.email}`);
      if (contact.notas)    lines.push(`Notas: ${contact.notas}`);
    }

    lines.push('—');
    lines.push('Pegá este resumen en el DM así confirmamos el pedido. ¡Gracias!');

    return lines.join('\n');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback: crea un textarea temporal
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  function openIGWithText(text) {
    window.__igLaunch.inProgress = false;
    window.location.href = `https://instagram.com/${IG_USER}`;
  }

  // ====== Render + Cálculo principal ======
  function calculateCheckout() {
    // 1) Renderizar lista
    if (orderList) {
      orderList.innerHTML = '';
      cart.forEach(item => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const price = Math.max(0, Number(item.price) || 0);
        const line = price * qty;
        const li = document.createElement('li');
        li.textContent = `${item.name} x${qty} — ${money(line)}`;
        orderList.appendChild(li);
      });
    }

    // 2) Totales
    const grossTotal = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0); // CON IVA
    const netTotal   = grossTotal / (1 + TAX_RATE); // SIN IVA

    // 3) Método de pago → descuento efectivo
    const isCash = currentPayment() === 'efectivo';
    const cashDiscount = isCash ? grossTotal * CASH_OFF : 0;

    // 4) Total final (sin envío)
    const toPay = Math.max(0, grossTotal - cashDiscount);

    // 5) Pintar
    if (subtotalEl) {
      subtotalEl.dataset.subtotal = String(grossTotal);
      subtotalEl.textContent = money(grossTotal);
    } else if (summarySubtotal) {
      summarySubtotal.textContent = money(grossTotal);
    }

    if (summaryNet) summaryNet.textContent = money(netTotal);

    if (summaryCashDisc) {
      summaryCashDisc.textContent = isCash ? ('− ' + money(cashDiscount)) : '—';
    }

    if (totalEl) {
      totalEl.dataset.total = String(toPay);
      totalEl.textContent = money(toPay);
    } else if (summaryTotal) {
      summaryTotal.textContent = money(toPay);
    }

    // Mantener habilitado el botón aunque el carrito esté vacío
    // (permitimos que el usuario consulte por DM de todos modos)
    if (typeof confirmBtn !== 'undefined' && confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.setAttribute('aria-disabled', 'false');
    }
  }

  // ====== Eventos ======
  // Cambiar método de pago actualiza el descuento
  document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
    radio.addEventListener('change', calculateCheckout, { passive: true });
  });

  // Submit del checkout → copiar texto, mostrar modal y redirigir a IG al confirmar
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch {}

      window.__igLaunch.inProgress = false;
      if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }

      const resumen = buildIGMessage();
      await copyToClipboard(resumen);
      openIGWithText(resumen);
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      // Forzamos el mismo flujo del submit
      e.preventDefault();
      if (checkoutForm) {
        // Disparamos el evento submit para reutilizar la lógica existente
        const ev = new Event('submit', { bubbles: true, cancelable: true });
        checkoutForm.dispatchEvent(ev);
      } else {
        // Fallback absoluto si por alguna razón el form no está
        const msg = buildIGMessage();
        openIGWithText(msg);
      }
    });
  }

  // Botón de arrepentimiento (si existe)
  const cancelBtn = document.getElementById('cancel-checkout');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  // ====== Inicializar ======
  restoreContact();
  calculateCheckout();

  document.addEventListener('visibilitychange', () => {
    // If the page becomes visible again, allow a fresh launch on next submit
    if (document.visibilityState === 'visible') {
      window.__igLaunch.inProgress = false;
      if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }
    }
  });

  // Mantener sincronizado si cambia el carrito en otra pestaña
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      try {
        const next = JSON.parse(e.newValue || '[]');
        cart = Array.isArray(next) ? next : [];
      } catch {
        cart = [];
      }
      calculateCheckout();
    }
  });
});
