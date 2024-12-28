<template>
  <div>
    <div>Increment: {{ increment.toFixed(2) }}</div>
    <b-button class="mr-2 mb-2" @click="increment += 0.05">+</b-button>
    <b-button class="mr-2 mb-2" @click="increment = Math.max(0.1, increment - 0.05)">-</b-button>
    <b-form-checkbox v-model="oddEvenZIndex">odd/even z-index</b-form-checkbox>
    <transition-group name="list">
      <div
        v-for="point, i in points"
        :key="i" 
        class="point"
        :style="{ 
          left: point.x + 'rem', 
          top: point.y + 'rem', 
          marginLeft: 2*radius + 'rem', 
          marginTop: 2*radius + 'rem',
          zIndex: oddEvenZIndex ? i % 2 : undefined,
          backgroundColor: i % 2 === 0 ? '#0000ffd0' : '#00ff00d0',
        }"
      >
        {{ i }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.point {
  position: absolute;
  font-size: 200%;
  color: white;
  border-radius: 1rem;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(5rem);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'

const increment = ref(0.2)
const radius = 10
const oddEvenZIndex = ref(false)
const points = computed(() => {
  const points: any[] = []
  for (let i = 0; i < 2 * Math.PI; i += increment.value) {
    const x = radius * Math.cos(i)
    const y = -radius * Math.sin(i)
    points.push({ x, y })
  }
  return points
})
</script>