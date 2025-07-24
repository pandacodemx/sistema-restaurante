<template>
    <section class="section">
        <div class="container">
            <h1 class="title has-text-centered mb-5 has-text-white">🧑‍🍳 Panel de Cocina</h1>

            <b-loading :active="cargando" is-full-page />

            <b-message v-if="mesasPendientes.length === 0" type="is-info">
                No hay órdenes pendientes en cocina.
            </b-message>

            <!-- Contenedor columnas Bulma -->
            <div class="columns is-multiline">
                <!-- Cada mesa en una columna de 6 (dos por fila en desktop) -->
                <div v-for="mesa in mesasPendientes" :key="mesa.mesa.idMesa"
                    class="column is-half-desktop is-full-mobile">
                    <div class="box mesa-card">
                        <h2 class="subtitle">
                            🪑 Mesa #{{ mesa.mesa.idMesa }} - {{ mesa.mesa.cliente || 'Sin nombre' }}
                        </h2>

                        <b-table :data="mesa.insumos" striped hoverable :mobile-cards="true">
                            <b-table-column field="nombre" label="Producto" v-slot="props">
                                <div>
                                    <strong>{{ props.row.nombre }}</strong>
                                    <b-tag type="is-dark" size="is-small" class="ml-2">
                                        x{{ props.row.cantidad }}
                                    </b-tag>
                                    <b-tag v-if="props.row.caracteristicas" type="is-info" size="is-small" class="ml-2">
                                        Detalle
                                    </b-tag>
                                </div>
                                <p v-if="props.row.caracteristicas" class="has-text-grey is-size-7 mt-1">
                                    {{ props.row.caracteristicas }}
                                </p>
                            </b-table-column>

                            <b-table-column field="estado" label="Estado" v-slot="props" width="150" centered>
                                <b-tag :type="props.row.estado === 'entregado'
                                    ? 'is-success'
                                    : props.row.estado === 'preparando'
                                        ? 'is-warning'
                                        : 'is-danger'" rounded>
                                    {{ props.row.estado }}
                                </b-tag>
                            </b-table-column>

                            <b-table-column label="Acción" v-slot="props" width="150" centered>
                                <b-button size="is-small" type="is-primary" @click="marcarPreparando(props.row)">
                                    Marcar preparando
                                </b-button>
                            </b-table-column>
                        </b-table>

                        <b-button type="is-success" @click="marcarOrdenLista(mesa)" class="mt-3" icon-left="check">
                            Marcar toda la orden como lista
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script>
import HttpService from '../../Servicios/HttpService';

export default {
    data() {
        return {
            mesas: [],
            cargando: false,
            autoActualizar: null,
        };
    },
    computed: {
        mesasPendientes() {
            return this.mesas.filter(m =>
                m.insumos.some(i => i.estado !== 'listo' && i.estado !== 'entregado' && i.tipo === 'PLATILLO')
            );
        }
    },
    mounted() {
        this.obtenerMesas();


        this.autoActualizar = setInterval(() => {
            this.obtenerMesas();
        }, 10000);
    },
    beforeDestroy() {
        clearInterval(this.autoActualizar);
    },
    methods: {
        obtenerMesas() {
            this.cargando = true;
            HttpService.obtener("obtener_mesas.php")
                .then(resultado => {
                    this.mesas = resultado;
                })
                .finally(() => this.cargando = false);
        },

        async marcarPreparando(insumo) {

            const mesa = this.mesas.find(m => m.mesa.idMesa === insumo.idMesa);
            if (!mesa) return;


            const insumoModificado = mesa.insumos.find(i => i.id === insumo.id);
            if (insumoModificado) {
                insumoModificado.estado = "preparando";


                const payload = {
                    id: mesa.mesa.idMesa,
                    atiende: mesa.mesa.atiende,
                    idUsuario: mesa.mesa.idUsuario,
                    total: mesa.mesa.total,
                    cliente: mesa.mesa.cliente,
                    insumos: mesa.insumos
                };

                try {
                    const resultado = await HttpService.registrar(payload, "editar_mesa.php");
                    if (resultado) {
                        this.$buefy.toast.open({ message: "Estado actualizado a preparando", type: "is-success" });
                        this.obtenerMesas();
                    }
                } catch (error) {
                    this.$buefy.toast.open({ message: "Error al actualizar estado", type: "is-danger" });
                }
            }
        },

        async marcarOrdenLista(mesa) {
            mesa.insumos.forEach(insumo => {
                // Cambia el estado a "listo", no a "entregado"
                if (insumo.estado !== 'entregado') {
                    insumo.estado = "listo";
                }
            });

            const payload = {
                id: mesa.mesa.idMesa,
                atiende: mesa.mesa.atiende,
                idUsuario: mesa.mesa.idUsuario,
                total: mesa.mesa.total,
                cliente: mesa.mesa.cliente,
                insumos: mesa.insumos
            };

            try {
                const resultado = await HttpService.registrar(payload, "editar_mesa.php");
                if (resultado) {
                    this.$buefy.toast.open({ message: "Orden marcada como lista para entregar", type: "is-success" });
                    this.obtenerMesas();
                }
            } catch (error) {
                this.$buefy.toast.open({ message: "Error al actualizar estado", type: "is-danger" });
            }
        }

    }
}

</script>
<style>
.box {
    background-color: #1f1f1f;
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.subtitle {
    font-weight: bold;
    color: #00d1b2;
}

.mesa-card {
    background-color: #1e1e1e;
    color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
}

.mesa-card:hover {
    transform: scale(1.01);
}
</style>