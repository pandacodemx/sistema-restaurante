<template>
    <div class="dashboard-container">
        <section class="mesas-section">
            <!-- Encabezado mejorado -->
            <div class="dashboard-header">
                <div class="header-content">
                    <b-icon icon="table" type="is-primary" size="is-large" class="header-icon"></b-icon>
                    <div>
                        <h1 class="dashboard-title">Gestión de Mesas</h1>
                        <p class="dashboard-subtitle">Mesas disponibles y ocupadas</p>
                    </div>
                </div>
                <b-button type="is-primary" icon-left="refresh" @click="crearMesas" :loading="cargando"
                    class="refresh-button badge-new">
                    Actualizar
                </b-button>
            </div>

            <!-- Filtros y búsqueda -->
            <div class="filters-container">
                <b-field grouped group-multiline>
                    <b-select v-model="filtroEstado" placeholder="Filtrar por estado" rounded>
                        <option value="todas">Todas las mesas</option>
                        <option value="libre">Mesas libres</option>
                        <option value="ocupada">Mesas ocupadas</option>
                    </b-select>
                    <b-input v-model="busqueda" placeholder="Buscar mesa o cliente..." type="search" icon="magnify"
                        rounded></b-input>
                </b-field>
            </div>

            <!-- Contador de mesas -->
            <div class="counters">
                <div class="counter-card">
                    <span class="counter-value">{{ mesasLibres }}</span>
                    <span class="counter-label">Mesas libres</span>
                </div>
                <div class="counter-card">
                    <span class="counter-value">{{ mesasOcupadas }}</span>
                    <span class="counter-label">Mesas ocupadas</span>
                </div>
                <div class="counter-card">
                    <span class="counter-value">${{ totalVentas }}</span>
                    <span class="counter-label">Ventas totales</span>
                </div>
            </div>

            <!-- Grid de mesas -->
            <div class="mesas-grid">
                <div class="mesa-card" v-for="mesa in mesasFiltradas" :key="mesa.mesa.idMesa" :class="{
                    'mesa-ocupada': mesa.mesa.estado === 'ocupada',
                    'mesa-libre': mesa.mesa.estado === 'libre',
                    'mesa-expandida': mesaExpandida === mesa.mesa.idMesa
                }" @click="toggleMesaExpandida(mesa.mesa.idMesa)">
                    <div class="mesa-header">
                        <div>
                            <h3 class="mesa-title">Mesa #{{ mesa.mesa.idMesa }}</h3>
                            <b-tag :type="mesa.mesa.estado === 'ocupada' ? 'is-danger' : 'is-success'" rounded>
                                {{ mesa.mesa.estado === 'ocupada' ? 'Ocupada' : 'Libre' }}
                            </b-tag>
                        </div>
                        <div v-if="mesa.mesa.total" class="mesa-total">
                            <span class="total-label">Total</span>
                            <span class="total-amount">${{ mesa.mesa.total }}</span>
                        </div>
                        <b-icon
                            :icon="mesaExpandida === mesa.mesa.idMesa ? 'chevron-double-down' : 'chevron-double-down'"
                            class="expand-icon"></b-icon>
                    </div>
                    <div class="mesa-expandible-content" v-if="mesaExpandida === mesa.mesa.idMesa">
                        <div class="mesa-details">
                            <div v-if="mesa.mesa.atiende" class="detail-item">
                                <b-icon icon="account" size="is-small"></b-icon>
                                <span>{{ mesa.mesa.atiende }}</span>
                            </div>
                            <div v-if="mesa.mesa.cliente" class="detail-item">
                                <b-icon icon="account-star" size="is-small"></b-icon>
                                <span>{{ mesa.mesa.cliente }}</span>
                            </div>
                        </div>
                        <div v-if="mesa.mesa.estado === 'ocupada'" class="orden-content">
                            <div class="table-container" @click.stop>
                                <b-table :data="mesa.insumos" :checked-rows.sync="checkedRows"
                                    :is-row-checkable="(row) => row.estado !== 'entregado'" checkable
                                    checkbox-position="left" checkbox-type="is-primary" striped hoverable detailed
                                    detail-key="id" mobile-cards :paginated="mesa.insumos.length > 5" per-page="5"
                                    row-clickable @row-click="toggleInsumoDetalles">


                                    <b-table-column field="nombre" label="Producto" v-slot="props">
                                        <span class="product-name">{{ props.row.nombre }}</span>
                                    </b-table-column>

                                    <b-table-column field="cantidad" label="Cant." v-slot="props" centered width="100">
                                        {{ props.row.cantidad }} × ${{ props.row.precio }}
                                    </b-table-column>

                                    <b-table-column field="estado" label="Estado" v-slot="props" centered width="140">
                                        <b-tag :type="props.row.estado === 'entregado' ? 'is-success' : 'is-danger'"
                                            rounded class="status-tag">
                                            <b-icon :icon="props.row.estado === 'entregado' ? 'check' : 'clock'"
                                                size="is-small"></b-icon>
                                            {{ props.row.estado === 'entregado' ? 'Entregado' : 'Pendiente' }}
                                        </b-tag>
                                    </b-table-column>

                                    <template #detail="props">
                                        <article class="details-box">
                                            <div class="details-content">
                                                <p><strong>Comentarios acerca de la orden:</strong> {{
                                                    props.row.caracteristicas ||
                                                    'N/A' }}</p>
                                            </div>
                                        </article>
                                    </template>

                                    <template #empty>
                                        <div class="has-text-centered">No hay insumos en esta orden</div>
                                    </template>
                                </b-table>
                            </div>

                            <!-- Botón de entregar seleccionados -->
                            <div class="has-text-right mt-3" v-if="checkedRows.length > 0">
                                <b-button type="is-warning" icon-left="check" @click="marcarInsumosEntregados(mesa)"
                                    size="is-small" rounded>
                                    Marcar {{ checkedRows.length }} seleccionados como entregados
                                </b-button>
                            </div>
                        </div>
                        <!-- Acciones -->
                        <div class="mesa-actions">
                            <!-- Mesa libre -->
                            <b-button v-if="mesa.mesa.estado === 'libre'" type="is-primary" icon-left="plus"
                                @click="ocuparMesa(mesa)" expanded rounded>
                                Ocupar mesa
                            </b-button>

                            <!-- Mesa ocupada -->
                            <div v-if="mesa.mesa.estado === 'ocupada'" class="action-buttons">
                                <b-button class="has-text-weight-semibold" type="is-info" icon-left="plus"
                                    @click="ocuparMesa(mesa)" rounded>
                                    Agregar
                                </b-button>

                                <b-button class="has-text-weight-semibold" type="is-success" icon-left="cash"
                                    @click="cobrar(mesa)" rounded>
                                    Cobrar
                                </b-button>

                                <b-button class="has-text-weight-semibold" type="is-warning" icon-left="check"
                                    @click="marcarInsumosEntregados(mesa)" :disabled="checkedRows.length === 0" rounded>
                                    Entregar
                                </b-button>

                                <b-button class="has-text-weight-semibold" type="is-danger" icon-left="close"
                                    @click="cancelarOrden(mesa.mesa.idMesa)" rounded>
                                    Cancelar
                                </b-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modales y componentes auxiliares -->
            <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>

            <ticket @impreso="onImpreso" :venta="ventaSeleccionada" :insumos="insumosSeleccionados" :datosLocal="datos"
                :logo="logo" v-if="mostrarTicket"></ticket>
        </section>
    </div>
</template>

<script>
import HttpService from '../../Servicios/HttpService'
import Ticket from '../Ventas/Ticket.vue'
import Utiles from '../../Servicios/Utiles'

export default {
    name: "GestorMesas",
    components: { Ticket },

    data: () => ({
        datos: {},
        logo: null,
        checkedRows: [],
        mesas: [],
        cargando: false,
        mostrarTicket: false,
        ventaSeleccionada: {},
        insumosSeleccionados: [],
        filtroEstado: "todas",
        busqueda: "",
        showDetails: null,
        mesaExpandida: null,
    }),

    computed: {
        mesasFiltradas() {
            return this.mesas.filter(mesa => {
                // Filtro por estado
                const estadoFiltro = this.filtroEstado === "todas" ||
                    mesa.mesa.estado === this.filtroEstado;

                // Filtro por búsqueda
                const busquedaFiltro = this.busqueda === "" ||
                    mesa.mesa.idMesa.toString().includes(this.busqueda) ||
                    (mesa.mesa.cliente && mesa.mesa.cliente.toLowerCase().includes(this.busqueda.toLowerCase()));

                return estadoFiltro && busquedaFiltro;
            });
        },

        mesasLibres() {
            return this.mesas.filter(m => m.mesa.estado === "libre").length;
        },

        mesasOcupadas() {
            return this.mesas.filter(m => m.mesa.estado === "ocupada").length;
        },

        totalVentas() {
            return this.mesas.reduce((total, mesa) => {
                return mesa.mesa.estado === "ocupada" ? total + parseFloat(mesa.mesa.total || 0) : total;
            }, 0).toFixed(2);
        }
    },

    mounted() {
        this.crearMesas();
        this.obtenerDatos();
    },

    methods: {
        toggleInsumoDetalles(insumo) {
            this.showDetails = this.showDetails === insumo.id ? null : insumo.id;
        }
        ,
        toggleMesaExpandida(idMesa) {

            if (this.mesaExpandida === idMesa) {
                this.mesaExpandida = null;
            } else {

                this.mesaExpandida = idMesa;
            }
        },
        cancelarOrden(id) {
            this.$buefy.dialog.confirm({
                title: `Cancelar orden Mesa #${id}`,
                message: `
                    <div class="content">
                        <p><b-icon icon="alert-circle" type="is-danger"></b-icon> <strong>¿Cancelar esta orden?</strong></p>
                        <p>Todos los productos no entregados serán eliminados.</p>
                    </div>
                `,
                confirmText: 'Confirmar cancelación',
                cancelText: 'Volver',
                type: 'is-danger',
                hasIcon: true,
                icon: 'alert-circle-outline',
                iconPack: 'mdi',
                onConfirm: () => {
                    this.cargando = true;
                    HttpService.eliminar("cancelar_mesa.php", id)
                        .then(resultado => {
                            if (resultado) {
                                this.$buefy.toast.open({
                                    message: `Orden de la mesa ${id} cancelada`,
                                    type: 'is-success',
                                    icon: 'check-circle-outline'
                                });
                                this.crearMesas();
                            }
                        })
                        .finally(() => this.cargando = false);
                }
            });
        },

        obtenerDatos() {
            HttpService.obtener("obtener_datos_local.php")
                .then((resultado) => {
                    this.datos = resultado;
                    this.logo = Utiles.generarUrlImagen(this.datos.logo);
                });
        },

        onImpreso(resultado) {
            this.mostrarTicket = resultado;
        },

        imprimirComprobante(venta) {
            const hoy = new Date();
            const fecha = hoy.toLocaleDateString();
            const hora = hoy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            this.ventaSeleccionada = {
                atendio: venta.atiende,
                cliente: venta.cliente,
                fecha: `${fecha} ${hora}`,
                pagado: venta.pagado,
                total: venta.total
            };

            this.insumosSeleccionados = venta.insumos;
            this.mostrarTicket = true;
        },

        marcarInsumosEntregados(mesa) {
            this.cargando = true;
            const insumos = mesa.insumos.map(insumo => {
                const estaMarcado = this.checkedRows.some(m => m.id === insumo.id);
                return estaMarcado ? { ...insumo, estado: "entregado" } : insumo;
            });

            const payload = {
                id: mesa.mesa.idMesa,
                insumos: insumos,
                total: mesa.mesa.total,
                atiende: mesa.mesa.atiende,
                idUsuario: mesa.mesa.idUsuario,
                cliente: mesa.mesa.cliente
            };

            HttpService.registrar(payload, "editar_mesa.php")
                .then(resultado => {
                    if (resultado) {
                        this.$buefy.toast.open({
                            message: 'Productos marcados como entregados',
                            type: 'is-success',
                            icon: 'check-circle-outline'
                        });
                        this.crearMesas();
                        this.checkedRows = [];
                    }
                })
                .finally(() => this.cargando = false);
        },

        cobrar(mesa) {
            this.$buefy.dialog.prompt({
                title: `Cobrar Mesa #${mesa.mesa.idMesa}`,
                message: `
                    <div class="content">
                        <p><strong>Total a pagar:</strong></p>
                        <p class="has-text-danger">$${mesa.mesa.total}</p>
                    </div>
                `,
                inputAttrs: {
                    type: 'number',
                    placeholder: 'Cantidad recibida',
                    min: mesa.mesa.total,
                    step: "0.01",
                    icon: 'cash-multiple'
                },
                trapFocus: true,
                confirmText: 'Confirmar pago',
                cancelText: 'Cancelar',
                onConfirm: (value) => {
                    const montoRecibido = parseFloat(value);
                    const total = parseFloat(mesa.mesa.total);

                    if (montoRecibido < total) {
                        this.$buefy.toast.open({
                            message: 'El monto recibido es menor al total',
                            type: 'is-danger',
                            icon: 'alert-circle'
                        });
                        return false;
                    }

                    this.cargando = true;
                    const cambio = (montoRecibido - total).toFixed(2);

                    const payload = {
                        idMesa: mesa.mesa.idMesa,
                        cliente: mesa.mesa.cliente,
                        total: total,
                        pagado: montoRecibido,
                        idUsario: mesa.mesa.idUsuario,
                        insumos: mesa.insumos,
                        atiende: mesa.mesa.atiende
                    };

                    HttpService.registrar(payload, "registrar_venta.php")
                        .then(registrado => {
                            if (registrado) {
                                this.$buefy.dialog.alert({
                                    title: 'Venta completada',
                                    message: `
                                        <div class="content">
                                            <p><strong>Cambio:</strong></p>
                                            <p class="has-text-danger">$${cambio}</p>
                                        </div>
                                    `,
                                    confirmText: 'Finalizar',
                                    icon: 'cash-register',
                                    type: 'is-success'
                                });
                                this.imprimirComprobante(payload);
                                this.crearMesas();
                            }
                        })
                        .finally(() => this.cargando = false);
                }
            });
        },

        crearMesas() {
            this.cargando = true;
            HttpService.obtener("obtener_mesas.php")
                .then(resultado => {
                    this.mesas = resultado;
                })
                .finally(() => this.cargando = false);
        },

        ocuparMesa(mesa) {
            this.$router.push({
                name: "Ordenar",
                params: {
                    id: mesa.mesa.idMesa,
                    insumosEnLista: mesa.insumos,
                    cliente: mesa.mesa.cliente
                },
            });
        }
    }
}
</script>

<style scoped>
.dashboard-container {
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 2rem;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon {
    background-color: #f0f7ff;
    padding: 0.75rem;
    border-radius: 50%;
}

.dashboard-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.dashboard-subtitle {
    font-size: 1rem;
    color: #7f8c8d;
}

.filters-container {
    margin-bottom: 1.5rem;
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.counters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.counter-card {
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    text-align: center;
    flex: 1;
    min-width: 120px;
}

.counter-value {
    font-size: 1.5rem;
    font-weight: 700;
    display: block;
    color: #189c9c;
}

.counter-label {
    font-size: 0.875rem;
    color: #000000;
}

/* Grid de mesas */
.mesas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    transition: all 0.3s ease;
}

/* Mesa expandida */
.mesa-expandida {
    grid-column: 1 / -1;
    /* Ocupa todas las columnas */
    order: -1;
    /* Mueve al principio del grid */
    margin-bottom: 1.5rem;
}

/* Contenido expandible */
.mesa-expandible-content {
    padding: 0 1.25rem 1.25rem;
    animation: fadeIn 0.3s ease;
}


.expand-icon {
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mesa-card:not(.mesa-expandida):hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .mesa-expandida {
        margin-bottom: 1rem;
    }

    .mesa-header {
        padding: 1rem;
    }

    .mesa-expandible-content {
        padding: 0 1rem 1rem;
    }
}

.mesa-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
}

.mesa-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.mesa-ocupada {
    border-top: 4px solid #f71643;
}

.mesa-libre {
    border-top: 4px solid #00d1b2;
}

.mesa-header {
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #f0f0f0;
}

.mesa-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.mesa-total {
    text-align: right;
}

.total-label {
    display: block;
    font-size: 0.75rem;
    color: #7f8c8d;
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
}

.mesa-details {
    padding: 0 1.25rem 1.25rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #34495e;
}

.orden-collapse {
    margin: 0 1.25rem;
    border-top: 1px solid #f0f0f0;
}

.collapse-trigger {
    padding: 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    color: #3498db;
    font-weight: 500;
}

.collapse-trigger.is-open {
    border-bottom: 1px solid #f0f0f0;
}

.orden-content {
    padding: 1rem 0;
}

.mesa-actions {
    padding: 1.25rem;
    border-top: 1px solid #f0f0f0;
}

.action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.detail-container {
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 0.5rem;
}

.total-display {
    font-size: 1.75rem;
    font-weight: 700;
    color: #27ae60;
    text-align: center;
    margin: 0.5rem 0;
}

.cambio-display {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e74c3c;
    text-align: center;
    margin: 0.5rem 0;
}

/* Añadir estos estilos al componente */
.table-container {
    width: 100%;
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    padding: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.product-name {
    font-weight: 500;
    color: #363636;
}

.status-tag {
    padding: 0.5em 0.75em;
    font-size: 0.85rem;
}

.details-box {
    background-color: #f9f9f9;
    border-radius: 6px;
    margin: 0.5rem 0;
    padding: 1rem;
}

.details-content {
    font-size: 0.9rem;
    line-height: 1.6;
}

.badge-new {
    font-size: 1.1em;
    padding: 8px 15px;
    border-radius: 20px;
    background: linear-gradient(135deg, #48b8c7, #115f72);
    color: white;
    box-shadow: 0 4px 10px rgba(72, 199, 116, 0.3);
}

/* Estilos para móviles */
@media screen and (max-width: 768px) {
    .table-container {
        font-size: 0.85rem;
    }

    .b-table .table td,
    .b-table .table th {
        padding: 0.5em 0.75em;
    }

    .product-name {
        font-size: 0.9rem;
    }

    .status-tag {
        font-size: 0.75rem;
        padding: 0.25em 0.5em;
    }
}

@media (max-width: 768px) {
    .mesas-grid {
        grid-template-columns: 1fr;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .action-buttons {
        grid-template-columns: 1fr;
    }
}
</style>