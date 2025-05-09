<template>
    <div class="bg-full p-6">
        <section>
            <br>
            <p class="title is-3 has-text-weight-semibold">
                <b-icon icon="account-group" size="is-medium" type="is-success">
                </b-icon>
                Usuarios
                <b-button type="is-success" icon-left="plus" class="is-rounded has-text-weight-light" tag="router-link"
                    to="/registrar-usuario">
                    Añadir usuario
                </b-button>
            </p>

            <b-table class="minimal-table mt-5 p-5" :data="usuarios" :paginated="isPaginated" :per-page="perPage"
                :bordered="true" :current-page.sync="currentPage" :pagination-simple="isPaginationSimple"
                :pagination-position="paginationPosition" :default-sort-direction="defaultSortDirection"
                :pagination-rounded="isPaginationRounded" :sort-icon="sortIcon" :sort-icon-size="sortIconSize"
                aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
                aria-current-label="Current page">

                <b-table-column field="correo" label="Correo" sortable v-slot="props">
                    {{ props.row.correo }}
                </b-table-column>

                <b-table-column field="nombre" label="Nombre" searchable sortable v-slot="props">
                    {{ props.row.nombre }}
                </b-table-column>

                <b-table-column field="telefono" label="Teléfono" searchable sortable v-slot="props">
                    {{ props.row.telefono }}
                </b-table-column>

                <b-table-column field="acciones" label="Acciones" v-slot="props">
                    <div class="field is-grouped">
                        <p class="control">
                            <b-button type="is-danger  is-light" icon-left="delete-circle" size="is-small"
                                title="Eliminar" @click="eliminar(props.row)">
                                Eliminar
                            </b-button>
                        </p>
                        <p class="control">
                            <b-button type="is-primary is-light" icon-left="clipboard-check" title="Editar"
                                size="is-small" @click="editar(props.row.id)">
                                Editar
                            </b-button>
                        </p>
                    </div>
                </b-table-column>
            </b-table>
            <b-select v-model="perPage">
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="15">15 por página</option>
                <option value="20">20 por página</option>
            </b-select>
            <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
        </section>
    </div>
</template>
<script>
import HttpService from '../../Servicios/HttpService'
export default {
    name: "Usuarios",

    data: () => ({
        usuarios: [],
        cargando: false,
        isPaginated: true,
        isPaginationSimple: false,
        isPaginationRounded: true,
        paginationPosition: 'bottom',
        defaultSortDirection: 'asc',
        sortIcon: 'arrow-up',
        sortIconSize: 'is-small',
        currentPage: 1,
        perPage: 10,
    }),

    mounted() {
        this.obtenerUsuarios()
    },

    methods: {
        eliminar(usuario) {
            this.$buefy.dialog.confirm({
                title: 'Eliminar el usuario ' + usuario.nombre,
                message: '¿Seguro que deseas eliminar el usuario? Esta acción no se puede deshacer',
                confirmText: 'Sí, eliminar',
                cancelText: 'No, salir',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    HttpService.eliminar("eliminar_usuario.php", usuario.id)
                        .then(eliminado => {
                            if (eliminado) {
                                this.obtenerUsuarios()
                                this.$buefy.toast.open('Usuario eliminado')
                            }
                        })

                }
            })
        },

        editar(idUsuario) {
            this.$router.push({
                name: "EditarUsuario",
                params: { id: idUsuario },
            })
        },

        obtenerUsuarios() {
            this.cargando = true
            HttpService.obtener("obtener_usuarios.php")
                .then(resultado => {
                    this.usuarios = resultado
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
</style>