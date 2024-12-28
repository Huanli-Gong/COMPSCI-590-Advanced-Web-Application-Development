<template>
  <div @click="handleClick">
    <div :style="{ position: 'relative', fontWeight: card === lastPlayedCard ? 'bold' : 'normal' }">
      <pre>{{ formatCard(card, true) }} <span v-if="card.locationType !== 'player-hand' || lastPlayedCard && !areCompatible(card, lastPlayedCard)" style="color: red">X</span></pre>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Card, formatCard, areCompatible } from "../../../server/model"

interface Props {
  card: Card,
  lastPlayedCard: Card | undefined
}

const props = defineProps<Props>()

const emit = defineEmits(['play-card'])

function handleClick() {
  emit('play-card', props.card.id)
}
</script>
