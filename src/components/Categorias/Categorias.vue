<template>
    <div class="bg-full p-6">
        <div>
            <nav class="level is-mobile">
                <div class="level-left">
                    <div class="level-item">
                        <p class="title is-3 has-text-weight-bold has-text-black">
                            
                            🥤🥗🍔🍗🍟🥓Categorías
                        </p>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <div class="notification">
                            <b-button type="is-success" icon-left="plus"
                                class="is-rounded badge-new has-text-weight-light" @click="abrirModal('registra')"">
                                    Añadir categoría
                            </b-button>
                        </div>
                    </div>
                </div>
            </nav>   
            <b-table class=" elegant-table mt-5 p-5 is-size-7" :data="categorias" :paginated="isPaginated"
                                :per-page="perPage" :bordered="true" :current-page.sync="currentPage"
                                :pagination-simple="isPaginationSimple" :pagination-position="paginationPosition"
                                :default-sort-direction="defaultSortDirection" :pagination-rounded="isPaginationRounded"
                                :sort-icon="sortIcon" :sort-icon-size="sortIconSize" aria-next-label="Next page"
                                aria-previous-label="Previous page" aria-page-label="Page"
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

                                <b-table-column field="nombre" label="Nombre" sortable v-slot="props">
                                    {{ props.row.nombre }}
                                </b-table-column>

                                <b-table-column field="descripcion" label="Descripción" sortable v-slot="props">
                                    {{ props.row.descripcion }}
                                </b-table-column>
                                <b-table-column field="acciones" label="Acciones" v-slot="props">

                                    <b-button type="is-danger  is-light" icon-left="delete-circle" size="is-small"
                                        title="Eliminar" @click="eliminar(props.row)">
                                        Eliminar
                                    </b-button>

                                    <b-button type="is-primary is-light" icon-left="clipboard-check" title="Editar"
                                        size="is-small" @click="editar(props.row)">
                                        Editar
                                    </b-button>
                                </b-table-column>

                                </b-table>
                                <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
                                <b-select v-model="perPage">
                                    <option value="5">5 por página</option>
                                    <option value="10">10 por página</option>
                                    <option value="15">15 por página</option>
                                    <option value="20">20 por página</option>
                                </b-select>

                                <b-modal :active.sync="mostrarModalCategoria" has-modal-card trap-focus
                                    :destroy-on-hide="false" aria-role="dialog" aria-label="Agregar categoría"
                                    close-button-aria-label="Close" aria-modal>

                                    <modal-categoria @registrado="onRegistrado" :categoria="categoria" :titulo="titulo"
                                        :tipo="tipo"></modal-categoria>

                                </b-modal>

                        </div>
                    </div>
</template>
<script>
import HttpService from '../../Servicios/HttpService'
import ModalCategoria from './ModalCategoria.vue'
export default {
    name: 'Categorias',
    components: {
        ModalCategoria
    },
    data() {
        return {
            mostrarModalCategoria: false,
            estaRegistrando: false,
            estaEditando: false,
            titulo: "",
            tipo: "",
            categoria: {
                tipo: "",
                nombre: "",
                descripcion: ""
            },
            categorias: [],
            isPaginated: true,
            isPaginationSimple: false,
            isPaginationRounded: true,
            paginationPosition: 'bottom',
            defaultSortDirection: 'asc',
            sortIcon: 'arrow-up',
            sortIconSize: 'is-small',
            currentPage: 1,
            perPage: 10,

        }
    },

    created() {
        this.obtenerCategorias()
    },

    methods: {
        eliminar(categoria) {
            this.$buefy.dialog.confirm({
                title: 'Eliminar ' + categoria.nombre,
                message: '<div class="content"><p> <strong>¡Atención!</strong></p><p class="has-text-danger">¿Estas seguro de eliminar la categoria?</p><p class="has-text-danger">Esta acción no se puede deshacer.</p></div >',
                confirmText: 'Eliminar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    HttpService.eliminar("eliminar_categoria.php", categoria.id)
                        .then(eliminado => {
                            if (eliminado) {
                                this.obtenerCategorias()
                                this.$buefy.toast.open('Categoría eliminada')
                                this.cargando = false
                            }
                        })

                }
            })
        },

        editar(categoria) {
            this.abrirModal("edita", categoria)
        },

        abrirModal(tipo, categoria = {}) {
            this.categoria = categoria

            this.mostrarModalCategoria = true
            if (tipo === "registra") {
                this.tipo = tipo
                this.titulo = "Agregar "
            }
            if (tipo === "edita") {
                this.tipo = tipo
                this.titulo = "Editar "
            }
        },

        onRegistrado() {
            this.obtenerCategorias()
            this.categoria = {
                tipo: "",
                nombre: "",
                descripcion: ""
            }
        },

        obtenerCategorias() {
            this.cargando = true
            HttpService.obtener("obtener_categorias.php")
                .then(resultado => {
                    this.categorias = resultado
                    this.cargando = false
                })
        }
    }
}
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