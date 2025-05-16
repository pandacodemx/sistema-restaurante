<template>
    <div class="bg-full p-6">
        <section>
            <ul v-if="errores.length > 0">
                <li class="has-text-danger has-text-centered" v-for="error in errores" :key="error">{{ error }}</li>
            </ul>
            <b-field label="Tipo">
                <b-select v-model="insumo.tipo" @change.native="obtenerCategorias">
                    <option value="" disabled selected>Selecciona el tipo de insumo</option>
                    <option value="PLATILLO">
                        Platillo
                    </option>
                    <option value="BEBIDA">
                        Bebida
                    </option>
                </b-select>
            </b-field>

            <b-field label="Código">
                <b-input type="text" placeholder="Código insumo" v-model="insumo.codigo"></b-input>
            </b-field>

            <b-field label="Nombre">
                <b-input type="text" placeholder="Nombre" v-model="insumo.nombre"></b-input>
            </b-field>

            <b-field label="Descripción">
                <b-input maxlength="200" type="textarea" placeholder="Detalles del insumo"
                    v-model="insumo.descripcion"></b-input>
            </b-field>

            <b-field label="Categoría">
                <b-select v-model="insumo.categoria">
                    <option value="" selected disabled>Selecciona una categoría</option>
                    <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                        {{ categoria.nombre }}
                    </option>
                </b-select>
            </b-field>

            <b-field label="Precio">
                <b-input type="number" placeholder="Precio de venta" v-model="insumo.precio"></b-input>
            </b-field>

            <b-field label="Imagen del insumo">
                <input type="file" @change="onImagenSeleccionada" />
                <!-- Imagen actual previa -->
                <img v-if="insumo.imagen" :src="obtenerRutaImagen(insumo.imagen)" width="100" />
            </b-field>
            <div class="has-text-centered">
                <b-button type="is-success is-bold" size="is-large" class="is-rounded" icon-left="check"
                    @click="registrar">Guardar</b-button>
            </div>
        </section>
    </div>
</template>
<script>
import Utiles from '../../Servicios/Utiles'
import HttpService from '../../Servicios/HttpService'

export default {
    name: "DatosInsumo",
    props: ["insumo"],

    data: () => ({
        errores: [],
        categorias: [],
        imagen: null
    }),



    methods: {
        onImagenSeleccionada(event) {
            this.nuevaImagen = event.target.files[0];
        },
        obtenerRutaImagen(ruta) {
        return `http://localhost/sistema-restaurante/api/${ruta}`;
        },
        registrar() {
            let datos = {
                tipo: this.insumo.tipo,
                codigo: this.insumo.codigo,
                nombre: this.insumo.nombre,
                descripcion: this.insumo.descripcion,
                categoria: this.insumo.categoria,
                precio: this.insumo.precio
            }
            this.errores = Utiles.validar(datos)
            if (this.errores.length > 0) return

            // FormData para subir la imagen
            const formData = new FormData()
            for (let key in datos) {
                formData.append(key, datos[key])
            }

            if (this.imagen) {
                formData.append('imagen', this.imagen)
            }

            this.$emit("registrado", formData)
        },

        obtenerCategorias() {

            HttpService.obtenerConDatos(this.insumo.tipo, "obtener_categorias_tipo.php")
                .then(resultado => {
                    this.categorias = resultado
                })
        },
        onFileChange(event) {
            const file = event.target.files[0]
            this.imagen = file
        }
    }
}
</script>