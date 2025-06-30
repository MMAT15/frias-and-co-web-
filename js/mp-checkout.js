// js/mp-checkout.js

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('mp-button-container');
  if (!container) return;

  // 0) Load public key from global config
  const MP_PUBLIC_KEY = window.MP_PUBLIC_KEY || '';
  if (!MP_PUBLIC_KEY) {
    container.innerHTML = '<p>Error: Public key de Mercado Pago no configurada.</p>';
    return;
  }

  // 1) Retrieve cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    container.innerHTML = '<p>Tu carrito está vacío. Agrega productos para pagar.</p>';
    return;
  }

  // 2) Initialize Mercado Pago SDK
  const mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });

  // 3) Prepare items payload
  const items = cart.map(item => ({
    title: item.name,
    unit_price: Number(item.price),
    quantity: item.qty
  }));

  // 4) Show loading spinner
  container.innerHTML = '<div class="mp-spinner">Cargando pago...</div>';

  // 5) Create preference via backend
  try {
    const response = await fetch('/crear_preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const { id: preferenceId } = data;

    // 6) Render Mercado Pago button
    mp.checkout({
      preference: { id: preferenceId },
      render: {
        container: '#mp-button-container',
        label: 'Pagar con Mercado Pago'
      }
    });
  } catch (error) {
    console.error('Error en checkout MP:', error);
    container.innerHTML = `
      <p>No se pudo cargar Mercado Pago. Por favor intenta nuevamente.</p>
      <button id="mp-retry-btn" class="btn btn-secondary">Reintentar</button>
    `;
    document.getElementById('mp-retry-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
});