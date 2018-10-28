import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import "./registerServiceWorker";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import socketio from "socket.io-client";
import VueSocketIO from "vue-socket.io";

Vue.use(VueSocketIO, socketio("http://localhost:3030"));

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
