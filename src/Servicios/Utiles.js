import Chart from "chart.js";
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

const Utiles = {
  generarUrlImagen(imagen) {
    return "http://localhost/sistema-restaurante-1/api/" + imagen;
  },

  generarGrafica(array, contenedor, grafica, id) {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      this.resetearGrafica(contenedor, grafica, id);
      let lista = array;
      
      // Verificar si el array tiene datos
      if (!array || array.length === 0) {
        console.warn('Array vacío para la gráfica:', id);
        this.mostrarMensajeVacio(contenedor);
        return;
      }

      const labels = lista.map((elemento) => {
        return elemento[Object.keys(elemento)[0]];
      });
      
      const totales = lista.map((elemento) => {
        return elemento.totalVentas || 0;
      });

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Total",
            data: totales,
            backgroundColor: this.generarColoresAleatorios(totales.length),
            borderColor: "#3498db",
            fill: false,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 3,
            pointRadius: 5,
          },
        ],
      };

      const ctx = document.getElementById(id);
      if (!ctx) {
        console.error('No se encontró el elemento canvas con id:', id);
        return;
      }

      new Chart(ctx, {
        type: "line",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        },
      });
    }, 100);
  },

  resetearGrafica(contenedor, grafica, id) {
    const $contenedorGrafica = document.querySelector(contenedor);
    if (!$contenedorGrafica) {
      console.error('Contenedor no encontrado:', contenedor);
      return;
    }

    let $grafica = document.querySelector(grafica);
    if ($grafica) {
      $grafica.remove();
    }

    let $nuevaGrafica = document.createElement("canvas");
    $nuevaGrafica.setAttribute("id", id);
    $nuevaGrafica.style.width = "100%";
    $nuevaGrafica.style.height = "250px";
    $contenedorGrafica.appendChild($nuevaGrafica);
  },

  mostrarMensajeVacio(contenedor) {
    const $contenedor = document.querySelector(contenedor);
    if ($contenedor) {
      $contenedor.innerHTML = `
        <div class="grafica-vacia">
          <b-icon icon="chart-line" size="is-large"></b-icon>
          <p>No hay datos disponibles</p>
        </div>
      `;
    }
  },

  generarColoresAleatorios(cantidad) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(this.generarColorPastel());
    }
    return colores;
  },

  generarColorPastel() {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 70%, 65%, 0.7)`;
  },

  calcularTotales(array) {
    if (!array || array.length === 0) return 0;
    
    let total = 0;
    array.forEach((elemento) => {
      total += parseFloat(elemento.totalVentas || 0);
    });
    return total.toFixed(2);
  },

  validar(datos) {
    let errores = [];
    for (let [clave, valor] of Object.entries(datos)) {
      if (clave === "id" && !valor) continue;
      if (!valor) errores.push("Debes colocar el valor de " + clave);
    }
    return errores;
  },

  cambiarNumeroANombreMes(arreglo) {
    if (!arreglo) return [];
    
    return arreglo.map(elemento => {
      return {
        ...elemento,
        mes: MESES[elemento.mes - 1] || `Mes ${elemento.mes}`
      };
    });
  },

  cambiarDiaSemana(arreglo) {
    if (!arreglo) return [];
    
    return arreglo.map(elemento => {
      return {
        ...elemento,
        dia: DIAS[elemento.numeroDia - 1] || `Día ${elemento.numeroDia}`
      };
    });
  },

 
  esperarElemento(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Elemento ${selector} no encontrado después de ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  }
};

export default Utiles;