import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import axios from 'axios'
import { GiphyFetch } from '@giphy/js-fetch-api'

Vue.use(Buefy)
Vue.config.productionTip = false
Vue.prototype.$axios = axios.create({
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  'Content-Type': 'application/json'
})
Vue.prototype.$gf = new GiphyFetch('sptbf1tstfTsUW56KcFRNTZuU02yb6k5')

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
