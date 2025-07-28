<template>
    <div class="form-container p-5">
        <section class="form-card">
            <!-- Mensajes de error mejorados -->
            <div v-if="errores.length > 0" class="notification is-danger is-light">
                <b-icon icon="alert-circle" class="mr-2"></b-icon>
                <span v-for="error in errores" :key="error">{{ error }}<br></span>
            </div>

            <div class="columns is-multiline">
                <!-- Columna izquierda -->
                <div class="column is-half">
                    <b-field label="Tipo de insumo" label-position="on-border" class="has-text-weight-semibold">
                        <b-select v-model="insumo.tipo" @change.native="obtenerCategorias" expanded>
                            <option value="" disabled selected>Selecciona el tipo</option>
                            <option value="PLATILLO">Platillo</option>
                            <option value="BEBIDA">Bebida</option>
                        </b-select>
                    </b-field>

                    <b-field label="Código" label-position="on-border">
                        <b-input type="text" placeholder="Ej: PLAT-001" v-model="insumo.codigo"
                            icon="barcode"></b-input>
                    </b-field>

                    <b-field label="Nombre" label-position="on-border">
                        <b-input type="text" placeholder="Nombre del producto" v-model="insumo.nombre"
                            icon="tag"></b-input>
                    </b-field>

                    <b-field label="Descripción" label-position="on-border">
                        <b-input type="textarea" maxlength="200" placeholder="Detalles del producto"
                            v-model="insumo.descripcion"></b-input>
                    </b-field>
                </div>

                <!-- Columna derecha -->
                <div class="column is-half">
                    <b-field label="Categoría" label-position="on-border">
                        <b-select v-model="insumo.categoria" expanded :disabled="!insumo.tipo">
                            <option value="" selected disabled>Selecciona una categoría</option>
                            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                                {{ categoria.nombre }}
                            </option>
                        </b-select>
                    </b-field>

                    <b-field label="Precio" label-position="on-border">
                        <b-input type="number" placeholder="0.00" v-model="insumo.precio" icon="currency-usd">
                            <template #left>
                                <span class="icon is-left">$</span>
                            </template>
                        </b-input>
                    </b-field>

                    <b-field label="Imagen del producto" label-position="on-border" class="file-upload-field">
                        <div class="file has-name is-boxed">
                            <label class="file-label">
                                <input class="file-input" type="file" @change="onFileChange" accept="image/*">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <b-icon icon="image"></b-icon>
                                    </span>
                                    <span class="file-label">
                                        Seleccionar imagen...
                                    </span>
                                </span>
                                <span class="file-name" v-if="imagen">
                                    {{ imagen.name }}
                                </span>
                            </label>
                        </div>

                    </b-field>
                    <p class="help">Formatos: JPG, PNG (Máx. 2MB)</p>
                    <div v-if="imagenPreview" class="mt-4 has-text-centered">
                        <p class="has-text-weight-semibold mb-2">Vista previa:</p>
                        <img :src="imagenPreview" alt="Preview" style="max-height: 200px; border-radius: 8px;">
                    </div>
                </div>
            </div>

            <div class="has-text-centered mt-6">
                <b-button type="is-success" size="is-medium" class="is-rounded submit-button" icon-left="content-save"
                    @click="registrar" :loading="cargando">
                    Guardar Insumo
                </b-button>
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
        imagen: null,
        imagenPreview: null,
        cargando: false
    }),

    mounted() {
        if (this.insumo.imagen && typeof this.insumo.imagen === 'string') {
            this.imagenPreview = Utiles.generarUrlImagen(this.insumo.imagen)
        }
        if (this.insumo.tipo) {
            this.obtenerCategorias();
        }

    },
    methods: {
        generarUrlImagen(nombreArchivo) {
            return "http://localhost/sistema-restaurante-1/api/" + nombreArchivo;
        },

        onFileChange(event) {
            const file = event.target.files[0]
            if (file && file.size > 2 * 1024 * 1024) {
                this.errores = ["La imagen no debe exceder los 2MB"]
                return
            }
            this.imagen = file
            const reader = new FileReader()
            reader.onload = e => {
                this.imagenPreview = e.target.result
            }
            reader.readAsDataURL(file)
        },

        async registrar() {
            let datos = {
                id: this.insumo.id,
                tipo: this.insumo.tipo,
                codigo: this.insumo.codigo,
                nombre: this.insumo.nombre,
                descripcion: this.insumo.descripcion,
                categoria: this.insumo.categoria,
                precio: this.insumo.precio
            }

            this.errores = Utiles.validar(datos)
            if (this.errores.length > 0) return

            this.cargando = true

            try {
                const formData = new FormData()
                for (let key in datos) {
                    formData.append(key, datos[key])
                }

                if (this.imagen) {
                    formData.append('imagen', this.imagen)
                }

                this.$emit("registrado", formData)
            } catch (error) {
                console.error("Error al registrar:", error)
                this.errores = ["Ocurrió un error al guardar el insumo"]
            } finally {
                this.cargando = false
            }
        },

        obtenerCategorias() {
            if (!this.insumo.tipo) return

            HttpService.obtenerConDatos(this.insumo.tipo, "obtener_categorias_tipo.php")
                .then(resultado => {
                    this.categorias = resultado
                    if (!this.insumo.id) {
                        this.insumo.categoria = "";
                    }
                });
        }
    },
    watch: {
        insumo: {
            immediate: true,
            handler(nuevo) {
                if (nuevo && nuevo.imagen && !this.imagen) {
                    this.imagenPreview = this.generarUrlImagen(nuevo.imagen);
                }
                if (nuevo && nuevo.tipo) {
                    this.obtenerCategorias();
                }
            }
        }

    },
}
</script>

<style scoped>
.form-container {
    background-color: #f5f7fa;
    min-height: 100%;
}

.form-card {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.field-label {
    color: #4a4a4a;
    font-weight: 500;
}

.file-upload-field {
    margin-top: 1.5rem;
}

.file-cta {
    background-color: #f5f7fa;
    border-color: #dbdbdb;
}

.file-name {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.submit-button {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 209, 178, 0.25);
}

/* Mejora para los selects */
.select:not(.is-multiple):not(.is-loading)::after {
    border-color: #48c774;
}

/* Estilo para campos requeridos */
.required-field::after {
    content: " *";
    color: #ff3860;
}
</style>