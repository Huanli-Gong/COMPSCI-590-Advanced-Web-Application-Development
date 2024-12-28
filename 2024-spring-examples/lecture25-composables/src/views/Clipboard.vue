<template>
	<div class="mx-3 my-3">
		<h1>Clipboard</h1>
		<div v-if="isSupported">
			<b-form-input v-model="source" class="mb-2" />
			<b-button @click="copiedToast.show(); copy()">Copy to Clipboard</b-button>
			<b-toast ref="copiedToast" title="Composables">
  	    Your text has been copied to the clipboard.
	    </b-toast>
		</div>
		<b-alert show v-else variant="danger">Clipboard API is not supported</b-alert>
		<div class="mt-3">
			References:
			<ul>
				<li><a href="https://vueuse.org/core/useClipboard/">VueUse useClipboard</a></li>
				<li><a href="https://bootstrap-vue.org/docs/components/toast">BootstrapVue Toast</a></li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'

const source = ref("Hello, world")
const { copy, isSupported } = useClipboard({ source })
const copiedToast = ref(null as any)
</script>