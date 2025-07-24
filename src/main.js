import Vue from "vue";
import App from "./App";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "@mdi/font/css/materialdesignicons.css";
import "./assets/scss/custom.scss";
import router from "./router";

Vue.use(Buefy);
Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>",
});
