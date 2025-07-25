<template>
    <section class="kds-fullscreen">
        <h1 class="kds-title">🧑‍🍳 Cocina KDS - Órdenes Pendientes</h1>

        <b-loading :active="cargando" is-full-page />

        <div v-if="mesasPendientes.length === 0" class="kds-message">
            No hay órdenes pendientes en cocina.
        </div>

        <div class="kds-list">
            <div v-for="mesa in mesasPendientes" :key="mesa.mesa.idMesa" class="kds-card">
                <h2 class="kds-subtitle">
                    🪑 Mesa #{{ mesa.mesa.idMesa }} - {{ mesa.mesa.cliente || 'Sin nombre' }}
                </h2>

                <div class="kds-items">
                    <div v-for="insumo in mesa.insumos.filter(i => i.tipo === 'PLATILLO' && i.estado !== 'listo' && i.estado !== 'entregado')"
                        :key="insumo.id" class="kds-item">
                        <div class="kds-item-info">
                            <strong>{{ insumo.nombre }}</strong>
                            <span class="kds-quantity">x{{ insumo.cantidad }}</span>
                            <p v-if="insumo.caracteristicas" class="kds-detail">{{ insumo.caracteristicas }}</p>
                        </div>

                        <div class="kds-actions">
                            <button v-if="insumo.estado === 'pendiente'" class="kds-button is-primary"
                                @click="cambiarEstadoInsumo(insumo, mesa, 'preparando')">
                                Marcar preparando
                            </button>

                            <button v-else-if="insumo.estado === 'preparando'" class="kds-button is-warning"
                                @click="cambiarEstadoInsumo(insumo, mesa, 'pendiente')">
                                Volver a pendiente
                            </button>

                            <button v-if="insumo.estado === 'preparando'" class="kds-button is-success"
                                @click="cambiarEstadoInsumo(insumo, mesa, 'listo')">
                                Marcar listo
                            </button>

                            <span v-if="insumo.estado === 'listo'" class="kds-status is-success">Listo</span>
                        </div>
                    </div>
                </div>

                <button class="kds-button is-success kds-fullwidth" @click="marcarOrdenLista(mesa)">
                    Marcar toda la orden como lista
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import HttpService from '../../Servicios/HttpService'

export default {
    data() {
        return {
            mesas: [],
            cargando: false,
            autoActualizar: null,
            sonidoNuevaOrden: null,
            ultimoConteoPendientes: 0
        }
    },

    computed: {
        mesasPendientes() {
            return this.mesas.filter(m =>
                m.insumos.some(i => i.estado !== 'listo' && i.estado !== 'entregado' && i.tipo === 'PLATILLO')
            )
        }
    },

    mounted() {
        this.sonidoNuevaOrden = new Audio('/sonidos/alerta.mp3') // Pon aquí la ruta de un mp3 corto para alertas
        this.obtenerMesas()

        this.autoActualizar = setInterval(() => {
            this.obtenerMesas()
        }, 10000)
    },

    beforeDestroy() {
        clearInterval(this.autoActualizar)
    },

    methods: {
        async cambiarEstadoInsumo(insumo, mesa, nuevoEstado) {
            const insumoModificado = mesa.insumos.find(i => i.id === insumo.id)
            if (!insumoModificado) return

            const payload = {
                id: mesa.mesa.idMesa,
                atiende: mesa.mesa.atiende,
                idUsuario: mesa.mesa.idUsuario,
                total: mesa.mesa.total,
                cliente: mesa.mesa.cliente,
                insumos: mesa.insumos.map(i =>
                    i.id === insumo.id ? { ...i, estado: nuevoEstado } : i
                )
            }

            try {
                const resultado = await HttpService.registrar(payload, 'editar_mesa.php')
                if (resultado) {
                    this.$buefy.toast.open({
                        message: `Estado actualizado a ${nuevoEstado}`,
                        type: 'is-success'
                    })
                    this.obtenerMesas()
                }
            } catch (error) {
                this.$buefy.toast.open({
                    message: 'Error al actualizar estado',
                    type: 'is-danger'
                })
            }
        },

        async marcarOrdenLista(mesa) {
            mesa.insumos.forEach(insumo => {
                if (insumo.estado !== 'entregado') {
                    insumo.estado = 'listo'
                }
            })

            const payload = {
                id: mesa.mesa.idMesa,
                atiende: mesa.mesa.atiende,
                idUsuario: mesa.mesa.idUsuario,
                total: mesa.mesa.total,
                cliente: mesa.mesa.cliente,
                insumos: mesa.insumos
            }

            try {
                const resultado = await HttpService.registrar(payload, 'editar_mesa.php')
                if (resultado) {
                    this.$buefy.toast.open({
                        message: 'Orden marcada como lista para entregar',
                        type: 'is-success'
                    })
                    this.obtenerMesas()
                }
            } catch (error) {
                this.$buefy.toast.open({
                    message: 'Error al actualizar estado',
                    type: 'is-danger'
                })
            }
        },

        async obtenerMesas() {
            this.cargando = true
            try {
                const resultado = await HttpService.obtener('obtener_mesas.php')
                if (resultado) {
                    // Detectar nuevas órdenes pendientes para alerta sonora
                    const nuevoConteo = resultado.filter(m =>
                        m.insumos.some(i => i.estado !== 'listo' && i.estado !== 'entregado' && i.tipo === 'PLATILLO')
                    ).length

                    if (nuevoConteo > this.ultimoConteoPendientes) {
                        this.sonidoNuevaOrden.play().catch(() => { })
                    }

                    this.ultimoConteoPendientes = nuevoConteo
                    this.mesas = resultado
                }
            } catch (error) {
                this.$buefy.toast.open({
                    message: 'Error al cargar órdenes',
                    type: 'is-danger'
                })
            } finally {
                this.cargando = false
            }
        }
    }
}
</script>

<style scoped>
.kds-fullscreen {
    height: 100vh;
    width: 100vw;
    background-color: #1e1e1e;
    color: white;
    overflow: hidden;
    padding: 30px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.kds-title {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 2rem;
    font-weight: 700;
    color: #00d1b2;
}

.kds-list {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    padding-right: 15px;
}

.kds-card {
    background: #222;
    padding: 25px;
    margin-bottom: 20px;
    border-radius: 15px;
    box-shadow: 0 0 20px #00d1b2aa;
}

.kds-subtitle {
    font-size: 2rem;
    margin-bottom: 15px;
    color: #00d1b2;
    font-weight: 700;
}

.kds-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.kds-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #333;
    padding: 15px 20px;
    border-radius: 12px;
}

.kds-item-info strong {
    font-size: 1.5rem;
}

.kds-quantity {
    background: #00d1b2;
    color: #1e1e1e;
    padding: 3px 10px;
    border-radius: 20px;
    margin-left: 15px;
    font-weight: 700;
}

.kds-detail {
    font-size: 1rem;
    color: #bbb;
    margin-top: 5px;
}

.kds-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.kds-button {
    font-size: 1.4rem;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    color: white;
    transition: background-color 0.3s ease;
}

.kds-button.is-primary {
    background-color: #00d1b2;
}

.kds-button.is-warning {
    background-color: #ffae42;
}

.kds-button.is-success {
    background-color: #28a745;
}

.kds-button:hover {
    filter: brightness(1.1);
}

.kds-status.is-success {
    background-color: #28a745;
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-weight: 700;
}

.kds-fullwidth {
    width: 100%;
    margin-top: 20px;
}

.kds-message {
    font-size: 2rem;
    text-align: center;
    margin-top: 5rem;
    color: #aaa;
}
</style>
