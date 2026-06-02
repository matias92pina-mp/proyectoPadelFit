// ID de la Google Sheet con info de jugadoras
// Nota: Usaremos la misma sheet de posiciones pero leeremos más columnas si las hay
// O podés crear una nueva sheet específica para datos completos de jugadoras
const SHEET_ID_JUGADORAS = '10YBQi99B5qfk1xAlobfz4jtSWduc9jUqNuy__3gLLFE';

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
    console.error('Error al cargar datos de jugadoras:', error);
    return null;
  }
}

// Cargar y mostrar jugadoras
async function cargarJugadoras() {
  const datos = await obtenerDatosSheet(SHEET_ID_JUGADORAS, 'Sheet1');
  
  if (!datos) {
    console.error('No se pudieron cargar las jugadoras');
    mostrarError('No se pudieron cargar las jugadoras');
    return;
  }

  const container = document.getElementById('jugadorasGrid');
  container.innerHTML = ''; // Limpiar contenido

  let jugadorasCargadas = 0;

  // Procesar todas las filas excepto el header
  datos.forEach((row, index) => {
    const cells = row.c;
    
    // Verificar que la fila tenga datos Y que no sea el header
    if (cells && cells[0] && cells[0].v && cells[0].v !== 'Pos') {
      jugadorasCargadas++;
      
      // Extraer datos de la jugadora
      const posicion = cells[0] ? cells[0].v : '';
      const nombre = cells[1] ? cells[1].v : '';
      const pj = cells[2] ? cells[2].v : '0';     // Partidos jugados
      const pg = cells[3] ? cells[3].v : '0';     // Partidos ganados
      const puntos = cells[5] ? cells[5].v : '0'; // Puntos

      // Crear tarjeta de jugadora
      const card = document.createElement('div');
      card.className = 'jugadora-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      card.innerHTML = `
        <div class="jugadora-image">
          <i class="fa-solid fa-user-circle"></i>
        </div>
        <div class="jugadora-info">
          <div class="jugadora-nombre">${nombre}</div>
          <div class="jugadora-posicion">Posición #${posicion}</div>
          <div class="jugadora-stats">
            <div class="stat">
              <span class="stat-valor">${pg}</span>
              <span class="stat-label">Ganados</span>
            </div>
            <div class="stat">
              <span class="stat-valor">${pj}</span>
              <span class="stat-label">Jugados</span>
            </div>
            <div class="stat">
              <span class="stat-valor">${puntos}</span>
              <span class="stat-label">Puntos</span>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(card);
      
      // Trigger animación
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100); // Efecto cascada
    }
  });

  console.log(`✅ ${jugadorasCargadas} jugadoras cargadas correctamente`);
}

// Mostrar error si algo falla
function mostrarError(mensaje) {
  const container = document.getElementById('jugadorasGrid');
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #d32f2f;">
      <i class="fa-solid fa-exclamation-triangle"></i> ${mensaje}
    </div>
  `;
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Página de Jugadoras cargada");
  
  // Cargar jugadoras desde Google Sheets
  await cargarJugadoras();
  
  // Smooth scroll para links de navegación
  const navLinks = document.querySelectorAll('a[href^="index.html#"]');
  
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').split('#')[1];
      // Como estamos en otra página, redirigimos a index.html
      window.location.href = 'index.html#' + targetId;
    });
  });

  console.log('✅ Página de Jugadoras lista');
});