<template>
    <div class="bg-full p-6">
        <section>
            <div class="level-left mb-5">
                <div class="level-item">
                    <div class="is-flex is-align-items-center mb-4">
                        <b-icon icon="table" type="is-success" size="is-medium" class="mr-2"></b-icon>
                        <p class="title is-3 mb-0">Mesas</p>
                        <p class="ml-2 has-text-grey-light is-size-6"> disponibles</p>
                    </div>
                </div>
            </div>


            <div class="columns is-multiline">
                <div class="column" v-for="mesa in mesas" :key="mesa.mesa.idMesa">

                    <div class="box">
                        <p class="title is-4 has-text-grey">Mesa #{{ mesa.mesa.idMesa }}
                            <span class="title is-3 has-text-weight-bold is-pulled-right" v-if="mesa.mesa.total">
                                <p class="has-text-grey-light">Total</p>
                                ${{ mesa.mesa.total }}
                            </span>
                        </p>
                        <p v-if="mesa.mesa.atiende">
                            <strong>Atendido por:</strong>: {{ mesa.mesa.atiende }}
                        </p>
                        <p v-if="mesa.mesa.cliente">
                            <strong>Cliente</strong>: {{ mesa.mesa.cliente }}
                        </p>
                        <b-collapse class="card mt-5" animation="slide" aria-id="contentIdForA11y3"
                            v-if="mesa.mesa.estado === 'ocupada'">
                            <template #trigger="props">
                                <div class="card-header" role="button" aria-controls="contentIdForA11y3"
                                    :aria-expanded="props.open">
                                    <p class="card-header-title">
                                        Orden:
                                    </p>
                                    <a class="card-header-icon">
                                        <b-icon :icon="props.open ? 'menu-down' : 'menu-up'">
                                        </b-icon>
                                    </a>
                                </div>
                            </template>

                            <div class="card-content">
                                <div class="content">
                                    <b-table class="minimal-table mt-5 p-4" :data="mesa.insumos"
                                        :checked-rows.sync="checkedRows"
                                        :is-row-checkable="(row) => row.estado !== 'entregado'" checkable
                                        :checkbox-position="checkboxPosition" :checkbox-type="checkboxType">

                                        <b-table-column field="codigo" label="Código" v-slot="props">
                                            {{ props.row.codigo }}
                                        </b-table-column>

                                        <b-table-column field="nombre" label="Nombre" v-slot="props">
                                            {{ props.row.nombre }}
                                        </b-table-column>

                                        <b-table-column field="caracteristicas" label="Características" v-slot="props">
                                            {{ props.row.caracteristicas }}
                                        </b-table-column>

                                        <b-table-column field="cantidad" label="Cantidad" v-slot="props">
                                            {{ props.row.cantidad }} X ${{ props.row.precio }}
                                        </b-table-column>

                                        <b-table-column field="subtotal" label="Subtotal" v-slot="props">
                                            ${{ props.row.cantidad * props.row.precio }}
                                        </b-table-column>
                                        <b-table-column field="estado" label="Entrega" v-slot="props">
                                            <b-icon icon="close-box" type="is-danger"
                                                v-if="props.row.estado === 'pendiente'"></b-icon>
                                            <b-icon icon="checkbox-marked" type="is-success"
                                                v-if="props.row.estado === 'entregado'"></b-icon>
                                        </b-table-column>
                                    </b-table>
                                </div>
                            </div>
                        </b-collapse>
                        <br>
                        <div class="has-text-centered">
                            <!-- Botón cuando la mesa está libre -->
                            <b-button type="is-primary" class="is-rounded is-fullwidth-mobile" icon-left="book"
                                @click="ocuparMesa(mesa)" v-if="mesa.mesa.estado === 'libre'">
                                Seleccionar
                            </b-button>

                            <!-- Botones cuando la mesa está ocupada -->
                            <div class="field is-grouped is-grouped-multiline is-justified-center botones-mesa"
                                v-if="mesa.mesa.estado === 'ocupada'">
                                <p class="control">
                                    <b-button type="is-info" class="is-rounded is-fullwidth-mobile"
                                        icon-left="cart-plus" @click="ocuparMesa(mesa)">
                                        Agregar insumos
                                    </b-button>
                                </p>

                                <p class="control">
                                    <b-button type="is-success" class="is-rounded is-fullwidth-mobile"
                                        icon-left="cash-multiple" @click="cobrar(mesa)">
                                        Cobrar
                                    </b-button>
                                </p>

                                <p class="control" v-if="checkedRows.length > 0">
                                    <b-button type="is-warning" class="is-rounded is-fullwidth-mobile"
                                        icon-left="checkbox-marked" @click="marcarInsumosEntregados(mesa)">
                                        Entregado
                                    </b-button>
                                </p>

                                <p class="control">
                                    <b-button type="is-danger" class="is-rounded is-fullwidth-mobile"
                                        icon-left="close-box" @click="cancelarOrden(mesa.mesa.idMesa)">
                                        Cancelar
                                    </b-button>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
            <ticket @impreso="onImpreso" :venta="this.ventaSeleccionada" :insumos="insumosSeleccionados"
                :datosLocal="datos" :logo="logo" v-if="mostrarTicket"></ticket>
        </section>
    </div>
</template>
<script>
import HttpService from '../../Servicios/HttpService'
import Ticket from '../Ventas/Ticket.vue'
import Utiles from '../../Servicios/Utiles'

export default ({
    name: "RealizarOrden",
    components: { Ticket },

    data: () => ({
        datos: {},
        logo: null,
        checkboxPosition: 'left',
        checkboxType: 'is-primary',
        checkedRows: [],
        mesas: [],
        cargando: false,
        mostrarTicket: false,
        ventaSeleccionada: {},
        insumosSeleccionados: []
    }),

    mounted() {
        this.crearMesas()
        this.obtenerDatos()
    },

    methods: {
        cancelarOrden(id) {
            this.$buefy.dialog.confirm({
                title: 'Cancelar Mesa # ' + id,
                message: '<div class="content"><p><strong>¡Atención!</strong></p>   <p class="has-text-danger">¿Seguro deseas cancelar la órden?</p></div> ',
                confirmText: 'Cancelar',
                cancelText: 'Atras',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    HttpService.eliminar("cancelar_mesa.php", id)
                        .then(resultado => {
                            if (resultado) {
                                this.$buefy.toast.open({
                                    message: "Orden de la mesa " + id + " cancelada",
                                    type: "is-success"
                                })
                                this.crearMesas()
                                this.cargando = false
                            }
                        })

                }
            })
        },

        obtenerDatos() {
            HttpService.obtener("obtener_datos_local.php").then((resultado) => {
                this.datos = resultado;
                this.logo = Utiles.generarUrlImagen(this.datos.logo)
            });
        },

        onImpreso(resultado) {
            this.mostrarTicket = resultado
        },

        imprimirComprobante(venta) {
            let hoy = new Date();

            let fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();

            let hora = hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();

            let fechaVenta = fecha + ' ' + hora
            this.ventaSeleccionada = {
                atendio: venta.atiende,
                cliente: venta.cliente,
                fecha: fechaVenta,
                pagado: venta.pagado,
                total: venta.total
            }

            this.insumosSeleccionados = venta.insumos
            this.mostrarTicket = true
        },

        marcarInsumosEntregados(mesa) {
            this.cargando = true
            let insumos = mesa.insumos
            let marcados = this.checkedRows

            insumos.forEach(insumo => {
                marcados.forEach(marca => {
                    if (insumo.id === marca.id)
                        insumo.estado = "entregado"
                })
            })

            let payload = {
                id: mesa.mesa.idMesa,
                insumos: insumos,
                total: mesa.mesa.total,
                atiende: mesa.mesa.atiende,
                idUsuario: mesa.mesa.idUsuario,
                cliente: mesa.mesa.cliente
            }

            HttpService.registrar(payload, "editar_mesa.php")
                .then(resultado => {
                    if (resultado) {
                        this.$buefy.toast.open({
                            message: 'Insumos marcados como entregados',
                            type: 'is-success'
                        })
                        this.crearMesas()
                        this.cargando = false
                    }
                    this.checkedRows = []
                })

        },

        cobrar(mesa) {
            this.$buefy.dialog.prompt({
                title: `Cobro mesa #` + mesa.mesa.idMesa,
                message: '<div class="content"><p><strong>¡Atención!</strong></p> <p class="has-text-danger has-text-weight-bold">El total a pagar $ ' + mesa.mesa.total + ' </p></div> ',

                inputAttrs: {
                    type: 'number',
                    value: "",
                    placeholder: 'Cantidad recibida',
                    min: 1,
                    confirmText: 'Aceptar'
                },
                trapFocus: true,
                onConfirm: (value) => {
                    if (parseFloat(value) < parseFloat(mesa.mesa.total)) {
                        this.$buefy.toast.open({
                            message: 'Atencion! Ingresa una cantidad correcta',
                            type: 'is-warning'
                        })
                        return
                    }

                    this.cargando = true
                    let cambio = parseFloat(value - mesa.mesa.total)

                    let payload = {
                        idMesa: mesa.mesa.idMesa,
                        cliente: mesa.mesa.cliente,
                        total: mesa.mesa.total,
                        pagado: value,
                        idUsario: mesa.mesa.idUsuario,
                        insumos: mesa.insumos,
                        atiende: mesa.mesa.atiende
                    }

                    HttpService.registrar(payload, "registrar_venta.php")
                        .then(registrado => {
                            if (registrado) {
                                this.$buefy.dialog.alert({
                                    title: 'Venta finalizada',
                                    message: '<div class="content"><p><strong>¡Mesa cerrada!</strong></p> <p class="has-text-danger has-text-weight-bold">Cambio a entregar <b>$' + cambio + '</b> </p></div>',
                                    confirmText: 'Terminar'
                                })
                                this.imprimirComprobante(payload)
                                this.crearMesas()
                                this.cargando = false
                            }
                        })

                }
            })
        },

        crearMesas() {
            this.cargando = true
            HttpService.obtener("obtener_mesas.php")
                .then(resultado => {
                    this.mesas = resultado
                    this.cargando = false
                })
        },

        ocuparMesa(mesa) {
            this.$router.push({
                name: "Ordenar",
                params: { id: mesa.mesa.idMesa, insumosEnLista: mesa.insumos, cliente: mesa.mesa.cliente },
            })
        }
    }
})
</script>
<style>
.bg-full {
    background-color: #f0efef;
    border-radius: 12px;
    min-height: 100dvh;
    padding: 20px;
    margin-top: 10px;
}

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
