import { createApp } from 'vue'
import { BootstrapVue } from 'bootstrap-vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

createApp(App)
	.use(BootstrapVue)
	.mount('#app')
