<template>
    <div class="bg-full">
        <section>
            <div class="is-flex is-align-items-center mb-4">
                <b-icon icon="basket" type="is-primary" size="is-medium" class="mr-2"></b-icon>
                <p class="title is-4 mb-0">Editar insumo</p>
            </div>
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