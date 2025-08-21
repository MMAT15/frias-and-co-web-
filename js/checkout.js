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

  // ====== Device / browser helpers ======
  function isIOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(ua);
  }
  function isSafari() {
    const ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
  }
  function isInAppBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    // Heuristics for in-app webviews that often block auto-deeplinks
    return (
      ua.includes('fbav') || ua.includes('instagram') || ua.includes('line') ||
      ua.includes('twitter') || ua.includes('wv') || ua.includes('gsa')
    );
  }

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

    // Prefer deep links first when available (iOS requires a user gesture to succeed)
    const dmDeepLink = `instagram://direct/new?text=${encodeURIComponent(text)}`; // may not work on all builds
    const userDeepLink = `instagram://user?username=${IG_USER}`;
    const igMe = `https://ig.me/m/${IG_USER}?text=${encodeURIComponent(text)}`;
    const igProfile = `https://instagram.com/${IG_USER}`;

    // Close modal state if visible
    try { document.body.classList.remove('dm-open'); } catch {}
    try { dmModal?.classList.remove('active'); dmModal?.setAttribute('aria-hidden','true'); } catch {}

    const tryNavigate = (url, target) => {
      try {
        if (target === '_blank') {
          const w = window.open(url, '_blank');
          return !!w;
        }
        window.location.href = url;
        return true;
      } catch {
        return false;
      }
    };

    const onFailAll = () => {
      // Last resort: open profile and inform user
      const ok = tryNavigate(igProfile, '_blank');
      if (!ok) {
        alert('No pudimos abrir Instagram automáticamente. Abrí Instagram y buscá @' + IG_USER + '. Ya copiamos tu mensaje para que lo pegues.');
      }
    };

    // STRATEGY
    // 1) On iOS: custom schemes often need a *direct tap*. We'll still try in the current tab.
    if (isIOS()) {
      // First try the DM deep link, then the profile deep link, then ig.me as web fallback
      const ok1 = tryNavigate(dmDeepLink);
      // If we are still visible shortly after, chain the fallback attempts
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          const ok2 = tryNavigate(userDeepLink);
          setTimeout(() => {
            if (document.visibilityState === 'visible') {
              const ok3 = tryNavigate(igMe);
              setTimeout(() => { if (document.visibilityState === 'visible') onFailAll(); }, 500);
            }
          }, 500);
        }
      }, 600);
      return;
    }

    // 2) Non‑iOS: try web universal link first, then app links
    const okWeb = tryNavigate(igMe);
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        const okApp = tryNavigate(userDeepLink);
        setTimeout(() => { if (document.visibilityState === 'visible') onFailAll(); }, 500);
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

            const helper = dmModal.querySelector('.dm-helper');
            // On iOS (and many in‑app browsers), auto‑open is unreliable unless triggered by a tap.
            if (isIOS() || isInAppBrowser() || isSafari()) {
              // Keep the modal open and ask for a tap
              if (helper) helper.textContent = 'En iPhone, para abrir Instagram tocá “Abrir Instagram” y se pegará el resumen.';
              // Turn the ACK button into an explicit opener
              if (dmAckBtn) dmAckBtn.textContent = 'Abrir Instagram';
              try { dmAckBtn.focus(); } catch {}
            } else {
              // Close modal and auto‑open on desktop / Android browsers
              try { document.body.classList.remove('dm-open'); } catch {}
              dmModal.classList.remove('active');
              dmModal.setAttribute('aria-hidden', 'true');
              openIGWithText(msg);
            }
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
        // If already on iOS, hint right away
        if ((isIOS() || isInAppBrowser() || isSafari()) && dmAckBtn) {
          dmAckBtn.textContent = 'Abrir Instagram';
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