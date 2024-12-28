import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Scrollable from './views/Scrollable.vue'
import Positioning from './views/Positioning.vue'
import Grid from './views/Grid.vue'

const routes = [
	{
		path: "/scrollable",
		component: Scrollable,
	},
	{
		path: "/positioning",
		component: Positioning,
	},
	{
		path: "/grid",
		component: Grid,
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(BootstrapVue)
	.use(BootstrapVueIcons)
	.use(router)
	.mount('#app')
