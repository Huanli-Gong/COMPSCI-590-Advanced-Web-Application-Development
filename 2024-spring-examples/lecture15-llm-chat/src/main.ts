import { createApp } from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'

createApp(App)
	.use(BootstrapVue)
	.use(BootstrapVueIcons)
	.mount('#app')
