document.addEventListener('DOMContentLoaded', () => {
    // Navegación responsiva
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  
    // Swiper novedades
    new Swiper('.swiper-novedades', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  
    // Swiper testimonios
    new Swiper('.swiper-testimonios', {
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      autoplay: { delay: 5000 }
    });
  
    // Formulario de contacto
    const form = document.getElementById('form-contacto');
    const respuesta = document.getElementById('form-respuesta');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();
      if (!nombre || !email || !mensaje) {
        respuesta.textContent = 'Por favor completa todos los campos.';
        return;
      }
      respuesta.textContent = `¡Gracias por tu mensaje, ${nombre}! Te contactaremos pronto.`;
      form.reset();
    });
  
    // Botón volver arriba
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) backToTop.style.display = 'block';
      else backToTop.style.display = 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  