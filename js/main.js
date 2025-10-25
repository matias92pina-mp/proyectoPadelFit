document.addEventListener("DOMContentLoaded", () => {
  console.log("Sitio de Liga Pádel cargado correctamente.");
  
  // Smooth scroll para los links de navegación
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Efecto de animación al hacer scroll (opcional)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar las tarjetas de fechas para animación
  const fechaCards = document.querySelectorAll('.fecha-card');
  fechaCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Animación para las filas de la tabla
  const tableRows = document.querySelectorAll('tbody tr');
  tableRows.forEach((row, index) => {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
    observer.observe(row);
  });

  // Log para debugging
  console.log(`Se encontraron ${navLinks.length} links de navegación`);
  console.log(`Se encontraron ${fechaCards.length} tarjetas de fechas`);
  console.log(`Se encontraron ${tableRows.length} filas en la tabla`);
});
