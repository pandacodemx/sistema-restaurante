<template>
  <div class="bg-full p-6">
    <nav class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <p class="title is-3 has-text-weight-bold has-text-primary">
            <b-icon icon="basket" size="is-large" class="mr-3"></b-icon>
            Insumos
          <p class="ml-2 has-text-grey-light is-size-6">{{ insumos.length }} resultados</p>
          </p>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div class="notification">
            <b-button type="is-success" icon-left="plus" class="is-rounded badge-new has-text-weight-light"
              tag="router-link" to="/registrar-insumo">
              Agregar insumo
            </b-button>
          </div>
        </div>
      </div>
    </nav>

    <b-table class="elegant-table mt-5 p-5 is-size-7" :data="insumos" :paginated="isPaginated" :per-page="perPage"
      :bordered="false" :striped="false" :current-page.sync="currentPage" :pagination-simple="isPaginationSimple"
      :pagination-position="paginationPosition" :default-sort-direction="defaultSortDirection"
      :pagination-rounded="isPaginationRounded" :sort-icon="sortIcon" :sort-icon-size="sortIconSize"
      aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
      aria-current-label="Current page">


      <b-table-column field="icono" label="" v-slot="props">
        <b-icon icon="noodles" size="is-small" v-if="props.row.tipo === 'PLATILLO'">
        </b-icon>

        <b-icon icon="cup" size="is-small" v-if="props.row.tipo === 'BEBIDA'">
        </b-icon>
      </b-table-column>

      <b-table-column field="tipo" label="Tipo" sortable v-slot="props">
        {{ props.row.tipo }}
      </b-table-column>

      <b-table-column field="codigo" label="Código" searchable sortable v-slot="props">
        {{ props.row.codigo }}
      </b-table-column>

      <b-table-column field="imagen" label="Imagen" v-slot="props">
        <figure class="image is-64x64" @click="expandirImagen(props.row.imagen)" style="cursor: pointer;">
          <img :src="obtenerRutaImagen(props.row.imagen)" alt="Imagen de insumo" />
        </figure>
      </b-table-column>

      <b-table-column field="nombre" label="Nombre" searchable sortable v-slot="props">
        {{ props.row.nombre }}
      </b-table-column>

      <b-table-column field="descripcion" label="Descripción" searchable sortable v-slot="props">
        {{ props.row.descripcion }}
      </b-table-column>

      <b-table-column field="categoria" label="Categoría" searchable sortable v-slot="props">
        {{ props.row.categoria }}
      </b-table-column>

      <b-table-column field="precio" label="Precio" sortable v-slot="props">
        ${{ props.row.precio }}
      </b-table-column>

      <b-table-column field="acciones" label="Acciones" v-slot="props">
        <div class="field is-grouped">
          <p class="control">
            <b-button type="is-primary is-light" icon-left="clipboard-check" title="Editar" size="is-small"
              @click="editar(props.row.id)">
              Editar
            </b-button>
          </p>
          <p class="control">
            <b-button type="is-danger  is-light" icon-left="delete-circle" size="is-small" title="Eliminar"
              @click="eliminar(props.row)">
              Eliminar
            </b-button>
          </p>
        </div>
      </b-table-column>
    </b-table>

    <b-modal :active.sync="mostrarModalImagen" :can-cancel="['escape', 'outside']" scroll="keep">
      <div class="has-text-centered">
        <img :src="imagenExpandida" alt="Imagen expandida" style="max-width: 100%; max-height: 80vh;" />
      </div>
    </b-modal>


    <div class="field is-grouped box is-shadowless custom-box">
      <p class="control">
        <b-button type="is-success" icon-left="filter-variant" @click="filtrar = !filtrar">Filtro</b-button>
      </p>
      <p class="control">
        <b-select v-model="perPage">
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="15">15 por página</option>
          <option value="20">20 por página</option>
        </b-select>
      </p>
    </div>

    <div class="box has-background-light" v-if="filtrar">
      <b-field grouped group-multiline>
        <b-field label="Tipo de insumo" expanded>
          <b-select v-model="filtros.tipo" @change.native="busquedaAvanzada">
            <option value="" selected>Selecciona el tipo de insumo</option>
            <option value="PLATILLO">Platillo</option>
            <option value="BEBIDA">Bebida</option>
          </b-select>
        </b-field>
        <b-field label="Categoría" expanded>
          <b-select v-model="filtros.categoria" @change.native="busquedaAvanzada">
            <option value="" selected>Selecciona el tipo de insumo</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nombre }}
            </option>
          </b-select>
        </b-field>
        <b-field label="Nombre del insumo" expanded>
          <b-input type="text" placeholder="Buscador..." v-model="filtros.nombre" @input="busquedaAvanzada"></b-input>
        </b-field>
      </b-field>
    </div>
    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
  </div>
</template>
<script>
import HttpService from "../../Servicios/HttpService";

export default {
  name: "Insumos",

  data: () => ({
    filtrar: false,
    insumos: [],
    filtros: {
      tipo: "",
      categoria: "",
      nombre: "",
    },
    categorias: [],
    cargando: false,
    isPaginated: true,
    isPaginationSimple: false,
    isPaginationRounded: true,
    paginationPosition: "bottom",
    defaultSortDirection: "asc",
    sortIcon: "arrow-up",
    sortIconSize: "is-small",
    currentPage: 1,
    perPage: 20,
    imagenExpandida: null,
    mostrarModalImagen: false,

  }),

  mounted() {
    this.obtenerInsumos();
  },

  methods: {
    expandirImagen(ruta) {
      this.imagenExpandida = this.obtenerRutaImagen(ruta);
      this.mostrarModalImagen = true;
    },
    obtenerRutaImagen(ruta) {
      return `http://localhost/sistema-restaurante/api/${ruta}`;
    },
    busquedaAvanzada() {
      if (this.filtros.tipo === "BEBIDA" || this.filtros.tipo === "PLATILLO") {
        this.obtenerCategorias();
      }

      if (this.filtros.tipo === "") {
        this.categorias = [];
      }

      this.obtenerInsumos();
      this.filtros.categoria = "";
    },

    eliminar(insumo) {
      this.$buefy.dialog.confirm({
        title: `Eliminar ${insumo.nombre}`,
        message: `
        <div class="content">
          <p><strong>¡Atención!</strong></p>
          <p class="has-text-danger">¿Seguro que deseas eliminar el insumo <span class="has-text-weight-semibold">${insumo.nombre}</span>?</p>
          <p class="has-text-danger">Esta acción no se puede deshacer.</p>
        </div>`,
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          HttpService.eliminar("eliminar_insumo.php", insumo.id).then(
            (eliminado) => {
              if (eliminado) {
                this.obtenerInsumos();
                this.$buefy.toast.open("Insumo eliminado");
              }
            }
          );
        },
      });
    },

    editar(idInsumo) {
      this.$router.push({
        name: "EditarInsumo",
        params: { id: idInsumo },
      });
    },

    obtenerInsumos() {
      this.cargando = true;
      HttpService.obtenerConDatos(this.filtros, "obtener_insumos.php").then(
        (datos) => {
          this.insumos = datos;
          this.cargando = false;
        }
      );
    },

    obtenerCategorias() {
      HttpService.obtenerConDatos(
        this.filtros.tipo,
        "obtener_categorias_tipo.php"
      ).then((datos) => {
        this.categorias = datos;
      });
    },
  },
};
</script>
<style>
.bg-full {
  background-color: #f0efef;
  border-radius: 12px;
  min-height: 100dvh;
  padding: 20px;
  margin-top: 10px;
}

.has-shadow {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.is-radius {
  border-radius: 12px;
}

.gap-2 {
  gap: 0.5rem;
}

.box.has-background-light {
  border-radius: 8px;
  border: 1px solid #ddd;
}

.table td,
.table th {
  padding: 0.5rem 1rem;
  vertical-align: middle;
}

.custom-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.custom-box {
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  /* gris claro */
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

.field.is-grouped .control {
  margin-right: 4px;
}

.badge-new {
  font-size: 1.1em;
  padding: 8px 15px;
  border-radius: 20px;
  background: linear-gradient(135deg, #48b8c7, #115f72);
  color: white;
  box-shadow: 0 4px 10px rgba(72, 199, 116, 0.3);
}
</style>