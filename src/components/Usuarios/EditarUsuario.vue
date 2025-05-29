<template>
    <div class="bg-full p-6">
        <section>
            <nav class="level is-mobile">
                <div class="level-left">
                    <div class="level-item">
                        <p class="title is-3 has-text-weight-bold has-text-primary">
                            <b-icon icon="account" size="is-large" class="mr-3"></b-icon>
                            Editar Usuario
                        </p>
                    </div>
                </div>
            </nav>
            <b-breadcrumb align="is-left">
                <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
                <b-breadcrumb-item tag='router-link' to="/usuarios">Usuarios</b-breadcrumb-item>
            </b-breadcrumb>
            <datos-usuario @registrado="onRegistrado" :usuario="usuario"></datos-usuario>
            <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
        </section>
    </div>
</template>
<script>
import HttpService from '../../Servicios/HttpService'
import DatosUsuario from './DatosUsuario.vue'

export default ({
    name: "EditarUsuario",
    components: { DatosUsuario },

    data: () => ({
        usuario: {},
        cargando: false
    }),

    mounted() {
        this.cargando = true
        HttpService.obtenerConDatos(this.$route.params.id, "obtener_usuario_id.php")
            .then(resultado => {
                this.usuario = resultado
                this.cargando = false
            })
    },

    methods: {
        onRegistrado(usuario) {
            this.usuario = usuario
            this.cargando = true
            HttpService.registrar(this.usuario, "editar_usuario.php")
                .then(editado => {
                    if (editado) {
                        this.$buefy.toast.open({
                            message: 'Información actualizada',
                            type: 'is-success'
                        })
                        this.cargando = false
                        this.$router.push({
                            name: "Usuarios",
                        })
                    }
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
</style>
