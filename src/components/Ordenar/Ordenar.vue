<template>
  <div class="order-container">
    <section class="order-card">
      <!-- Header de la orden -->
      <div class="order-header">
        <div class="order-title">
          <b-icon icon="food" size="is-large" type="is-primary"></b-icon>
          <h1 class="title is-2 has-text-weight-bold">
            Orden Mesa #{{ idMesa }}
          </h1>
        </div>

        <!-- Total y cliente -->
        <div class="order-summary">
          <div class="total-display">
            <span class="total-label">Total:</span>
            <span class="total-amount">${{ total.toLocaleString() }}</span>
          </div>

          <b-field label="Nombre del cliente" class="client-field">
            <b-input rounded placeholder="Nombre del cliente (opcional)" v-model="cliente" icon="account"
              size="is-medium">
            </b-input>
          </b-field>
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-container">
        <b-field class="search-field">
          <b-autocomplete rounded size="is-large" v-model="nombre" placeholder="Buscar insumo..."
            :data="filteredDataObj" field="nombre" @input="buscarInsumo"
            @select="(option) => agregarInsumoAOrden(option)" :clearable="true" keep-first icon="magnify"
            ref="searchInput" class="search-input">
            <template #empty>No se encontraron insumos</template>
          </b-autocomplete>
        </b-field>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <b-button type="is-primary" size="is-large" icon-left="book-plus" class="is-rounded order-button"
          @click="realizarOrden" v-if="!estaAgregandoInsumos">
          Confirmar Orden
        </b-button>
        <b-button type="is-info" size="is-large" icon-left="plus-circle" class="is-rounded add-button"
          @click="editarOrden" v-if="estaAgregandoInsumos">
          Añadir a Orden
        </b-button>
      </div>

      <!-- Lista de insumos -->
      <div class="products-container">
        <!-- Insumos por agregar -->
        <div v-if="insumosOrden.length > 0" class="products-section">
          <div class="section-header">
            <b-icon icon="plus-circle" size="is-small"></b-icon>
            <h3 class="section-title">Insumos por agregar</h3>
          </div>
          <productos-orden :lista="insumosOrden" :tipo="'nuevo'" @modificado="onProductoModificado"
            @quitar="eliminar" />
        </div>

        <!-- Insumos existentes -->
        <div v-if="insumosAnteriores.length > 0" class="products-section">
          <div class="section-header">
            <b-icon icon="basket" size="is-small"></b-icon>
            <h3 class="section-title">Insumos solicitados</h3>
          </div>
          <productos-orden :lista="insumosAnteriores" :tipo="'entregado'" />
        </div>

        <!-- Mensaje cuando no hay insumos -->
        <div v-if="insumosOrden.length === 0 && insumosAnteriores.length === 0" class="empty-state">
          <b-icon icon="magnify" size="is-large" type="is-grey-light"></b-icon>
          <p class="empty-text">Busca y agrega insumos a la orden</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import HttpService from "../../Servicios/HttpService";
import ProductosOrden from "./ProductosOrden.vue";

export default {
  name: "Ordenar",
  components: { ProductosOrden },
  data: () => ({
    idMesa: "",
    insumos: [],
    nombre: "",
    insumosAnteriores: [],
    insumosOrden: [],
    total: 0,
    cliente: "",
    estaAgregandoInsumos: false,
  }),

  mounted() {
    if (this.$refs.searchInput) {
      this.$refs.searchInput.focus();
    }
    this.idMesa = this.$route.params.id;
    this.cliente = this.$route.params.cliente || "";
    this.insumosAnteriores = this.$route.params.insumosEnLista || [];

    if (this.insumosAnteriores.length > 0) {
      this.calcularTotal();
      this.estaAgregandoInsumos = true;
    }
  },

  methods: {
    onProductoModificado() {
      this.calcularTotal();
    },

    async editarOrden() {
      if (this.insumosOrden.length === 0) {
        this.$buefy.toast.open({
          message: "Agrega al menos un insumo",
          type: "is-warning"
        });
        return;
      }

      let payload = {
        id: this.idMesa,
        insumos: [...this.insumosAnteriores, ...this.insumosOrden],
        total: this.total,
        atiende: localStorage.getItem("nombreUsuario"),
        idUsuario: localStorage.getItem("idUsuario"),
        cliente: this.cliente,
      };

      try {
        const resultado = await HttpService.registrar(payload, "editar_mesa.php");
        if (resultado) {
          this.mostrarNotificacion("Insumos agregados correctamente", "is-success");
          this.$router.push({ name: "RealizarOrden" });
        }
      } catch (error) {
        this.mostrarNotificacion("Error al agregar insumos", "is-danger");
      }
    },

    async realizarOrden() {
      if (this.insumosOrden.length === 0) {
        this.$buefy.toast.open({
          message: "Agrega al menos un insumo",
          type: "is-warning"
        });
        return;
      }

      let payload = {
        id: this.idMesa,
        insumos: this.insumosOrden,
        total: this.total,
        atiende: localStorage.getItem("nombreUsuario"),
        idUsuario: localStorage.getItem("idUsuario"),
        cliente: this.cliente,
      };

      try {
        const resultado = await HttpService.registrar(payload, "ocupar_mesa.php");
        if (resultado) {
          this.mostrarNotificacion("Orden realizada correctamente", "is-success");
          this.$router.push({ name: "RealizarOrden" });
        }
      } catch (error) {
        this.mostrarNotificacion("Error al realizar la orden", "is-danger");
      }
    },

    eliminar(idInsumo) {
      this.insumosOrden = this.insumosOrden.filter(item => item.id !== idInsumo);
      this.calcularTotal();
    },

    calcularTotal() {
      const totalAnterior = this.insumosAnteriores.reduce((sum, insumo) => {
        return sum + (parseFloat(insumo.cantidad) * parseFloat(insumo.precio));
      }, 0);

      const totalNuevo = this.insumosOrden.reduce((sum, insumo) => {
        return sum + (parseFloat(insumo.cantidad) * parseFloat(insumo.precio));
      }, 0);

      this.total = totalAnterior + totalNuevo;
    },

    buscarInsumo() {
      if (this.nombre) {
        HttpService.obtenerConDatos(
          this.nombre,
          "obtener_insumo_nombre.php"
        ).then((resultado) => {
          this.insumos = resultado;
        });
      }
    },

    agregarInsumoAOrden(insumo) {
      if (!insumo) return;

      const indice = this.insumosOrden.findIndex(item => item.id === insumo.id);

      if (indice >= 0) {
        this.insumosOrden[indice].cantidad++;
      } else {
        this.insumosOrden.push({
          id: insumo.id,
          codigo: insumo.codigo,
          nombre: insumo.nombre,
          precio: insumo.precio,
          caracteristicas: "",
          cantidad: 1,
          estado: "pendiente",
          tipo: insumo.tipo
        });
      }

      this.nombre = "";
      this.calcularTotal();
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },

    mostrarNotificacion(mensaje, tipo) {
      this.$buefy.toast.open({
        message: mensaje,
        type: tipo,
        position: "is-bottom-right",
        duration: 3000
      });
    }
  },

  computed: {
    filteredDataObj() {
      return this.insumos.filter(option =>
        option.nombre.toLowerCase().includes(this.nombre.toLowerCase())
      );
    },
  },
};
</script>

<style scoped>
.order-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.order-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.order-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.total-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.total-label {
  font-size: 1.2rem;
  color: #4a4a4a;
}

.total-amount {
  font-size: 3.5rem;
  font-weight: bold;
  color: #48c774;
}

.client-field {
  min-width: 300px;
}

.search-container {
  margin: 2rem 0;
}

.search-field {
  width: 100%;
}

.search-input {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.order-button,
.add-button {
  font-weight: 600;
  padding: 0 2.5rem;
  transition: all 0.3s ease;
}

.order-button:hover,
.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.products-container {
  margin-top: 2rem;
}

.products-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #363636;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.empty-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #7a7a7a;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .order-summary {
    align-items: stretch;
    width: 100%;
  }

  .client-field {
    min-width: auto;
  }

  .total-display {
    justify-content: space-between;
  }
}
</style>