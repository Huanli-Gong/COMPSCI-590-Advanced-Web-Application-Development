<template>
	<div class="mx-3 my-3">
		<h1>Timer</h1>
		Duration [Milliseconds]: <b-form-input v-model="timerDuration" debounce="500" number class="mb-2" />
		<b-button v-if="!timeRemaining" @click="start">Start</b-button>
		<div v-else>
			<b-button @click="stop">Stop</b-button>
			<b-table 
				stacked 
				borderless 
				small 
				:items="[{
					startTime: startTimestamp ? `${new Date(startTimestamp).toLocaleTimeString()} (${startTimestamp})` : '',
					currentTime: `${new Date(now).toLocaleTimeString()} (${now})`,
					'Time Remaining [Milliseconds]': Math.round(timeRemaining),
				}]"
			/>
		</div>
		<div class="mt-3">
			References:
			<ul>
				<li><a href="https://vueuse.org/core/useStorage/">VueUse useStorage</a></li>
				<li><a href="https://vueuse.org/core/useTimestamp/">VueUse useTimestamp</a></li>
				<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date">Date</a></li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStorage, useTimestamp } from '@vueuse/core'
import { computed, ref } from 'vue'

const startTimestamp = useStorage('start-timestamp', 0)
const timerDuration = ref(60000)
const timeRemaining = computed(() => startTimestamp.value ? Math.max(0, startTimestamp.value + timerDuration.value - now.value) : 0)
const now = useTimestamp({ interval: 200 })

function start() {
	startTimestamp.value = Date.now()
}

function stop() {
	startTimestamp.value = 0
}
</script>