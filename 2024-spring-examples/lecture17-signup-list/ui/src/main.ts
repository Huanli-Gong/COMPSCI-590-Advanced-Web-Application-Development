import { createApp } from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

createApp(App)
	.use(BootstrapVue as any)
	.use(BootstrapVueIcons as any)
	.mount('#app')
