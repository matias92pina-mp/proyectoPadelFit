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

  // Procesar todas las filas excepto el header
  datos.forEach((row, rowIndex) => {
    const cells = row.c;
    
    // Verificar que la fila tenga datos Y que no sea el header
    if (cells && cells[0] && cells[0].v && cells[0].v !== 'Nombre') {
      // Extraer datos de la jugadora
      const nombre = cells[0] ? cells[0].v : '';
      const volea = parseFloat(cells[1] ? (cells[1].v || 0) : 0);
      const remate = parseFloat(cells[2] ? (cells[2].v || 0) : 0);
      const bandeja = parseFloat(cells[3] ? (cells[3].v || 0) : 0);
      const derecha = parseFloat(cells[4] ? (cells[4].v || 0) : 0);
      const reves = parseFloat(cells[5] ? (cells[5].v || 0) : 0);
      const globo = parseFloat(cells[6] ? (cells[6].v || 0) : 0);

      // DEBUG: Imprimir los datos de cada jugadora
      console.log(`Jugadora ${rowIndex}: ${nombre}`, { volea, remate, bandeja, derecha, reves, globo });

      // Agregar jugadora al array
      todasLasJugadoras.push({
        nombre,
        volea,
        remate,
        bandeja,
        derecha,
        reves,
        globo
      });
    }
  });

  console.log(`✅ ${todasLasJugadoras.length} jugadoras cargadas correctamente`);
  
  // Llenar el dropdown con las jugadoras
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
    // Si no hay selección, mostrar mensaje inicial
    document.getElementById('jugadoraInfo').style.display = 'none';
    document.getElementById('mensajeInicial').style.display = 'block';
    return;
  }

  // Obtener datos de la jugadora seleccionada
  const jugadora = todasLasJugadoras[indexJugadora];

  // Mostrar información de la jugadora
  document.getElementById('nombreJugadora').textContent = jugadora.nombre;
  document.getElementById('jugadoraInfo').style.display = 'block';
  document.getElementById('mensajeInicial').style.display = 'none';

  // Datos para el gráfico
  const series = [{
    name: jugadora.nombre,
    data: [jugadora.volea, jugadora.remate, jugadora.bandeja, jugadora.derecha, jugadora.reves, jugadora.globo]
  }];

  // Crear categorías con valores
  const categorias = [
    `Volea ${jugadora.volea}`,
    `Remate ${jugadora.remate}`,
    `Bandeja ${jugadora.bandeja}`,
    `Derecha ${jugadora.derecha}`,
    `Revés ${jugadora.reves}`,
    `Globo ${jugadora.globo}`
  ];

  const options = {
    chart: {
      type: 'radar',
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
    title: {
      text: '',
      align: 'left'
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#59C6C3'],
      dashArray: 0
    },
    fill: {
      opacity: 0.4,
      colors: ['#F4B8C6']
    },
    markers: {
      size: 5,
      colors: ['#59C6C3'],
      strokeColor: '#fff',
      strokeWidth: 2
    },
    xaxis: {
      categories: categorias,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Montserrat',
          colors: ['#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E', '#2E2E2E']
        }
      }
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 0,
      labels: {
        show: false
      }
    },
    plotOptions: {
      radar: {
        size: 100,
        polygons: {
          strokeColor: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff']
          }
        }
      }
    },
    colors: ['#59C6C3'],
    legend: {
      show: true,
      floating: false,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontFamily: 'Montserrat',
      labels: {
        colors: '#2E2E2E'
      }
    }
  };

  // Destruir gráfico anterior si existe
  if (graficoRadar) {
    graficoRadar.destroy();
  }

  // Crear nuevo gráfico
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