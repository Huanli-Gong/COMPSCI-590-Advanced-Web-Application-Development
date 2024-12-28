<template>
  <pre>{{ JSON.stringify(card, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { ContactCard } from '../data'

// props
interface Props {
  card?: ContactCard
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  card: undefined,
})
</script>