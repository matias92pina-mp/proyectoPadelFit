// ID de la Google Sheet con info de jugadoras
const SHEET_ID_JUGADORAS = '10YBQi99B5qfk1xAlobfz4jtSWduc9jUqNuy__3gLLFE';

// Nombre de la pestaña específica para jugadoras
const SHEET_NAME_JUGADORAS = 'Jugadoras';

// Array global para guardar todas las jugadoras
let todasLasJugadoras = [];

// Variable para guardar la instancia del gráfico
let graficoRadar = null;

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

// Cargar jugadoras desde Google Sheets
async function cargarJugadoras() {
  const datos = await obtenerDatosSheet(SHEET_ID_JUGADORAS, SHEET_NAME_JUGADORAS);
  
  if (!datos) {
    console.error('No se pudieron cargar las jugadoras');
    return;
  }

  todasLasJugadoras = []; // Limpiar array

  datos.forEach((row, rowIndex) => {
    const cells = row.c;
    
    if (cells && cells[0] && cells[0].v && cells[0].v !== 'Nombre') {
      const nombre = cells[0] ? cells[0].v : '';
      const volea = parseFloat(cells[1] ? (cells[1].v || 0) : 0);
      const remate = parseFloat(cells[2] ? (cells[2].v || 0) : 0);
      const bandeja = parseFloat(cells[3] ? (cells[3].v || 0) : 0);
      const derecha = parseFloat(cells[4] ? (cells[4].v || 0) : 0);
      const reves = parseFloat(cells[5] ? (cells[5].v || 0) : 0);
      const globo = parseFloat(cells[6] ? (cells[6].v || 0) : 0);

      // NUEVOS DATOS (Columnas H, I, J en base 0 -> Índices 7, 8, 9)
      const posicionCancha = cells[7] ? cells[7].v : 'No definida';
      const manoHabil = cells[8] ? cells[8].v : 'No definida';
      const puestoTabla = cells[9] ? cells[9].v : '-';

      todasLasJugadoras.push({
        nombre,
        volea, remate, bandeja, derecha, reves, globo,
        posicionCancha,
        manoHabil,
        puestoTabla
      });
    }
  });

  console.log(`✅ ${todasLasJugadoras.length} jugadoras cargadas correctamente`);
  llenarDropdown();
}

// Llenar el dropdown con las jugadoras
function llenarDropdown() {
  const selector = document.getElementById('selectorJugadora');
  
  // Limpiar opciones previas (excepto la primera)
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  // Agregar cada jugadora como opción
  todasLasJugadoras.forEach((jugadora, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = jugadora.nombre;
    selector.appendChild(option);
  });

  console.log('✅ Dropdown llenado con jugadoras');
}

// Mostrar gráfico radar de la jugadora seleccionada
function mostrarGrafico(indexJugadora) {
  if (indexJugadora === '') {
    document.getElementById('jugadoraInfo').style.display = 'none';
    document.getElementById('mensajeInicial').style.display = 'block';
    return;
  }

  const contenedorInfo = document.getElementById('jugadoraInfo');
  
  if (indexJugadora === '') {
    // Esto oculta el bloque entero, eliminando el margen y el espacio en blanco
    contenedorInfo.style.display = 'none'; 
    document.getElementById('mensajeInicial').style.display = 'block';
    return;
  }

  const jugadora = todasLasJugadoras[indexJugadora];

  // 1. Inyectar datos en los elementos HTML (Nombre con #Puesto y Ficha Esencial)
  document.getElementById('nombreJugadora').textContent = `${jugadora.nombre} #${jugadora.puestoTabla}`;
  
  document.getElementById('datosEsenciales').innerHTML = `
    <span><strong>Lado:</strong> ${jugadora.posicionCancha}</span>
    <span><strong>Mano:</strong> ${jugadora.manoHabil}</span>
  `;

  document.getElementById('jugadoraInfo').style.display = 'block';
  document.getElementById('mensajeInicial').style.display = 'none';

  // 2. Configurar categorías en dos líneas para UX óptima
  const categorias = [
    ['Volea', jugadora.volea],
    ['Remate', jugadora.remate],
    ['Bandeja', jugadora.bandeja],
    ['Derecha', jugadora.derecha],
    ['Revés', jugadora.reves],
    ['Globo', jugadora.globo]
  ];

  const series = [{
    name: jugadora.nombre,
    data: [jugadora.volea, jugadora.remate, jugadora.bandeja, jugadora.derecha, jugadora.reves, jugadora.globo]
  }];

  // 3. Opciones completas del gráfico
  const options = {
    chart: {
      type: 'radar',
      fontFamily: "'Montserrat', sans-serif", // Soluciona error tipográfico en descargas PNG
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    xaxis: {
      categories: categorias,
      labels: {
        style: {
          fontSize: '15px',   // Fuente más grande para las habilidades
          fontWeight: 600,    // Un poco más de peso visual
          fontFamily: 'Montserrat',
          colors: ['#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E']
        }
      }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 10,
      labels: {
        show: false,
        formatter: function() { return ""; }
      }
    },
    plotOptions: {
      radar: {
        // Quitamos "size: 100" para que se vuelva responsivo al 100%
        polygons: {
          strokeColor: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff']
          }
        }
      }
    },
    colors: ['#59C6C3'],
    tooltip: {
      enabled: false // Desactivado para eliminar ruido visual redundante
    },
    
    markers: {
      size: 5,            // Tamaño de los puntitos en cada vértice
      colors: ['#59C6C3'], // Color del centro del punto
      strokeColors: '#ffffff', // Borde blanco para que resalten
      strokeWidth: 2
    },
    legend: {
      show: false // Ocultado ya que el título ahora tiene el nombre y ranking
    }
  };

  if (graficoRadar) {
    graficoRadar.destroy();
  }

  graficoRadar = new ApexCharts(document.getElementById('graficoRadar'), {
    series: series,
    ...options
  });

  graficoRadar.render();
  console.log(`✅ Gráfico de ${jugadora.nombre} mostrado`);

  
}

// Event listener para el dropdown
function configurarSelectorJugadora() {
  const selector = document.getElementById('selectorJugadora');
  selector.addEventListener('change', (e) => {
    mostrarGrafico(e.target.value);
  });
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Página de Jugadoras cargada");
  
  // Cargar jugadoras desde Google Sheets
  await cargarJugadoras();
  
  // Configurar el selector
  configurarSelectorJugadora();

  console.log('✅ Página de Jugadoras lista');
});