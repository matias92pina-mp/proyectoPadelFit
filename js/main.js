// IDs de las Google Sheets
const SHEET_ID_POSICIONES = '10YBQi99B5qfk1xAlobfz4jtSWduc9jUqNuy__3gLLFE';
const SHEET_ID_FECHAS = '1WeDBf4Z9Nfi8FU4CjNXkwBnFTXPTmrpQKX9g44ScNTk';

// NUEVO: Configuración para "Ver más"
const FILAS_VISIBLES_INICIAL = 5; // Mostrar solo 5 posiciones inicialmente
let todasFilasVisibles = false; // Estado: ¿están todas las filas visibles?

// Función para obtener datos de Google Sheets
async function obtenerDatosSheet(sheetId, rango) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${rango}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Google devuelve un JSONP, hay que limpiarlo
    const json = JSON.parse(text.substring(47).slice(0, -2));
    return json.table.rows;
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return null;
  }
}

// Cargar tabla de posiciones (MODIFICADO para soportar "Ver más")
async function cargarPosiciones() {
  const datos = await obtenerDatosSheet(SHEET_ID_POSICIONES, 'Sheet1');
  
  if (!datos) {
    console.error('No se pudieron cargar las posiciones');
    return;
  }

  const tbody = document.querySelector('#posiciones tbody');
  tbody.innerHTML = ''; // Limpiar contenido existente

  let filasConDatos = 0; // Contador de filas con datos reales

  // Procesar TODAS las filas (corregido: sin saltar la primera)
  datos.forEach((row, index) => {
    const cells = row.c;
    
    // Verificar que la fila tenga datos Y que no sea el header
    if (cells && cells[0] && cells[0].v && cells[0].v !== 'Pos') {
      filasConDatos++; // Incrementar contador
      
      const tr = document.createElement('tr');
      
      // NUEVO: Agregar clase para ocultar filas después de la 5ta
      if (filasConDatos > FILAS_VISIBLES_INICIAL) {
        tr.classList.add('fila-oculta'); // Ocultar inicialmente
      }
      
      // Crear celdas para cada columna
      cells.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell ? (cell.f || cell.v || '') : '';
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    }
  });

  // NUEVO: Mostrar u ocultar el botón "Ver más" según cantidad de filas
  const btnVerMas = document.getElementById('btnVerMas');
  if (filasConDatos > FILAS_VISIBLES_INICIAL) {
    btnVerMas.style.display = 'inline-flex'; // Mostrar botón
    console.log(`✅ ${filasConDatos} posiciones cargadas (mostrando ${FILAS_VISIBLES_INICIAL} inicialmente)`);
  } else {
    btnVerMas.style.display = 'none'; // Ocultar botón si hay 5 o menos
    console.log(`✅ ${filasConDatos} posiciones cargadas (todas visibles)`);
  }
}

// NUEVO: Función para expandir/colapsar la tabla
function toggleVerMas() {
  const tbody = document.querySelector('#posiciones tbody'); // Seleccionamos el tbody
  const btnVerMas = document.getElementById('btnVerMas');
  const textoVerMas = document.getElementById('textoVerMas');
  // const iconoVerMas = document.getElementById('iconoVerMas'); // No se usa en tu lógica de estado

  if (todasFilasVisibles) {
    // COLAPSAR: Ocultar filas adicionales
    tbody.classList.remove('mostrando-todas'); // Simplemente quitamos la clase del tbody
    
    textoVerMas.textContent = 'Ver todas las posiciones';
    btnVerMas.classList.remove('expandido');
    todasFilasVisibles = false;
    
    // Scroll suave hacia la tabla
    document.querySelector('#posiciones').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    
  } else {
    // EXPANDIR: Mostrar todas las filas
    tbody.classList.add('mostrando-todas'); // Simplemente agregamos la clase al tbody
    
    textoVerMas.textContent = 'Ver menos';
    btnVerMas.classList.add('expandido');
    todasFilasVisibles = true;
  }
}

// Cargar próximas fechas (SIN CAMBIOS)
async function cargarFechas() {
  const datos = await obtenerDatosSheet(SHEET_ID_FECHAS, 'Sheet1');
  
  if (!datos) {
    console.error('No se pudieron cargar las fechas');
    return;
  }

  const container = document.querySelector('.fechas-grid');
  container.innerHTML = ''; // Limpiar contenido existente

  // Procesar todas las filas excepto el header
  datos.forEach((row, index) => {
    const cells = row.c;
    
    // Verificar que la fila tenga datos Y que no sea el header
    if (cells && cells[0] && cells[0].v && cells[0].v !== 'Numero') {
      const numero = cells[0] ? cells[0].v : '';
      const fecha = cells[1] ? cells[1].v : '';
      const hora = cells[2] ? cells[2].v : '';

      const card = document.createElement('div');
      card.className = 'fecha-card';
      card.innerHTML = `
        <h3>Fecha ${numero}</h3>
        <p><strong><i class="fa-regular fa-calendar-days"></i> Fecha:</strong> ${fecha}</p>
        <p><strong><i class="fa-regular fa-clock"></i> Hora:</strong> ${hora}</p>
      `;
      
      container.appendChild(card);
    }
  });

  console.log('✅ Fechas cargadas correctamente');
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Sitio de Liga Pádel cargado correctamente.");
  
  // Cargar datos desde Google Sheets
  await cargarPosiciones();
  await cargarFechas();
  
  // NUEVO: Event listener para el botón "Ver más"
  const btnVerMas = document.getElementById('btnVerMas');
  if (btnVerMas) {
    btnVerMas.addEventListener('click', toggleVerMas);
    console.log('✅ Botón "Ver más" configurado');
  }
  
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

  // Efecto de animación al hacer scroll
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

  // Observar las tarjetas de fechas para animación (después de cargarlas)
  setTimeout(() => {
    const fechaCards = document.querySelectorAll('.fecha-card');
    fechaCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });

    // Animación para las filas de la tabla (solo las visibles inicialmente)
    const tableRows = document.querySelectorAll('tbody tr:not(.fila-oculta)');
    tableRows.forEach((row, index) => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
      observer.observe(row);
    });

    console.log(`📊 Se encontraron ${fechaCards.length} tarjetas de fechas`);
    console.log(`📊 Se encontraron ${tableRows.length} filas visibles en la tabla`);
  }, 500); // Esperar a que se carguen los datos

  console.log(`🔗 Se encontraron ${navLinks.length} links de navegación`);
});