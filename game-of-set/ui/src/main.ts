import { createApp } from 'vue'
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import PlayerInfo from './views/Player.vue'
import GameHistory from './views/GameHistory.vue'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: Game,
    // props (route) {
    //   return {
    //     playerIndex: route.params.playerIndex
    //   }
    // }
  },
  {
    path: "/player",
    component: PlayerInfo,
  },
  {
    path: "/player-history",
    component: GameHistory,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any)
  .use(router)
  .mount('#app')
