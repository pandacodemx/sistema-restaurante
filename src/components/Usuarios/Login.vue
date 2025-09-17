<template>
  <section class="hero is-fullheight login-background">
    <!-- HEADER -->
    <nav class="navbar is-transparent p-3 blur-header">
      <div class="navbar-end">
        <a class="navbar-item has-text-white" @click="abrirSoporte">
          <b-icon icon="cellphone"></b-icon>
        </a>
        <a class="navbar-item has-text-white" @click="abrirContacto">
          <b-icon icon="email"></b-icon>
        </a>
      </div>
    </nav>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="hero-body is-flex is-justify-content-center">
      <div class="columns is-vcentered is-centered is-multiline login-container">
        <!-- INFO DEL SISTEMA -->
        <div class="column is-12-mobile is-6-desktop system-info p-5 mb-5-mobile">
          <div class="has-text-centered mb-5">
            <img src="https://i.imgur.com/glVB1ca.png" class="system-logo mb-4" />
         
            <p class="subtitle has-text-light is-size-7-mobile is-size-6-tablet">
              Gestión integral de ventas, menú y control de pedidos.
            </p>
          </div>
          <div class="content has-text-white is-size-7-mobile is-size-6-tablet">
            <p><b-icon icon="account-multiple" class="mr-2 has-text-primary"></b-icon> Gestión de clientes y mesas</p>
            <p><b-icon icon="credit-card" class="mr-2 has-text-primary"></b-icon> Control de ventas y pagos</p>
            <p><b-icon icon="chart-bar" class="mr-2 has-text-primary"></b-icon> Reportes en tiempo real</p>
            <p><b-icon icon="shield-check" class="mr-2 has-text-primary"></b-icon> Acceso seguro</p>
          </div>
          <p class="has-text-grey-light mt-5 is-size-7">Versión 1.0 - Bamboo POS Food Service</p>
        </div>

        <!-- FORMULARIO -->
        <div class="column is-12-mobile is-6-desktop">
          <form class="box p-5 login-form">
            <div class="has-text-centered mb-5">
              <img src="https://i.imgur.com/iZaTprC.png"
                class="form-logo mb-3" />
              <h2 class="title has-text-white is-size-5-mobile is-size-4-tablet">Iniciar Sesión</h2>
            </div>

            <b-field>
              <b-input placeholder="Correo electrónico" type="email" icon="email" v-model="correo"></b-input>
            </b-field>
            <b-field>
              <b-input type="password" placeholder="Contraseña" v-model="password" password-reveal></b-input>
            </b-field>

            <div class="field has-text-centered mt-5">
              <b-button type="is-primary" size="is-medium" class="is-rounded px-6" @click="ingresar" icon-left="login">
                Ingresar
              </b-button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="hero-footer has-text-centered blur-footer p-3">
      <p class="has-text-white is-size-7-mobile is-size-6-tablet">
        <b-icon icon="code-braces"></b-icon> Desarrollado por PandaCode - Bamboo POS Food Service ©  {{ new Date().getFullYear() }}
      </p>
    </div>

    <!-- Loading -->
    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
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
        this.$buefy.toast.open({ message: 'Debes colocar el correo', type: 'is-warning' })
        return
      }
      if (!this.password) {
        this.$buefy.toast.open({ message: 'Debes colocar la contraseña', type: 'is-warning' })
        return
      }
      this.cargando = true
      let payload = { correo: this.correo, password: this.password }
      HttpService.obtenerConDatos(payload, "iniciar_sesion.php")
        .then(log => {
          if (log.resultado === "cambia") {
            this.$buefy.toast.open({ message: 'Debes cambiar tu contraseña', type: 'is-info' })
            this.$emit("logeado", log)
          } else if (log.resultado) {
            this.$buefy.toast.open({ message: 'Bienvenido', type: 'is-success' })
            this.$emit("logeado", log)
          } else {
            this.$buefy.toast.open({ message: 'Datos incorrectos', type: 'is-danger' })
          }
          this.cargando = false
        })
    },
    abrirSoporte() {
      this.$buefy.dialog.alert("Soporte: 555-123-456")
    },
    abrirContacto() {
      this.$buefy.dialog.alert("Email: soporte@pandacode.com")
    }
  }
}
</script>

<style scoped>
.login-background {
  background: url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092') no-repeat center center fixed;
  background-size: cover;
}
.blur-header,
.blur-footer {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}
.system-info {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
}
.login-form {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 20px;
}
.system-logo {
  max-width: 1080px;
  width: 85%;
}
.form-logo {
  max-width: 100px;
  width: 50%;
}
.help.is-danger{
     color: #ffffff !important; 
}
@media (max-width: 768px) {
  .system-info {
    margin-bottom: 1.5rem;
    text-align: center;
  }
}
</style>
