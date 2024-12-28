<template>
  <div>
    <b-button class="mx-2 my-2" size="sm" @click="socket.emit('new-game')">New Game</b-button>
    <b-badge class="mr-2 mb-2" :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex }}</b-badge>
    <b-badge class="mr-2 mb-2">{{ phase }}</b-badge>
    <div
      v-for="card in cards"
      :key="card.id"
    >
    <AnimatedCard :card="card" :lastPlayedCard="lastPlayedCard" @play-card="playCard"/>
    </div>
    <div v-if="phase=== 'play' && playersWithOneOrFewerCard.length > 0">
      <div style="color: red"> {{ playersWithOneOrFewerCard.join(", ") }} with one or fewer card! </div>
    </div>
    <b-button class="mx-2 my-2" size="sm" @click="drawCard" :disabled="!myTurn">Draw Card</b-button>
  </div>
  <div>
    <b-button @click="showConfigModal">Configure Game</b-button>
    <b-modal ref="modal" title="Game Configuration" @shown="getConfig" @ok.prevent="updateConfig">
      <b-overlay :show="loading">
        <b-form>
          <b-form-group label="Number of Decks:" label-for="decks-input">
            <b-form-input v-model.number="config.numberOfDecks" :number="true"></b-form-input>
          </b-form-group>
          <b-form-group label="Rank Limit:" label-for="rank-limit-input">
            <b-form-input v-model.number="config.rankLimit" :number="true"></b-form-input>
          </b-form-group>
        </b-form>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, GamePhase, Action, formatCard, CardId } from "../../../server/model"
import AnimatedCard from '../components/AnimatedCard.vue'

const loading = ref(false)
const config = ref({ numberOfDecks: 5, rankLimit: 13 })
const modal = ref(null as any)

function showConfigModal() {
  modal.value.show()
}

function getConfig(){
  loading.value = true
  socket.emit('get-config')
}

function updateConfig() {
  loading.value = true
  socket.emit('update-config', config.value)
}

// props
interface Props {
  playerIndex?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  playerIndex: "all",
})

const socket = io()
let x = props.playerIndex
let playerIndex: number | "all" = parseInt(x) >= 0 ? parseInt(x) : "all"
console.log("playerIndex", JSON.stringify(playerIndex))
socket.emit("player-index", playerIndex)

const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)

const myTurn = computed(() => currentTurnPlayerIndex.value === playerIndex && phase.value !== "game-over")
const lastPlayedCard = computed(() => cards.value.find(c => c.locationType === "last-card-played"))
const playersWithOneOrFewerCard: Ref<string[]> = ref([])

socket.on("all-cards", (allCards: Card[]) => {
  cards.value = allCards
})

socket.on("updated-cards", (updatedCards: Card[]) => {
  applyUpdatedCards(updatedCards)
})

socket.on("game-state", (newCurrentTurnPlayerIndex: number, newPhase: GamePhase, newPlayCount: number,newPlayersWithOneCard: string[]) => {
  currentTurnPlayerIndex.value = newCurrentTurnPlayerIndex
  phase.value = newPhase
  playCount.value = newPlayCount
  playersWithOneOrFewerCard.value = newPlayersWithOneCard
})

socket.on('get-config-reply', (newConfig) => {
  config.value = newConfig
  loading.value = false
})

socket.on('update-config-reply', (success) => {
  if (success) {
    modal.value.hide()
  } else {
    alert("invalid configuration")
  }
  loading.value = false
})

function doAction(action: Action) {
  return new Promise<Card[]>((resolve, reject) => {
    socket.emit("action", action)
    socket.once("updated-cards", (updatedCards: Card[]) => {
      resolve(updatedCards)
    })
  })
}

async function drawCard() {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "draw-card", playerIndex })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function playCard(cardId: CardId) {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "play-card", playerIndex, cardId })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function applyUpdatedCards(updatedCards: Card[]) {
  for (const x of updatedCards) {
    const existingCard = cards.value.find(y => x.id === y.id)
    if (existingCard) {
      Object.assign(existingCard, x)
    } else {
      cards.value.push(x)
    }
  }
}
</script>