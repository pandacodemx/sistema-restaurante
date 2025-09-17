<template>
    <div class="dashboard-container">
        <!-- Header con información de usuario -->
        <div class="dashboard-header">
            <div class="user-welcome">
                <h1>¡Bienvenido! <span class="username">{{ nombreUsuario }}</span></h1>
                <p class="system-version">Bamboo POS Food Service V1.0</p>
            </div>
            <div class="header-actions">
                <b-button icon-left="refresh" @click="obtenerDatos" class="refresh-btn" rounded>
                    Actualizar
                </b-button>
            </div>
        </div>

        <!-- Cards de resumen rápido -->
        <div class="summary-cards">
            <div v-for="(carta, index) in cartas" :key="index" class="summary-card" @click="$router.push(carta.ruta)">
                <div class="card-icon" :class="carta.colorTexto">
                    <b-icon :icon="carta.icono" size="is-medium"></b-icon>
                </div>
                <div class="card-content">
                    <p class="card-header">{{ carta.encabezado }}</p>
                    <h3 class="card-title">{{ carta.titulo }}</h3>
                    <p class="card-total">{{ carta.total }}</p>
                </div>
            </div>
        </div>

        <!-- Sección de gráficas y tablas -->
        <div class="dashboard-content">
            <!-- Fila 1: Gráficas principales -->
            <div class="content-row">
                <div class="chart-card">
                    <div class="card-header">
                        <b-icon icon="calendar-week"></b-icon>
                        <span>Ventas de la semana</span>
                        <span class="total-tag">${{ totalVentasSemana }}</span>
                    </div>
                    <div class="chart-container">
                        <canvas id="grafica-semana"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="card-header">
                        <b-icon icon="clock-outline"></b-icon>
                        <span>Ventas por hora</span>
                        <span class="total-tag">${{ totalVentasHora }}</span>
                    </div>
                    <div class="filters">
                        <b-datepicker v-model="periodoHoras" range size="is-small" placeholder="Seleccionar período" 
                            @input="busquedaAvanzada('hora')" trap-focus>
                        </b-datepicker>
                    </div>
                    <div class="chart-container">
                        <canvas id="grafica-hora"></canvas>
                    </div>
                </div>
            </div>

            <!-- Fila 2: Tablas de datos -->
            <div class="content-row">
                <div class="data-card">
                    <div class="card-header">
                        <b-icon icon="food-fork-drink"></b-icon>
                        <span>Insumos más vendidos</span>
                        <b-select v-model="limiteSeleccionado" size="is-small" @change="busquedaAvanzada('limite')">
                            <option value="5">Top 5</option>
                            <option value="10">Top 10</option>
                            <option value="15">Top 15</option>
                        </b-select>
                    </div>
                    <div class="table-container">
                        <div v-for="(item, index) in insumosMasVendidos" :key="index" class="table-row">
                            <div class="row-icon">
                                <b-icon :icon="item.tipo === 'PLATILLO' ? 'noodles' : 'cup'" 
                                    :type="item.tipo === 'PLATILLO' ? 'is-info' : 'is-success'">
                                </b-icon>
                            </div>
                            <div class="row-content">
                                <span class="product-name">{{ item.nombre }}</span>
                                <span class="product-category">{{ item.categoria }}</span>
                            </div>
                            <div class="row-amount">${{ item.total }}</div>
                            <div class="row-progress">
                                <b-progress :value="item.progreso" size="is-small" show-value 
                                    :type="getProgressType(item.progreso)">
                                </b-progress>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-card">
                    <div class="card-header">
                        <b-icon icon="table-furniture"></b-icon>
                        <span>Mesas más ocupadas</span>
                    </div>
                    <div class="table-container">
                        <div v-for="(mesa, index) in totalesPorMesa" :key="index" class="table-row">
                            <div class="row-content">
                                <span class="mesa-number">Mesa #{{ mesa.idMesa }}</span>
                            </div>
                            <div class="row-amount">${{ mesa.total }}</div>
                            <div class="row-progress">
                                <b-progress :value="mesa.progreso" size="is-small" show-value 
                                    :type="getProgressType(mesa.progreso)">
                                </b-progress>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fila 3: Gráficas adicionales -->
            <div class="content-row">
                <div class="chart-card">
                    <div class="card-header">
                        <b-icon icon="account"></b-icon>
                        <span>Ventas por usuario</span>
                        <span class="total-tag">${{ totalVentasUsuarios }}</span>
                    </div>
                    <div class="filters">
                        <b-datepicker v-model="periodoUsuarios" range size="is-small" placeholder="Seleccionar período"
                            @input="busquedaAvanzada('usuario')" trap-focus>
                        </b-datepicker>
                    </div>
                    <div class="chart-container">
                        <canvas id="grafica-usuarios"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="card-header">
                        <b-icon icon="calendar-month"></b-icon>
                        <span>Ventas del año</span>
                        <span class="total-tag">${{ totalVentasMeses }}</span>
                    </div>
                    <div class="filters">
                        <b-select v-model="anioSeleccionado" size="is-small" @change="busquedaAvanzada('mes')">
                            <option v-for="anio in listaAnios" :value="anio">{{ anio }}</option>
                        </b-select>
                    </div>
                    <div class="chart-container">
                        <canvas id="grafica-mes"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>
    </div>
</template>
<script>
import HttpService from '../Servicios/HttpService'
import Utiles from '../Servicios/Utiles'


export default ({
    name: "Inicio",

    data: () => ({
        datosLocal: {},
        nombreUsuario: '',
        logo: null,
        ventasSemana: [],
        ventasHora: [],
        ventasMeses: [],
        ventasUsuarios: [],
        insumosMasVendidos: [],
        totalesPorMesa: [],
        resultadoCartas: {},
        cargando: false,
        tipoGrafica: "line",
        cartas: [],
        totalVentasHora: 0,
        totalVentasSemana: 0,
        totalVentasUsuarios: 0,
        totalVentasMeses: 0,
        periodoHoras: [],
        periodoUsuarios: [],
        anioSeleccionado: new Date().getFullYear(),
        listaAnios: [],
        limiteSeleccionado: 5,
        filtros: {
            hora: { inicio: "", fin: "" },
            usuarios: { inicio: "", fin: "" }
        }
    }),

    mounted() {
        this.filtros.anio = this.anioSeleccionado
        this.filtros.limite = this.limiteSeleccionado
        this.obtenerDatos()
        this.llenarListaAnios()
        this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario'
        this.obtenerDatos()
    },

    methods: {
         getProgressType(progreso) {
            if (progreso >= 90) return 'is-success';
            if (progreso >= 70) return 'is-info';
            return 'is-danger';
        },
        obtenerDatos() {
            HttpService.obtener("obtener_datos_local.php")
                .then(resultado => {
                    this.datosLocal = resultado
                    this.logo = Utiles.generarUrlImagen(this.datosLocal.logo)
                })
        },

        calcularProgreso(arreglo) {

            let mayor = (arreglo[0]) ? arreglo[0].total : 0
            arreglo.forEach(elemento => {
                elemento.progreso = parseInt(elemento.total * 100 / mayor)
            });
            return arreglo


        },

        busquedaAvanzada(tipo,) {
            switch (tipo) {
                case "hora":
                    this.filtros.hora = {
                        inicio: this.periodoHoras[0].toISOString().substring(0, 10),
                        fin: this.periodoHoras[1].toISOString().substring(0, 10)
                    }
                    break

                case "usuario":
                    this.filtros.usuarios = {
                        inicio: this.periodoUsuarios[0].toISOString().substring(0, 10),
                        fin: this.periodoUsuarios[1].toISOString().substring(0, 10)
                    }
                    break

                case "mes":
                    this.filtros.anio = this.anioSeleccionado
                    break
                case "limite":
                    this.filtros.limite = this.limiteSeleccionado
            }

            this.obtenerDatos()
        },

        llenarListaAnios() {
            for (let i = 2015; i <= this.anioSeleccionado; i++) {
                this.listaAnios.push(i)
            }
        },

        obtenerDatos() {
            this.cargando = true
            HttpService.obtenerConDatos(this.filtros, "inicio.php")
                .then(resultado => {
                    this.ventasSemana = Utiles.cambiarDiaSemana(resultado.ventasDiasSemana)
                    this.ventasHora = resultado.ventasHora
                    this.ventasMeses = Utiles.cambiarNumeroANombreMes(resultado.ventasMeses)
                    this.ventasUsuarios = resultado.ventasUsuario
                    this.resultadoCartas = resultado.cartas
                    this.insumosMasVendidos = this.calcularProgreso(resultado.insumosMasVendidos)
                    this.totalesPorMesa = this.calcularProgreso(resultado.totalesPorMesa)

                    this.totalVentasHora = Utiles.calcularTotales(this.ventasHora)
                    this.totalVentasSemana = Utiles.calcularTotales(this.ventasSemana)
                    this.totalVentasUsuarios = Utiles.calcularTotales(this.ventasUsuarios)
                    this.totalVentasMeses = Utiles.calcularTotales(this.ventasMeses)

                    Utiles.generarGrafica(this.ventasSemana, "#contenedor-semana", "#grafica-semana", "grafica-semana")
                    Utiles.generarGrafica(this.ventasHora, "#contenedor-hora", "#grafica-hora", "grafica-hora")
                    Utiles.generarGrafica(this.ventasMeses, "#contenedor-mes", "#grafica-mes", "grafica-mes")
                    Utiles.generarGrafica(this.ventasUsuarios, "#contenedor-usuarios", "#grafica-usuarios", "grafica-usuarios")
                    this.cartas = [
                        {
                            encabezado: "Ventas del día",
                            titulo: "Ventas hoy",
                            total: "$" + this.resultadoCartas.totalVentasDia,
                            icono: "cart-outline",
                            colorTexto: "has-text-info",
                            ruta: "/reporte-ventas"
                        },
                        {
                            encabezado: "Estado mesas",
                            titulo: "Mesas ocupadas",
                            total: this.resultadoCartas.numeroMesasOcupadas,
                            icono: "table-furniture",
                            colorTexto: "has-text-success",
                            ruta: "/realizar-orden"
                        },
                        {
                            encabezado: "Usuarios registrados",
                            titulo: "Usuarios",
                            total: this.resultadoCartas.numeroUsuarios,
                            icono: "account",
                            colorTexto: "has-text-danger",
                            ruta: "/usuarios"
                        },
                        {
                            encabezado: "Insumos registrados",
                            titulo: "Insumos",
                            total: this.resultadoCartas.numeroInsumos,
                            icono: "food-fork-drink",
                            colorTexto: "has-text-warning",
                            ruta: "/insumos"
                        },
                        
                    ]
                    this.cargando = false
                })
        },


    }
})
</script>
<style scoped>
.dashboard-container {
    padding: 1rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.user-welcome h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.username {
    color: #faa200;
    font-weight: bold;
}

.system-version {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.refresh-btn {
    background: linear-gradient(135deg, #faa200 0%, #ff7b00 100%);
    border: none;
    color: white;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.summary-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-icon {
    margin-right: 1rem;
    font-size: 2rem;
}

.card-content {
    flex: 1;
}

.card-header {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
}

.card-title {
    font-size: 1rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.card-total {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
}

.dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.content-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
}

.chart-card, .data-card {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #2c3e50;
}

.total-tag {
    margin-left: auto;
    background: #3498db;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}

.chart-container {
    height: 250px;
    position: relative;
}

.table-container {
    max-height: 300px;
    overflow-y: auto;
}

.table-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #ecf0f1;
}

.table-row:last-child {
    border-bottom: none;
}

.row-icon {
    font-size: 1.2rem;
}

.product-name {
    font-weight: 600;
    color: #2c3e50;
}

.product-category {
    font-size: 0.8rem;
    color: #7f8c8d;
}

.mesa-number {
    font-weight: 600;
    color: #2c3e50;
}

.row-amount {
    font-size: 12px;
    font-weight: bold;
    color: #27ae60;
}

.row-progress {
    min-width: 100px;
}

.filters {
    margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .summary-cards {
        grid-template-columns: 1fr;
    }
    
    .content-row {
        grid-template-columns: 1fr;
    }
    
    .table-row {
        grid-template-columns: auto 1fr;
        gap: 0.5rem;
    }
    
    .row-amount, .row-progress {
        grid-column: 1 / -1;
    }
}

/* Animaciones */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.chart-card, .data-card, .summary-card {
    animation: fadeIn 0.6s ease-out;
}
</style>