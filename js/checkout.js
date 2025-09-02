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
    return /iPad|iPhone|iPod/.test(ua) || /Macintosh/.test(ua) && 'ontouchend' in document;
  }
  function isSafari() {
    const ua = navigator.userAgent;
    // Detect Mobile & Desktop Safari (avoid Chrome/Edge on iOS which include "Safari" too)
    const isSafariLike = /^((?!chrome|crios|fxios|edgios|android).)*safari/i.test(ua);
    return isSafariLike;
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
    const grossTotal = cart.reduce((s,i) => s + (i.price || 0) * (i.qty || 1), 0);
    const netTotal   = grossTotal / (1 + TAX_RATE);
    const isCash     = currentPayment() === 'cash';
    const cashDisc   = isCash ? grossTotal * CASH_OFF : 0;
    const toPay      = Math.max(0, grossTotal - cashDisc);
    const contact    = readContact();

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

    // Datos de contacto (si se cargaron)
    if (contact.nombre)   lines.push(`Nombre: ${contact.nombre}`);
    if (contact.telefono) lines.push(`Teléfono: ${contact.telefono}`);
    if (contact.email)    lines.push(`Email: ${contact.email}`);
    if (contact.notas)    lines.push(`Notas: ${contact.notas}`);

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

    // Prefer universal web link (ig.me) — it should open the DM thread in the app on most platforms.
    const igMe       = `https://ig.me/m/${IG_USER}?text=${encodeURIComponent(text)}`;
    const userDeep   = `instagram://user?username=${IG_USER}`;
    const dmDeep     = `instagram://direct/new?text=${encodeURIComponent(text)}`; // not guaranteed
    const igProfile  = `https://instagram.com/${IG_USER}`;
    const igProfileU = `https://instagram.com/_u/${IG_USER}`;

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
      const ok = tryNavigate(igProfileU, '_blank') || tryNavigate(igProfile, '_blank');
      if (!ok) {
        alert('No pudimos abrir Instagram automáticamente. Abrí Instagram y buscá @' + IG_USER + '. Ya copiamos tu mensaje para que lo pegues.');
      }
    };

    // iOS/Safari/WebViews can be picky. Strategy:
    // 1) Try ig.me universal link first (best chance to open DM thread).
    // 2) If still visible, try app user deep link.
    // 3) If still visible, as a last resort try DM deep link.
    // 4) Finally, open profile page.
    const isiOS = isIOS();
    const inApp = isInAppBrowser();
    const safari = isSafari();

    // Always start with ig.me
    tryNavigate(igMe);

    // Chain fallbacks only if the page remains visible
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        // on iOS / Safari / In-app we prefer app user deep link first
        if (isiOS || safari || inApp) {
          tryNavigate(userDeep);
          setTimeout(() => {
            if (document.visibilityState === 'visible') {
              tryNavigate(dmDeep);
              setTimeout(() => { if (document.visibilityState === 'visible') onFailAll(); }, 600);
            }
          }, 700);
        } else {
          // Desktop/Android: try user deep link then fall back
          tryNavigate(userDeep);
          setTimeout(() => { if (document.visibilityState === 'visible') onFailAll(); }, 800);
        }
      }
    }, 800);
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
    const isCash = currentPayment() === 'cash';
    const cashDiscount = isCash ? grossTotal * CASH_OFF : 0;

    // 4) Total final (sin envío)
    const toPay = Math.max(0, grossTotal - cashDiscount);

    // 5) Pintar
    if (summarySubtotal) summarySubtotal.textContent = money(grossTotal);
    if (summaryNet)      summaryNet.textContent      = money(netTotal);
    if (summaryCashDisc) summaryCashDisc.textContent = isCash ? ('− ' + money(cashDiscount)) : '—';
    if (summaryTotal)    summaryTotal.textContent    = money(toPay);

    // Mantener habilitado el botón aunque el carrito esté vacío
    // (permitimos que el usuario consulte por DM de todos modos)
    if (typeof confirmBtn !== 'undefined' && confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.setAttribute('aria-disabled', 'false');
    }
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

      try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch {}

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

        // Mostrar preview del mensaje
        const preview = dmModal.querySelector('#dm-preview');
        if (preview) {
          preview.value = msg;
        }
        // Copiar desde botón
        const copyBtn = dmModal.querySelector('#dm-copy');
        if (copyBtn) {
          copyBtn.onclick = async () => { await copyToClipboard(preview?.value || msg); };
        }

        // Focus trap básico dentro del modal
        const focusTrap = (ev) => {
          if (ev.key !== 'Tab') return;
          const nodes = Array.from(dmModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hasAttribute('disabled'));
          if (!nodes.length) return;
          const first = nodes[0];
          const last = nodes[nodes.length - 1];
          if (ev.shiftKey && document.activeElement === first) { last.focus(); ev.preventDefault(); }
          else if (!ev.shiftKey && document.activeElement === last) { first.focus(); ev.preventDefault(); }
        };
        dmModal.addEventListener('keydown', focusTrap);

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
              if (helper) helper.textContent = 'En iPhone, tocá “Abrir Instagram”. Se abrirá el chat y ya podés pegar el resumen.';
              if (dmAckBtn) dmAckBtn.textContent = 'Abrir Instagram';
              try { dmAckBtn.focus(); } catch {}
            } else {
              // Close modal and auto‑open on desktop / Android browsers
              try { document.body.classList.remove('dm-open'); } catch {}
              dmModal.classList.remove('active');
              dmModal.setAttribute('aria-hidden', 'true');
              dmModal.removeEventListener('keydown', focusTrap);
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
          dmModal.removeEventListener('keydown', focusTrap);
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
