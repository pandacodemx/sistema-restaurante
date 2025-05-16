<template>
    <b-navbar class="bg-fondo" type="is-light" :mobile-breakpoint="768" :active.sync="isNavActive">
        <!-- Logo / Marca -->
        <template #brand>
            <b-navbar-item>
                <img :src="logo" alt="logo" class="mr-2" style="max-height: 40px;">
                <span class="has-text-weight-semibold">{{ datosLocal.nombre }}</span>
            </b-navbar-item>

            <!-- Botón hamburguesa -->
            <b-navbar-burger @click="isNavActive = !isNavActive" :active="isNavActive"></b-navbar-burger>
        </template>

        <!-- Menú principal -->
        <template #start>
            <b-navbar-item tag="router-link" to="/" class="icon-item">
                <b-icon icon="home"></b-icon>
                <span class="nav-text">Inicio</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/realizar-orden" class="icon-item">
                <b-icon icon="monitor-multiple"></b-icon>
                <span class="nav-text">Ordenes</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/insumos" class="icon-item">
                <b-icon icon="food"></b-icon>
                <span class="nav-text">Insumos</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/categorias" class="icon-item">
                <b-icon icon="archive-outline"></b-icon>
                <span class="nav-text">Categorías</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/usuarios" class="icon-item">
                <b-icon icon="account-multiple"></b-icon>
                <span class="nav-text">Usuarios</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/reporte-ventas" class="icon-item">
                <b-icon icon="cash-register"></b-icon>
                <span class="nav-text">Ventas</span>
            </b-navbar-item>

            <b-navbar-item tag="router-link" to="/configurar" class="icon-item">
                <b-icon icon="brightness-7"></b-icon>
                <span class="nav-text">Configuración</span>
            </b-navbar-item>
        </template>

        <!-- Usuario / Botones -->
        <template #end>
            <b-navbar-item>
                <div class="buttons is-flex is-flex-wrap-wrap">
                    <b-button type="is-warning" size="is-small" icon-left="account" class="is-rounded mb-2"
                        @click="irAPerfil" title="Perfil">
                        {{ nombreUsuario }}
                    </b-button>
                    <b-button type="is-danger" size="is-small" icon-left="logout" class="is-rounded ml-2 mb-2"
                        @click="salir" title="Cerrar sesión">
                        Salir
                    </b-button>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>
</template>


<script>
import HttpService from '../Servicios/HttpService'
import Utiles from '../Servicios/Utiles'

export default {
    name: 'Encabezado',
    data: () => ({
        datosLocal: {},
        nombreUsuario: '',
        logo: null,
        isNavActive: false
    }),

    mounted() {
        this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario'
        this.obtenerDatos()
    },

    methods: {
        obtenerDatos() {
            HttpService.obtener("obtener_datos_local.php")
                .then(resultado => {
                    this.datosLocal = resultado
                    this.logo = Utiles.generarUrlImagen(this.datosLocal.logo)
                })
        },

        irAPerfil() {
            this.$router.push({ name: "Perfil" })
        },

        salir() {
            this.$buefy.dialog.confirm({
                title: 'Cerrar sesión',
                message: '<div class= "content" ><p><strong>¡Atención!</strong></p><p class="has-text-danger">Estas por cerrar sesión.</div>',
                confirmText: 'Salir',
                cancelText: 'Regresar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    localStorage.removeItem('logeado')
                    this.$emit("cerrar", false)
                    this.$buefy.toast.open('Hasta pronto')
                }
            })
        }
    }
}
</script>

<style scoped>
.bg-fondo {
    background-color: #f1f1f1;
    padding: 0 1rem;
}

/* Centrado del menú */
.navbar-center {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: auto;
}

/* Estilo para los items del menú */
.icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    margin: 8px 0.25rem;
    min-width: 50px;
    position: relative;
}

/* Ocultar texto inicialmente */
.nav-text {
    position: absolute;
    opacity: 0;
    font-size: 0.75rem;
    bottom: -10px;
    white-space: nowrap;
    transition: all 0.3s ease;
    color: #333;
}

/* Mostrar texto al hover */
.icon-item:hover .nav-text {
    opacity: 1;
    bottom: -5px;
}

/* Estilo para los iconos */
.icon-item .icon {
    margin-right: 0 !important;
    font-size: 1.25rem;
    color: #4a4a4a;
    transition: all 0.3s ease;
}

.icon-item:hover .icon {
    color: #000;
    transform: translateY(-2px);
}

/* Efecto hover suave */
.b-navbar-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 6px;
}

@media (max-width: 768px) {
    .buttons {
        flex-direction: column;
        align-items: stretch;
    }

    .icon-item {
        flex-direction: row;
        justify-content: flex-start;
        padding: 0.75rem;
    }

    .nav-text {
        opacity: 1;
        position: static;
        margin-left: 0.5rem;
    }

    .icon-item .icon {
        font-size: 1.1rem;
    }
}
</style>