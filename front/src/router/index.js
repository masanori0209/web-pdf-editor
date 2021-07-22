import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Main',
      desc: '遊び場リスト'
    }
  },
  {
    path: '/gif',
    name: 'Home',
    component: Home,
    meta: {
      title: 'GIF SEARCH',
      desc: 'GIF APIを使った遊び場'
    }
  },
  {
    path: '/pdf-editer',
    name: 'Home',
    component: Home,
    meta: {
      title: 'PDF EDITER',
      desc: 'PDFを編集できるツール'
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
