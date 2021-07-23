import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import axios from 'axios'

Vue.use(Buefy)
Vue.config.productionTip = false
Vue.prototype.$axios = axios.create({
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  'Content-Type': 'application/json'
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
