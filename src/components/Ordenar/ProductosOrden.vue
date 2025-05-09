<template>
  <section>
    <b-table class="minimal-table mt-5 p-4" :data="lista" :bordered="true" :narrowed="true">
      <b-table-column field="nombre" label="Nombre" v-slot="props">
        {{ props.row.nombre }}
      </b-table-column>

      <b-table-column field="precio" label="Precio" v-slot="props">
        ${{ props.row.precio }}
      </b-table-column>

      <b-table-column field="cantidad" label="Cantidad" v-slot="props">
        <span v-if="tipo == 'entregado'">
          {{ props.row.cantidad }}
        </span>

        <span v-if="tipo === 'nuevo'">
          <b-numberinput type="is-info" size="is-small" controls-position="compact" v-model="props.row.cantidad"
            :min="1" @input="calcularTotal"></b-numberinput>
        </span>

      </b-table-column>

      <b-table-column field="subtotal" label="Subtotal" v-slot="props">
        ${{ props.row.cantidad * props.row.precio }}
      </b-table-column>

      <b-table-column field="descripcion" label="Características" v-slot="props">
        <span v-if="tipo === 'entregado'">
          {{ props.row.caracteristicas }}
        </span>

        <span v-if="tipo === 'nuevo'">
          <b-input v-model="props.row.caracteristicas" placeholder="Comentarios cliente"></b-input>
        </span>
      </b-table-column>

      <b-table-column field="estado" label="" v-slot="props" v-if="tipo === 'entregado'">
        <b-icon icon="alert" type="is-danger" v-if="props.row.estado === 'pendiente'"></b-icon>
        <b-icon icon="check" type="is-success" v-if="props.row.estado === 'entregado'"></b-icon>
      </b-table-column>

      <b-table-column field="quitar" label="Quitar" v-slot="props" v-if="tipo === 'nuevo'">
        <b-button type="is-danger" class="mb-1" @click="eliminar(props.row.id)">
          <b-icon icon="delete"></b-icon>
        </b-button>
      </b-table-column>
    </b-table>
  </section>
</template>
<script>
export default {
  name: "ProductosOrden",
  props: ["lista", "tipo"],

  methods: {
    calcularTotal() {
      this.$emit("modificado")
    },

    eliminar(id) {
      this.$emit("quitar", id)
    }
  }
}
</script>
<style>
.minimal-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  font-size: 14px;
}

.minimal-table th {
  background-color: #e0e0e0;
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
</style>