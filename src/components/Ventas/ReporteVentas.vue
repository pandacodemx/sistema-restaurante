<template>
  <div class="bg-full p-6">
    <section>
      <nav class="level is-mobile">
        <div class="level-left">
          <div class="level-item">
            <p class="title is-3 has-text-weight-bold has-text-primary">
              <b-icon icon="chart-box" size="is-large" class="mr-3"></b-icon>
              Reporte de Ventas
            </p>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div class="notification total-badge">
              <p class="title is-4">Total ventas: <span class="has-text-weight-bold">${{ (totalVentas ||
                0).toLocaleString() }}</span></p>
            </div>
          </div>
        </div>
      </nav>

      <div class="columns is-multiline is-mobile mb-5">
        <div class="column is-one-quarter">
          <div class="notification is-info is-light">
            <p class="heading">Ventas hoy</p>
            <p class="title">${{ (ventasHoy || 0).toLocaleString() }}</p>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div class="notification is-success is-light">
            <p class="heading">Ventas semana</p>
            <p class="title">${{ (ventasSemana || 0).toLocaleString() }}</p>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div class="notification is-warning is-light">
            <p class="heading">Promedio/venta</p>
            <p class="title">${{ (promedioVenta || 0).toLocaleString() }}</p>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div class="notification is-primary is-light">
            <p class="heading">Total ventas</p>
            <p class="title">${{ (totalVentas || 0).toLocaleString() }}</p>
          </div>
        </div>
      </div>
      <div v-if="ventas.length === 0 && !cargando" class="notification is-warning">
        <b-icon icon="information" class="mr-2"></b-icon>
        No se encontraron ventas para los filtros seleccionados.
      </div>


      <b-table class="elegant-table mt-5 is-size-7" :data="ventas" :paginated="isPaginated" :per-page="perPage"
        :current-page.sync="currentPage" :bordered="false" :striped="true" :hoverable="true" :mobile-cards="true">
        <b-table-column field="id" label="#" searchable sortable v-slot="props">
          {{ props.row.id }}
        </b-table-column>

        <b-table-column field="idMesa" label="Mesa" searchable sortable v-slot="props">
          Mesa # {{ props.row.idMesa }}
        </b-table-column>

        <b-table-column field="fecha" label="Fecha" searchable sortable v-slot="props">
          {{ props.row.fecha }}
        </b-table-column>

        <b-table-column field="atendio" label="Atendió" searchable sortable v-slot="props">
          {{ props.row.atendio }}
        </b-table-column>

        <b-table-column field="cliente" label="Cliente" searchable sortable v-slot="props">
          {{ props.row.cliente }}
        </b-table-column>

        <b-table-column field="pagado" label="Pago" v-slot="props">
          ${{ props.row.pagado }}
        </b-table-column>

        <b-table-column field="cambio" label="Cambio" sortable v-slot="props">
          ${{ props.row.pagado - props.row.total }}
        </b-table-column>

        <b-table-column field="total" label="Total" sortable v-slot="props">
          <strong>${{ props.row.total }}</strong>
        </b-table-column>

        <b-table-column field="insumos" label="Insumos" v-slot="props">
          <b-table :data="props.row.insumos" :narrowed="true" class="is-size-7">
            <b-table-column field="codigo" label="Código" v-slot="props">
              {{ props.row.codigo }}
            </b-table-column>
            <b-table-column field="nombre" label="Nombre" v-slot="props">
              {{ props.row.nombre }}
            </b-table-column>
            <b-table-column field="cantidad" label="Cantidad" v-slot="props">
              {{ props.row.cantidad }} X ${{ props.row.precio }}
            </b-table-column>
            <b-table-column field="subtotal" label="Subtotal" v-slot="props">
              ${{ props.row.cantidad * props.row.precio }}
            </b-table-column>
          </b-table>
        </b-table-column>

        <b-table-column field="acciones" label="" v-slot="props">
          <div class="field is-grouped">
            <b-button type="is-info" class="mb-1" @click="imprimirComprobante(props.row)">
              <b-icon icon="download"></b-icon>
            </b-button>
          </div>
        </b-table-column>
      </b-table>
      <ticket @impreso="onImpreso" :venta="this.ventaSeleccionada" :insumos="insumosSeleccionados" :datosLocal="datos"
        :logo="logo" v-if="mostrarTicket"></ticket>
      <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>


    <div class="box has-background-white-ter">
      <p class="title is-4 has-text-weight-semibold has-text-grey-dark">
        <b-icon icon="account-group" size="is-small"></b-icon>
        Totales por usuario
      </p>
      <div class="tags are-medium">
        <div v-for="usuario in ventasPorUsuario" :key="usuario.nombre" class="control">
          <span class="tag is-rounded is-white is-medium">
            <span class="icon">
              <b-icon icon="account" size="is-small"></b-icon>
            </span>
            <span>{{ usuario.nombre }}</span>
            <span class="tag is-primary is-light ml-2">${{ usuario.total.toLocaleString() }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="is-pulled-right">
      <p class="control">
        <b-select v-model="perPage">
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="15">15 por página</option>
          <option value="20">20 por página</option>
        </b-select>
      </p>
    </div>
    <div class="field is-grouped">
      <p class="control">
        <b-button class="mb-1" @click="recargar">
          <b-icon icon="refresh"></b-icon>
        </b-button>
      </p>
      <p class="control">
        <b-button type="is-success" icon-left="filter-variant" @click="filtrar = !filtrar">Filtrar</b-button>
      </p>
    </div>
    <div class="box" v-if="filtrar">
      <b-field grouped group-multiline>
        <b-field label="Selecciona un periodo de tiempo" expanded>
          <b-datepicker placeholder="Click para seleccionar..." v-model="fechasSeleccionadas" @input="buscarEnFecha"
            icon="calendar-today" range>
          </b-datepicker>
        </b-field>

        <b-field label="Ventas por usuario" expanded>
          <b-select v-model="usuarioSeleccionado" @change.native="buscarEnFecha">
            <option value="" selected disabled>Selecciona</option>
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nombre }}
            </option>
          </b-select>
        </b-field>
      </b-field>
    </div>

  </div>
</template>
<script>
import HttpService from "../../Servicios/HttpService";
import Utiles from "../../Servicios/Utiles";
import Ticket from "./Ticket.vue";

export default {
  name: "ReporteVentas",
  components: { Ticket },

  data: () => ({
    usuarios: [],
    filtrar: false,
    datos: {},
    ventaSeleccionada: {},
    insumosSeleccionados: [],
    fechasSeleccionadas: [],
    usuarioSeleccionado: "",
    filtros: {},
    cargando: false,
    ventas: [],
    ventasPorUsuario: [],
    totalVentas: 0,
    mostrarTicket: false,
    isPaginated: true,
    isPaginationSimple: false,
    isPaginationRounded: true,
    paginationPosition: "bottom",
    defaultSortDirection: "asc",
    sortIcon: "arrow-up",
    sortIconSize: "is-small",
    currentPage: 1,
    perPage: 20,
    logo: null,
    ventasHoy: 0,
    ventasSemana: 0,
    promedioVenta: 0,
  }),

  mounted() {
    this.obtenerVentas();
    this.obtenerDatos();
  },

  methods: {
    calcularResumen() {
      this.ventasHoy = this.calcularVentasHoy();
      this.ventasSemana = this.calcularVentasSemana();
      this.promedioVenta = this.calcularPromedioVenta();
    },
    calcularVentasHoy() {
      const hoy = new Date().toISOString().substring(0, 10);
      const ventasHoy = this.ventas
        .filter(v => v.fecha && v.fecha.substring(0, 10) === hoy)
        .reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      return ventasHoy || 0;
    },

    calcularVentasSemana() {
      const unaSemanaAtras = new Date();
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

      const ventasSemana = this.ventas
        .filter(v => v.fecha && new Date(v.fecha) >= unaSemanaAtras)
        .reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      return ventasSemana || 0;
    },

    calcularPromedioVenta() {
      return this.ventas.length > 0
        ? this.totalVentas / this.ventas.length
        : 0;
    },
    recargar() {
      (this.fechasSeleccionadas = []), (this.filtros = {});
      this.obtenerVentas();
    },

    onImpreso(resultado) {
      this.mostrarTicket = resultado;
    },

    imprimirComprobante(venta) {
      this.ventaSeleccionada = {
        atendio: venta.atendio,
        cliente: venta.cliente,
        fecha: venta.fecha,
        pagado: venta.pagado,
        total: venta.total,
      };

      this.insumosSeleccionados = venta.insumos;
      this.mostrarTicket = true;
    },

    buscarEnFecha() {
      this.filtros = {
        inicio: this.fechasSeleccionadas[0].toISOString().substring(0, 10),
        fin: this.fechasSeleccionadas[1].toISOString().substring(0, 10),
        idUsuario: this.usuarioSeleccionado,
      };
      this.obtenerVentas();
    },

    obtenerVentas() {
      this.cargando = true;
      HttpService.obtenerConDatos(this.filtros, "obtener_ventas.php").then(
        (resultado) => {
          this.ventas = resultado.ventas || [];
          this.ventasPorUsuario = resultado.ventasPorUsuario || [];
          this.usuarios = resultado.usuarios || [];

          this.totalVentas = this.ventas.reduce((sum, venta) =>
            sum + parseFloat(venta.total || 0), 0);

          this.calcularResumen();
          this.cargando = false;
        }
      ).catch(error => {
        console.error("Error al obtener ventas:", error);
        this.ventas = [];
        this.ventasPorUsuario = [];
        this.totalVentas = 0;
        this.calcularResumen();
        this.cargando = false;
      });
    },

    obtenerDatos() {
      HttpService.obtener("obtener_datos_local.php").then((resultado) => {
        this.datos = resultado;
        this.logo = Utiles.generarUrlImagen(this.datos.logo);
      });
    },
  },
};
</script>
<style>
.is-bold {
  font-weight: 700;
}

.bg-full {
  background-color: #f0efef;
  border-radius: 12px;
  min-height: 100dvh;
  padding: 20px;
  margin-top: 10px;
}

.table td,
.table th {
  padding: 0.5rem 1rem;
  vertical-align: middle;
}

.minimal-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  font-size: 14px;
}

.minimal-table th {
  background-color: #e6e6e6;
  font-weight: 600;
  color: #4a4a4a;
  border: none;
}

.minimal-table td {
  border: none;
  padding: 0.75rem 1rem;
}

.minimal-table .b-table .table.is-fullwidth {
  border-collapse: separate;
  border-spacing: 0;
}

.minimal-table .b-table .table.is-fullwidth tbody tr:hover {
  background-color: #f5f5f5;
  transition: background-color 0.3s;
}

.field.is-grouped .control {
  margin-right: 4px;
}

.elegant-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.elegant-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8em;
  letter-spacing: 0.5px;
  border: none !important;
}

.elegant-table tr:hover {
  background-color: #f8f9fa !important;
}

.elegant-table td {
  border: none;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

/* Efecto hover para botones */
.button-hover-effect {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.button-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Estilo para el total */
.total-badge {
  font-size: 1.1em;
  padding: 8px 15px;
  border-radius: 20px;
  background: linear-gradient(135deg, #c7b448, #c57429);
  color: white;
  box-shadow: 0 4px 10px rgba(72, 199, 116, 0.3);
}
</style>