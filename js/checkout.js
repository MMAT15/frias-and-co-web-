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
  const checkoutForm     = document.getElementById('checkout-form');
  const confirmBtn       = document.getElementById('confirm-order');

  // Modal aviso IG DM
  const dmModal   = document.getElementById('dm-modal');
  const dmAckBtn  = document.getElementById('dm-ack');

  // ====== Constantes ======
  const TAX_RATE = 0.21; // IVA 21%
  const CASH_OFF = 0.10; // 10% descuento en efectivo
  const IG_USER  = 'beraclothingg'; // sin @

  // ====== Helpers ======
  const money = (n) => {
    const val = Number.isFinite(n) ? n : 0;
    try { return '$' + val.toLocaleString('es-AR', { maximumFractionDigits: 0 }); }
    catch { return '$' + Math.round(val).toString(); }
  };

  const currentPayment = () => {
    const r = document.querySelector('input[name="payment"]:checked');
    return r ? r.value : 'cash'; // 'cash' | 'mercadopago'
  };

  const currentDelivery = () => {
    const r = document.querySelector('input[name="delivery"]:checked');
    return r ? r.value : 'pickup'; // 'pickup' | 'meetup'
  };

  // Arma el texto para IG DM
  function buildIGMessage() {
    const grossTotal = cart.reduce((s,i) => s + (i.price || 0) * (i.qty || 1), 0);
    const netTotal   = grossTotal / (1 + TAX_RATE);
    const isCash     = currentPayment() === 'cash';
    const cashDisc   = isCash ? grossTotal * CASH_OFF : 0;
    const toPay      = Math.max(0, grossTotal - cashDisc);

    const lines = [];
    lines.push('¡Hola! Quiero confirmar mi pedido:');
    if (!cart.length) {
      lines.push('— (Carrito vacío)');
    } else {
      cart.forEach(i => {
        const line = (i.price || 0) * (i.qty || 1);
        lines.push(`• ${i.name} x${i.qty} — ${money(line)}`);
      });
    }
    lines.push('');
    lines.push(`Subtotal (final con IVA): ${money(grossTotal)}`);
    lines.push(`Precio sin impuestos (−21% IVA): ${money(netTotal)}`);
    if (isCash) {
      lines.push(`Descuento efectivo 10%: −${money(cashDisc)}`);
    }
    lines.push(`Total a pagar: ${money(toPay)}`);
    lines.push('');

    const deliv = currentDelivery();
    if (deliv === 'pickup') {
      lines.push('Entrega: Retiro en local');
      lines.push('Dirección: Calle 10 N° 4629, Berazategui, Buenos Aires');
    } else {
      lines.push('Entrega: Punto de encuentro (a coordinar)');
    }

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
    if (window.__igLaunch.inProgress) {
      console.warn('[checkout] IG launch already in progress — skip');
      return;
    }
    window.__igLaunch.inProgress = true;

    const url = `https://ig.me/m/${IG_USER}?text=${encodeURIComponent(text)}`;

    // Remove modal/open state if present
    try { document.body.classList.remove('dm-open'); } catch {}
    try { dmModal?.classList.remove('active'); dmModal?.setAttribute('aria-hidden','true'); } catch {}

    // Intento 1: misma pestaña (mejor en mobile)
    try {
      window.location.href = url;
    } catch {}

    // Fallback: si no cambia de visibilidad, probamos nueva pestaña
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        const win = window.open(url, '_blank');
        // Si incluso esto falla, abrimos el perfil y avisamos
        setTimeout(() => {
          if (!win || win.closed || document.visibilityState === 'visible') {
            window.open(`https://instagram.com/${IG_USER}`, '_blank');
            alert('Por si IG Direct no se abrió, te dejamos el perfil en una pestaña nueva. El resumen ya está copiado, pegalo en el chat.');
          }
        }, 400);
      }
    }, 800);
  }

  // ====== Render + Cálculo principal ======
  function calculateCheckout() {
    // 1) Renderizar lista
    if (orderList) {
      orderList.innerHTML = '';
      cart.forEach(item => {
        const line = (item.price || 0) * (item.qty || 1);
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.qty} — ${money(line)}`;
        orderList.appendChild(li);
      });
    }

    // 2) Totales
    const grossTotal = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0); // CON IVA
    const netTotal   = grossTotal / (1 + TAX_RATE); // SIN IVA

    // 3) Método de pago → descuento efectivo
    const isCash = currentPayment() === 'cash';
    const cashDiscount = isCash ? grossTotal * CASH_OFF : 0;

    // 4) Total final (sin envío)
    const toPay = Math.max(0, grossTotal - cashDiscount);

    // 5) Pintar
    if (summarySubtotal) summarySubtotal.textContent = money(grossTotal);
    if (summaryNet)      summaryNet.textContent      = money(netTotal);
    if (summaryCashDisc) summaryCashDisc.textContent = (isCash ? '− ' : '') + money(cashDiscount);
    if (summaryTotal)    summaryTotal.textContent    = money(toPay);
  }

  // ====== Eventos ======
  // Cambiar método de pago actualiza el descuento
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', calculateCheckout, { passive: true });
  });

  // Submit del checkout → copiar texto, mostrar modal y redirigir a IG al confirmar
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset launch state and clear old timers
      window.__igLaunch.inProgress = false;
      if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }

      const msg = buildIGMessage();
      const copied = await copyToClipboard(msg);

      // Si hay modal, mostrarlo; si no, redirigir directo
      if (dmModal && dmAckBtn) {
        let seconds = 15;
        dmModal.classList.add('active');
        dmModal.setAttribute('aria-hidden', 'false');
        try { document.body.classList.add('dm-open'); } catch {}
        const timerEl = dmModal.querySelector('#dm-timer');
        if (timerEl) timerEl.textContent = seconds;

        // Clear any previous countdown
        if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }

        window.__igLaunch.timer = setInterval(() => {
          seconds--;
          if (timerEl) timerEl.textContent = Math.max(0, seconds);
          if (seconds <= 0) {
            clearInterval(window.__igLaunch.timer);
            window.__igLaunch.timer = null;
            // Close modal and body lock, then open IG (single-run guarded)
            try { document.body.classList.remove('dm-open'); } catch {}
            dmModal.classList.remove('active');
            dmModal.setAttribute('aria-hidden', 'true');
            openIGWithText(msg);
          }
        }, 1000);

        try { dmAckBtn.focus(); } catch {}

        // Click en "Entendido" ⇒ ir a IG con el texto
        const onAck = () => {
          if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }
          try { document.body.classList.remove('dm-open'); } catch {}
          dmModal.classList.remove('active');
          dmModal.setAttribute('aria-hidden', 'true');
          console.log('[checkout] Opening IG DM with text length:', msg.length);
          openIGWithText(msg);
        };
        dmAckBtn.addEventListener('click', onAck, { once: true });

        // Si la copia falló, avisamos explícitamente dentro del modal (si hay un contenedor)
        const helper = dmModal.querySelector('.dm-helper');
        if (helper) {
          helper.textContent = copied
            ? 'Ya copiamos el resumen. En el chat, solo pegá y enviá.'
            : 'No pudimos copiar automáticamente. Al abrir el chat, pegá manualmente el resumen que verás en pantalla.';
        }
        if (helper && typeof seconds === 'number') {
          helper.setAttribute('data-seconds', String(seconds));
        }
      } else {
        // Sin modal: redirigimos directo
        // Ensure we don't have an active timer and not already launched
        if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }
        window.__igLaunch.inProgress = false;
        openIGWithText(msg);
      }
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
      }
    });
  }

  // Botón de arrepentimiento (si existe)
  const cancelBtn = document.getElementById('cancel-checkout');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  // ====== Inicializar ======
  calculateCheckout();

  document.addEventListener('visibilitychange', () => {
    // If the page becomes visible again, allow a fresh launch on next submit
    if (document.visibilityState === 'visible') {
      window.__igLaunch.inProgress = false;
      if (window.__igLaunch.timer) { clearInterval(window.__igLaunch.timer); window.__igLaunch.timer = null; }
    }
  });
});