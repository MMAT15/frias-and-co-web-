document.addEventListener('DOMContentLoaded', () => {
  // ===== Carrito desde LocalStorage =====
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];
  } catch (_) {
    cart = [];
  }

  // ===== Referencias DOM (nuevos IDs) =====
  const orderList        = document.querySelector('.order-items');
  const summarySubtotal  = document.getElementById('summary-subtotal');  // CON IVA (precio final)
  const summaryNet       = document.getElementById('summary-net');       // SIN IVA
  const summaryCashDisc  = document.getElementById('summary-cash-discount'); // Descuento efectivo
  const summaryTotal     = document.getElementById('summary-total');     // Total a pagar
  const checkoutForm     = document.getElementById('checkout-form');

  // ===== Constantes =====
  const TAX_RATE   = 0.21; // IVA 21%
  const CASH_OFF   = 0.10; // 10% descuento en efectivo

  // ===== Helper de moneda =====
  const fmt = (n) => {
    try { return '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 }); }
    catch { return '$' + Math.round(n).toString(); }
  };

  // ===== Render + Cálculo principal =====
  function calculateCheckout() {
    // 1) Renderizar lista
    if (orderList) {
      orderList.innerHTML = '';
      cart.forEach(item => {
        const line = (item.price || 0) * (item.qty || 1);
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.qty} — ${fmt(line)}`;
        orderList.appendChild(li);
      });
    }

    // 2) Totales
    const grossTotal = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0); // CON IVA
    const netTotal   = grossTotal / (1 + TAX_RATE); // SIN IVA

    // 3) Método de pago → descuento efectivo
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const isCash = selectedPayment && selectedPayment.value === 'cash';
    const cashDiscount = isCash ? grossTotal * CASH_OFF : 0;

    // 4) Total final (sin envío)
    const toPay = Math.max(0, grossTotal - cashDiscount);

    // 5) Pintar
    if (summarySubtotal) summarySubtotal.textContent = fmt(grossTotal);
    if (summaryNet)      summaryNet.textContent      = fmt(netTotal);
    if (summaryCashDisc) summaryCashDisc.textContent = (isCash ? '− ' : '') + fmt(cashDiscount);
    if (summaryTotal)    summaryTotal.textContent    = fmt(toPay);
  }

  // ===== Eventos =====
  // Cambiar método de pago actualiza el descuento
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', calculateCheckout, { passive: true });
  });

  // Botón de arrepentimiento
  const cancelBtn = document.getElementById('cancel-checkout');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
  }

  // Submit del checkout
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const method = checkoutForm.payment.value;
      if (method === 'mercadopago') {
        // Aquí dispararías el flujo de Mercado Pago si corresponde.
        alert('Redirigiendo a Mercado Pago…');
        return;
      }
      // Efectivo u otros métodos offline
      alert('¡Gracias! Tu pedido fue recibido.');
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    });
  }

  // ===== Inicializar =====
  calculateCheckout();
});