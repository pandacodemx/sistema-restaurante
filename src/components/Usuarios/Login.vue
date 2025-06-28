<template>
    <section class="hero is-fullheight fondo">

        <div class="hero-body">

            <div class="container">
                <div class="has-text-centered mb-6">
                    <h1 class="title is-1 has-text-white titulo">
                        Sistema para restaurantes
                    </h1>
                    <p class="subtitle is-3 has-text-light">
                        Gestión integral de ventas y menú
                    </p>
                </div>
                <div class="columns is-centered">
                    <div class="column is-5-tablet is-4-desktop">
                        <form class="box p-6">
                            <div class="has-text-centered mb-5">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/2367px-Vue.js_Logo_2.svg.png_.png"
                                    alt="Logo" width="80">
                                <h2 class="title is-4 mt-3 has-text-white">
                                    <b-icon icon="login" class="mr-2"></b-icon>
                                    Iniciar sesión
                                </h2>
                            </div>
                            <b-field>
                                <b-input placeholder="Correo electrónico" type="email" icon="email" v-model="correo">
                                </b-input>
                            </b-field>

                            <b-field>
                                <b-input type="password" placeholder="Contraseña" v-model="password" password-reveal>
                                </b-input>
                            </b-field>

                            <div class="field has-text-centered">
                                <b-button icon-left="login" type="is-primary" class="is-rounded" size="is-medium"
                                    @click="ingresar">Ingresar</b-button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="hero-footer has-text-centered pb-5">
                    <p class="has-text-light">¿Necesitas ayuda? <a
                            class="has-text-weight-semibold has-text-white">Contáctanos</a></p>
                </div>
                <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
            </div>
        </div>

    </section>
</template>
<script>
import HttpService from '../../Servicios/HttpService'

export default {
    name: "Login",

    data: () => ({
        correo: "",
        password: "",
        cargando: false
    }),

    methods: {
        ingresar() {
            if (!this.correo) {
                this.$buefy.toast.open({
                    message: 'Debes colocar el correo',
                    type: 'is-warning'
                })
                return
            }
            if (!this.password) {
                this.$buefy.toast.open({
                    message: 'Debes colocar la contraseña',
                    type: 'is-warning'
                })
                return
            }
            this.cargando = true
            let payload = {
                correo: this.correo,
                password: this.password
            }

            HttpService.obtenerConDatos(payload, "iniciar_sesion.php")
                .then(log => {
                    if (log.resultado === "cambia") {
                        this.$buefy.toast.open({
                            message: 'Datos correctos. Debes cambiar tu contraseña',
                            type: 'is-info'
                        })
                        this.$emit("logeado", log)
                        this.cargando = false
                        return
                    }

                    if (log.resultado) {
                        this.$buefy.toast.open({
                            message: 'Datos correctos. Bienvenido',
                            type: 'is-success'
                        })
                        this.$emit("logeado", log)
                        this.cargando = false
                    } else {
                        this.$buefy.toast.open({
                            message: 'Datos incorrectos. Verifica tu información',
                            type: 'is-danger'
                        })
                        this.cargando = false
                    }
                })

        }
    }

}
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

.fondo {
    background: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') no-repeat center center fixed;
    background-size: cover;
    position: relative;
}

.fondo::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    /* Ajusta la opacidad aquí */
}

.hero-body {
    position: relative;
    /* Para que el contenido aparezca sobre el overlay */
}

.box {
    background: rgba(255, 255, 255, 0.582);
    transition: box-shadow 0.2s ease;
    backdrop-filter: blur(5px);
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    border: none;
}

.box:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    /* Sombra sutil */
}

.b-input {
    border-radius: 8px;
    border: 1px solid #e1e1e1;
    transition: all 0.3s;
}

.b-input:hover,
.b-input:focus {
    border-color: #8c5b00;
    box-shadow: 0 0 0 0.125em rgba(140, 91, 0, 0.25);
}

.button.is-primary {
    background-color: #8c5b00;
    border: none;
    font-weight: bold;
    letter-spacing: 0.5px;
    padding: 1.5em 2em;
}

.button.is-primary:hover {
    background-color: #a56a00;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(140, 91, 0, 0.4);
}

.titulo {
    font-family: 'Playfair Display', serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 2rem;
    font-weight: 700;
    line-height: 1.2;
}
</style>