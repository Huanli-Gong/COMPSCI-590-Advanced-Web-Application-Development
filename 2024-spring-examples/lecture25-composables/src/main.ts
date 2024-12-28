import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Clipboard from './views/Clipboard.vue'
import Timer from './views/Timer.vue'

const routes = [
	{
		path: "/clipboard",
		component: Clipboard,
	},
	{
		path: "/timer",
		component: Timer,
	},
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
