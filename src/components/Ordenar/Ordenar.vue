<template>
  <div class="touch-order-container">
    <!-- Panel izquierdo: Productos y categorías -->
    <div class="products-panel">
      <div class="categories-header">
        <h2 class="title is-4">Productos</h2>
        <div class="categories-tabs">
          <button v-for="category in categories" :key="category.id"
            :class="['category-tab', { 'is-active': activeCategory === category.id }]"
            @click="activeCategory = category.id">
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="search-container">
        <b-field>
          <b-input rounded size="is-medium" v-model="searchTerm" placeholder="Buscar producto..." icon="magnify"
           ></b-input>
        </b-field>
      </div>

      <div class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card" @click="addToOrder(product)">
          <div class="product-image">
            <img :src="getImageUrl(product.imagen)" :alt="product.nombre" @error="handleImageError">
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.nombre }}</h3>
            <p class="product-price">${{ parseFloat(product.precio).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: Orden y opciones -->
    <div class="order-panel">
      <div class="order-header">
        <h1 class="title is-3">Mesa #{{ idMesa }}</h1>

        <b-field label="Nombre del cliente" class="client-field">
          <b-input rounded placeholder="Cliente (opcional)" v-model="cliente" icon="account" size="is-medium"></b-input>
        </b-field>
      </div>

      <div class="order-items">
        <div class="order-section" v-if="insumosOrden.length > 0">
          <h3 class="section-title">Nuevos insumos</h3>
          <div class="order-item" v-for="item in insumosOrden" :key="'new-' + item.id">
            <div class="item-info">
              <span class="item-name">{{ item.nombre }}</span>
              <span class="item-price">${{ (item.precio * item.cantidad).toLocaleString() }}</span>
            </div>
            <div class="item-controls">
              <button class="quantity-btn" @click.stop="decreaseQuantity(item)">-</button>
              <span class="quantity">{{ item.cantidad }}</span>
              <button class="quantity-btn" @click.stop="increaseQuantity(item)">+</button>
              <button class="remove-btn" @click.stop="removeItem(item)">
                <b-icon icon="delete" size="is-small"></b-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="order-section" v-if="insumosAnteriores.length > 0">
          <h3 class="section-title">Insumos existentes</h3>
          <div class="order-item" v-for="item in insumosAnteriores" :key="'prev-' + item.id">
            <div class="item-info">
              <span class="item-name">{{ item.nombre }}</span>
              <span class="item-price">${{ (item.precio * item.cantidad).toLocaleString() }}</span>
            </div>
            <div class="item-quantity">
              <span class="quantity">{{ item.cantidad }}</span>
            </div>
          </div>
        </div>

        <div v-if="insumosOrden.length === 0 && insumosAnteriores.length === 0" class="empty-order">
          <b-icon icon="cart" size="is-large" type="is-grey-light"></b-icon>
          <p>La orden está vacía</p>
        </div>
      </div>

      <div class="order-summary">
        <div class="total-display">
          <span class="total-label">Total:</span>
          <span class="total-amount">${{ total.toLocaleString() }}</span>
        </div>

        <div class="action-buttons">
          <button class="button is-primary is-large is-fullwidth confirm-button" @click="realizarOrden"
            v-if="!estaAgregandoInsumos">
            <b-icon icon="check"></b-icon>
            <span>Confirmar Orden</span>
          </button>

          <button class="button is-info is-large is-fullwidth add-button" @click="editarOrden"
            v-if="estaAgregandoInsumos">
            <b-icon icon="plus"></b-icon>
            <span>Añadir a Orden</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HttpService from "../../Servicios/HttpService";

export default {
  name: "TouchOrder",
  data: () => ({
    idMesa: "",
    allProducts: [],
    searchTerm: "",
    categories: [
      { id: "all", name: "Todos" },
      { id: "PLATILLO", name: "Platillos" },
      { id: "BEBIDA", name: "Bebidas" }
    ],
    activeCategory: "all",
    insumosAnteriores: [],
    insumosOrden: [],
    total: 0,
    cliente: "",
    estaAgregandoInsumos: false,
  }),

  computed: {
    filteredProducts() {
      let filtered = this.allProducts;
      
      // Filtrar por categoría seleccionada
      if (this.activeCategory !== 'all') {
        filtered = filtered.filter(product => product.tipo === this.activeCategory);
      }
      
      // Filtrar por búsqueda
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(product => 
          product.nombre.toLowerCase().includes(term) ||
          (product.descripcion && product.descripcion.toLowerCase().includes(term)) ||
          (product.codigo && product.codigo.toLowerCase().includes(term))
        );
      }
      
      return filtered;
    }
  },

  mounted() {
    this.idMesa = this.$route.params.id;
    this.cliente = this.$route.params.cliente || "";
    this.insumosAnteriores = this.$route.params.insumosEnLista || [];

    if (this.insumosAnteriores.length > 0) {
      this.calcularTotal();
      this.estaAgregandoInsumos = true;
    }

    this.loadProducts();
  },

  methods: {
    getImageUrl(imagePath) {
      if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
        return 'https://via.placeholder.com/150x150/ff7b7b/ffffff?text=Sin+Imagen';
      }

      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `http://localhost/sistema-restaurante-1/api/${imagePath}`;
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/150x150/ff7b7b/ffffff?text=Sin+Imagen';
    },
    
    async loadProducts() {
      try {
        const resultado = await HttpService.obtener("obtener_insumos.php");
        this.allProducts = resultado;
      } catch (error) {
        console.error("Error al cargar productos:", error);
        
        // Datos de prueba para debug
        this.allProducts = [
          { id: 1, nombre: "Coca Cola 600Ml", precio: 25, tipo: "BEBIDA", imagen: "" },
          { id: 2, nombre: "Agua Ciel 600ML", precio: 15, tipo: "BEBIDA", imagen: "" },
          { id: 3, nombre: "Hamburguesa Americana", precio: 80, tipo: "PLATILLO", imagen: "" },
          { id: 4, nombre: "Pasta Mar y Tierra", precio: 95, tipo: "PLATILLO", imagen: "" }
        ];
      }
    },

    addToOrder(product) {
      const existingItem = this.insumosOrden.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.cantidad++;
      } else {
        this.insumosOrden.push({
          id: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          precio: product.precio,
          caracteristicas: "",
          cantidad: 1,
          estado: "pendiente",
          tipo: product.tipo
        });
      }

      this.calcularTotal();
    },

    increaseQuantity(item) {
      item.cantidad++;
      this.calcularTotal();
    },

    decreaseQuantity(item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        this.removeItem(item);
      }
      this.calcularTotal();
    },

    removeItem(item) {
      this.insumosOrden = this.insumosOrden.filter(i => i.id !== item.id);
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

    mostrarNotificacion(mensaje, tipo) {
      this.$buefy.toast.open({
        message: mensaje,
        type: tipo,
        position: "is-bottom",
        duration: 3000
      });
    }
  }
};
</script>

<style scoped>
.touch-order-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.products-panel {
  flex: 1;
  background: #f5f5f5;
  padding: 1rem;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}

.categories-header {
  margin-bottom: 1rem;
}

.categories-tabs {
  display: flex;
  overflow-x: auto;
  margin-bottom: 1rem;
  -webkit-overflow-scrolling: touch;
}

.category-tab {
  flex: 0 0 auto;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.category-tab.is-active {
  background: #ffc457;
  color: white;
  border-color: #faaa15;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 132px;
  height: 132px;
  margin-bottom: 0.5rem;
  color: #7a7a7a;
}


.product-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #363636;
}

.product-price {
  color: #bb7533;
  font-weight: bold;
}

.order-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.order-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dbdbdb;
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.order-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #363636;
}

.order-item {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-name {
  font-weight: 500;
  color: #2b413e;
}

.item-price {
  font-weight: bold;
  color: #f5a004;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #dbdbdb;
  background: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.25rem;
}

.quantity {
  color: #363636;
  margin: 0 0.5rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  margin-left: 0.5rem;
  color: #ff3860;
  background: none;
  border: none;
}

.empty-order {
  text-align: center;
  padding: 2rem;
  color: #7a7a7a;
}

.order-summary {
  padding: 1.5rem;
  border-top: 1px solid #dbdbdb;
}

.total-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: bold;
}

.total-label {
  color: #363636;
}

.total-amount {
  color: #dc3232;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.button {
  border-radius: 8px;
  height: 3.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .touch-order-container {
    flex-direction: column;
  }

  .order-panel {
    width: 100%;
    height: 50vh;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>