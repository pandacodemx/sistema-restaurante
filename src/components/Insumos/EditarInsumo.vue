<template>
    <div class="bg-full p-6">
        <section>
            <nav class="level is-mobile">
                <div class="level-left">
                    <div class="level-item">
                        <p class="title is-3 has-text-weight-bold has-text-primary">
                            <b-icon icon="basket" size="is-large" class="mr-3"></b-icon>
                            Editar insumo
                        </p>
                    </div>
                </div>
            </nav>
            <b-breadcrumb align="is-left">
                <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
                <b-breadcrumb-item tag='router-link' to="/insumos">Insumos</b-breadcrumb-item>
            </b-breadcrumb>
            <datos-insumo @registrado="onRegistrado" :insumo="insumo"></datos-insumo>
            <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
        </section>
    </div>
</template>
<script>
import HttpService from '../../Servicios/HttpService'
import DatosInsumo from './DatosInsumo.vue'

export default ({
    name: "EditarInsumo",
    components: { DatosInsumo },
    data: () => ({
        insumo: {},
        cargando: false
    }),

    mounted() {
        this.cargando = true
        HttpService.obtenerConDatos(this.$route.params.id, "obtener_insumo_id.php")
            .then(resultado => {
                this.insumo = resultado
                this.cargando = false
            })
    },

    methods: {
        onRegistrado(insumo) {
            this.insumo = insumo
            this.cargando = true
            HttpService.registrarP(this.insumo, "editar_insumo.php")
                .then(editado => {
                    if (editado) {
                        this.$buefy.toast.open({
                            message: 'Información actualizada',
                            type: 'is-success'
                        })
                        this.cargando = false
                        this.$router.push({
                            name: "Insumos",
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