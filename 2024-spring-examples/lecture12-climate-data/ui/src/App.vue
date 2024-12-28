<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Climate Data Example</b-navbar-brand>      
      <b-button @click="refresh">Refresh</b-button>
    </b-navbar>
    
    <b-table :items="data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'

const data: Ref<any[]> = ref([])

async function refresh() {
  const result = await fetch("/api/data")
  data.value = await result.json()
}
onMounted(refresh)
</script>