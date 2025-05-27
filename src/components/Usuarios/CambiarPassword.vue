<template>
    <div class="bg-full p-6">
        <section class="container max-w-2xl mx-auto">
            <div class="mb-6">
                <h1 class="title is-1 has-text-weight-bold has-text-centered mb-2">
                    <b-icon icon="lock-reset" class="mr-3"></b-icon>
                    Cambiar contraseña
                </h1>
                <div class="divider"></div>
            </div>

            <article class="message is-success mb-6">
                <div class="message-header">
                    <p>Requisitos de contraseña</p>
                    <b-icon icon="information"></b-icon>
                </div>
                <div class="message-body content">
                    <ul class="has-text-left">
                        <li><b-icon icon="numeric" size="is-small"></b-icon> Al menos un número</li>
                        <li><b-icon icon="format-size" size="is-small"></b-icon> Al menos una mayúscula</li>
                        <li><b-icon icon="format-size" size="is-small"></b-icon> Al menos una minúscula</li>
                        <li><b-icon icon="cursor-text" size="is-small"></b-icon> Mínimo 8 caracteres</li>
                        <li class="has-text-weight-bold"><b-icon icon="logout" size="is-small"></b-icon> Deberás iniciar
                            sesión nuevamente</li>
                    </ul>
                </div>
            </article>

            <div class="box p-5">
                <b-field label="Contraseña actual" label-position="on-border">
                    <b-input type="password" placeholder="Contraseña actual" v-model="password.actual" password-reveal
                        icon="lock" @blur="checkCurrentPassword" :loading="checkingPassword">
                    </b-input>
                </b-field>

                <b-field label="Nueva contraseña" label-position="on-border" :type="passwordStrength.type"
                    :message="passwordStrength.message">
                    <b-input type="password" placeholder="Nueva contraseña" v-model="password.nueva" password-reveal
                        icon="lock-plus" @input="checkPasswordStrength">
                    </b-input>
                    <progress class="progress mt-2" :class="passwordStrength.progressClass"
                        :value="passwordStrength.strength" max="100"></progress>
                </b-field>

                <b-field label="Repite la nueva contraseña" label-position="on-border" :type="passwordMatch.type"
                    :message="passwordMatch.message">
                    <b-input type="password" placeholder="Repite la nueva contraseña" v-model="password.repiteNueva"
                        password-reveal icon="lock-check" @input="checkPasswordMatch">
                    </b-input>
                </b-field>

                <div v-if="errores.length > 0" class="notification is-danger is-light mt-4">
                    <button class="delete" @click="errores = []"></button>
                    <ul>
                        <li v-for="error in errores" :key="error">
                            <b-icon icon="alert-circle" size="is-small"></b-icon> {{ error }}
                        </li>
                    </ul>
                </div>

                <div class="buttons is-centered mt-6">
                    <b-button type="is-success" size="is-large" class="is-rounded" icon-left="content-save"
                        @click="cambiarPassword" :loading="cargando" :disabled="!formIsValid">
                        Guardar cambios
                    </b-button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import HttpService from '../../Servicios/HttpService'

export default {
    name: "CambiarPassword",

    data: () => ({
        password: {
            actual: "",
            nueva: "",
            repiteNueva: ""
        },
        errores: [],
        cargando: false,
        checkingPassword: false,
        currentPasswordValid: false,
        passwordStrength: {
            strength: 0,
            type: "",
            message: "",
            progressClass: ""
        },
        passwordMatch: {
            type: "",
            message: ""
        }
    }),

    computed: {
        formIsValid() {
            return this.currentPasswordValid &&
                this.passwordStrength.strength === 100 &&
                this.passwordMatch.type === "is-success" &&
                !this.cargando
        }
    },

    methods: {
        async checkCurrentPassword() {
            if (!this.password.actual) return;

            this.checkingPassword = true;
            try {
                const isValid = await this.verificarContraActual();
                this.currentPasswordValid = isValid;
                if (!isValid) {
                    this.errores.push("La contraseña actual ingresada no es correcta.");
                }
            } finally {
                this.checkingPassword = false;
            }
        },

        checkPasswordStrength() {
            const pass = this.password.nueva;
            let strength = 0;
            let messages = [];

            // Check length
            if (pass.length >= 8) strength += 30;
            else messages.push("Mínimo 8 caracteres");

            // Check uppercase
            if (/[A-Z]/.test(pass)) strength += 20;
            else messages.push("Al menos una mayúscula");

            // Check lowercase
            if (/[a-z]/.test(pass)) strength += 20;
            else messages.push("Al menos una minúscula");

            // Check number
            if (/\d/.test(pass)) strength += 20;
            else messages.push("Al menos un número");

            // Check special char (optional)
            if (/[^A-Za-z0-9]/.test(pass)) strength += 10;

            this.passwordStrength.strength = strength;

            if (strength < 50) {
                this.passwordStrength.type = "is-danger";
                this.passwordStrength.progressClass = "is-danger";
            } else if (strength < 80) {
                this.passwordStrength.type = "is-warning";
                this.passwordStrength.progressClass = "is-warning";
            } else {
                this.passwordStrength.type = "is-success";
                this.passwordStrength.progressClass = "is-success";
            }

            this.passwordStrength.message = messages.length ? messages.join(", ") : "Contraseña segura";
        },

        checkPasswordMatch() {
            if (!this.password.nueva || !this.password.repiteNueva) return;

            if (this.password.nueva === this.password.repiteNueva) {
                this.passwordMatch.type = "is-success";
                this.passwordMatch.message = "Las contraseñas coinciden";
            } else {
                this.passwordMatch.type = "is-danger";
                this.passwordMatch.message = "Las contraseñas no coinciden";
            }
        },

        async cambiarPassword() {
            if (!this.formIsValid) return;

            this.$buefy.dialog.confirm({
                title: "Confirmar cambio de contraseña",
                message: `
                    <div class="content">
                        <p>Estás a punto de cambiar tu contraseña.</p>
                        <p class="has-text-danger has-text-weight-bold">
                            <b-icon icon="alert"></b-icon> Serás desconectado y deberás iniciar sesión nuevamente.
                        </p>
                    </div>
                `,
                confirmText: 'Cambiar contraseña',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                icon: 'lock-alert',
                iconPack: 'mdi',
                onConfirm: async () => {
                    this.cargando = true;
                    try {
                        const id = localStorage.getItem('idUsuario');
                        const payload = {
                            id: id,
                            password: this.password.repiteNueva
                        };

                        const resultado = await HttpService.registrar(payload, "cambiar_password.php");
                        if (resultado) {
                            this.$buefy.toast.open({
                                message: 'Contraseña actualizada correctamente',
                                type: 'is-success'
                            });

                            // Clear sensitive data
                            this.password = { actual: "", nueva: "", repiteNueva: "" };

                            // Logout and reload
                            localStorage.removeItem('logeado');
                            setTimeout(() => window.location.reload(), 1500);
                        }
                    } catch (error) {
                        this.$buefy.toast.open({
                            message: 'Error al cambiar la contraseña',
                            type: 'is-danger'
                        });
                    } finally {
                        this.cargando = false;
                    }
                }
            });
        },

        async verificarContraActual() {
            const id = localStorage.getItem('idUsuario');
            const payload = {
                password: this.password.actual,
                id: id
            }
            return await HttpService.obtenerConDatos(payload, "verificar_password.php");
        },

        async validarDatos() {
            this.errores = [];

            if (!this.password.actual) {
                this.errores.push("Debes colocar la contraseña actual.");
            }

            if (!this.password.nueva) {
                this.errores.push("Debes colocar la contraseña nueva.");
            } else if (!this.validPass(this.password.nueva)) {
                this.errores.push('La contraseña nueva no cumple con los requisitos.');
            }

            if (!this.password.repiteNueva) {
                this.errores.push("Debes repetir la contraseña nueva.");
            } else if (this.password.nueva !== this.password.repiteNueva) {
                this.errores.push('Las contraseñas no coinciden.');
            }

            if (this.errores.length === 0) {
                const isValid = await this.verificarContraActual();
                if (!isValid) {
                    this.errores.push("La contraseña actual ingresada no es correcta.");
                    return false;
                }
                return true;
            }
            return false;
        },

        validPass(password) {
            const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
            return re.test(password);
        }
    }
}
</script>

<style scoped>
.bg-full {
    background-color: #f5f5f5;
    min-height: 100vh;
}

.divider {
    height: 4px;
    background: linear-gradient(to right, #00d1b2, transparent);
    width: 100px;
    margin: 0 auto;
}

.box {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.notification {
    border-left: 4px solid #ff3860;
}

.progress {
    height: 6px;
}
</style>