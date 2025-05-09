<template>
    <div class="bg-full">
        <section>
            <div class="is-flex is-align-items-center mb-4">
                <b-icon icon="basket" type="is-primary" size="is-medium" class="mr-2"></b-icon>
                <p class="title is-4 mb-0">Registrar insumo</p>
            </div>
            <b-breadcrumb align="is-left">
                <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
                <b-breadcrumb-item tag='router-link' to="/insumos">Insumos</b-breadcrumb-item>
            </b-breadcrumb>
            <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
            <datos-insumo @registrado="onRegistrado" :insumo="insumo"></datos-insumo>
        </section>
    </div>
</template>
<script>
import DatosInsumo from "./DatosInsumo.vue"
import HttpService from '../../Servicios/HttpService'

export default {
    name: "RegistrarInsumo",
    components: { DatosInsumo },

    data: () => ({
        cargando: false,
        insumo: {
            tipo: "",
            codigo: "",
            nombre: "",
            descripcion: "",
            categoria: "",
            precio: ""
        }
    }),

    methods: {
        onRegistrado(registro) {
            this.insumo = registro
            this.cargando = true
            HttpService.registrar(this.insumo, "registrar_insumo.php")
                .then(registrado => {
                    if (registrado) {
                        this.insumo = {
                            tipo: "",
                            codigo: "",
                            nombre: "",
                            descripcion: "",
                            categoria: "",
                            precio: ""
                        }
                        this.$buefy.toast.open({
                            message: 'Insumo registrado',
                            type: 'is-success'
                        })
                        this.cargando = false
                    }
                })
        }
    }

}
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