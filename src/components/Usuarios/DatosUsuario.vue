<template>
    <section>
        <ul v-if="errores.length > 0">
            <li class="has-text-danger has-text-centered" v-for="error in errores" :key="error">{{ error }}</li>
        </ul>
        <b-field label="Correo electrónico">
            <b-input type="email" placeholder="Correo del usuario" v-model="usuario.correo"></b-input>
        </b-field>
        <b-field label="Nombre">
            <b-input type="text" placeholder="Nombre del usuario" v-model="usuario.nombre"></b-input>
        </b-field>
        <b-field label="Teléfono">
            <b-input type="text" placeholder="Teléfono del usuario" v-model="usuario.telefono"></b-input>
        </b-field>

        <div class="has-text-centered">
            <b-button type="is-success" size="is-large" class="is-rounded  total-badge" icon-left="check"
                @click="registrar">Guardar Cambios</b-button>
        </div>
    </section>
</template>
<script>
import Utiles from '../../Servicios/Utiles'

export default ({
    name: "DatosUsuario",
    props: ["usuario"],

    data: () => ({
        errores: []
    }),

    methods: {
        registrar() {
            let datos = {
                correo: this.usuario.correo,
                nombre: this.usuario.nombre,
                telefono: this.usuario.telefono
            }
            this.errores = Utiles.validar(datos)
            if (this.errores.length > 0) return
            this.$emit("registrado", this.usuario)
        }
    }
})
</script>
<style>
.total-badge {
    font-size: 1.1em;
    padding: 8px 15px;
    border-radius: 20px;
    background: linear-gradient(135deg, #195e43, #34c9a3);
    color: white;
    box-shadow: 0 4px 10px rgba(72, 199, 116, 0.3);
}
</style>
