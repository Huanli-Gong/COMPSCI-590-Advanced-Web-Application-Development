<template>
  <b-list-group flush>
    <b-list-group-item
      v-for="x, i in undoRedoBuffer" 
      :key="i"
      :active="i === undoRedoIndex"
      href="#"
      @click="undoRedo(i)"
    >
      <CardSummary :card="x" :style="{ color: i === undoRedoIndex ? 'white' : '' }" />
    </b-list-group-item>
  </b-list-group>
</template>

<script setup lang="ts">
import { ContactCard } from '../data'
import CardSummary from './CardSummary.vue'

// props
interface Props {
  undoRedoBuffer?: ContactCard[]
  undoRedoIndex?: number
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  // NOTE: must use a "factory function" for all Object/Array prop default values
  // the factory function's job is basically to create a clone each time, 
  // so as to prevent unexpected mutations of the default value 
  undoRedoBuffer: () => [],

  // no factory function needed for primitive types
  undoRedoIndex: 0,
})

// events
const emit = defineEmits<{
  (e: 'change', undoRedoIndex: number): void
}>()

function undoRedo(undoRedoIndex: number) {
  emit("change", undoRedoIndex)
}
</script>