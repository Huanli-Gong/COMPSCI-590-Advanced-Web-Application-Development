<template>
  <div v-if="isValidPlayer" class="game-container">
    <div>
      <b-button class="mx-2 my-2" size="sm" @click="socket.emit('new-game')">New Game</b-button>
      <b-badge class="mr-2 mb-2" :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex
        }}</b-badge>
      <b-badge class="mr-2 mb-2">My playerIndex: {{ playerIndex }}</b-badge>
      <b-badge class="mr-2 mb-2">My score: {{ score }}</b-badge>
      <b-badge class="mr-2 mb-2">{{ phase }}</b-badge>
      <b-button class="mr-2 mb-2" @click="drawCards()">Draw Card</b-button>
      <b-button class="mr-2 mb-2" @click="getHint()">Hint</b-button>
      <b-button class="mr-2 mb-2" @click="pass()">Pass</b-button>
      <div>
        <b-button @click="showConfigModal">Configure Game</b-button>
        <b-modal ref="modal" title="Game Configuration" @shown="getConfig" @ok.prevent="updateConfig">
          <b-overlay :show="loading">
            <b-form>
              <b-form-group label="Number of Decks:">
                <b-form-input v-model.number="config.numberOfDecks" :number="true"></b-form-input>
              </b-form-group>
              <b-form-group label="Level:">
                <b-form-input v-model.number="config.level" :number="true"></b-form-input>
              </b-form-group>
              <b-form-group label="Target Score:">
                <b-form-input v-model.number="config.targetScore" :number="true"></b-form-input>
              </b-form-group>
              <b-form-group label="Min Cards on the Table:">
                <b-form-input v-model.number="config.tableSize" :number="true"></b-form-input>
              </b-form-group>
            </b-form>
          </b-overlay>
        </b-modal>
      </div>
      <div class="game-container">
        <h1>Game of Set</h1>
        <p v-if="message" class="result-message">
          {{ message }}
        </p>
        <div v-if="selectedCards.length === 3" @click="submitSet()" class="submit-button">
          Submit Set
        </div>
      </div>
      <b-container fluid>
        <b-row v-if="tableCards.length > 0" class="cards-container">
          <b-col cols="12" sm="6" md="4" lg="3" v-for="(card, index) in tableCards" :key="card.id"
            @click="selectCard(card)" :class="{ 'selected': selectedCards.includes(card) }">
            <img :data-key="`card-${index + 1}`" :src="card.imgSrc"
              :alt="`Card ${card.number}${card.color}${card.shading}${card.shape}`" class="img-fluid card-image">
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
  <div v-else>
    <b-alert show variant="warning">
      Please log in using a registered gitlab account to play the game.
    </b-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from 'vue'
import { io } from "socket.io-client"
import { Card, GameState, GamePhase } from "../model"

const socket = io({ transports: ["websocket"] })
const playerIndex: Ref<number> = ref(-1)
const isValidPlayer = computed(() => playerIndex.value !== -1)

onMounted(() => {
  socket.emit("gamestate")
})

const gameState = ref<GameState | null>(null)
const selectedCards = ref<Card[]>([])
const message = ref('')

const tableCards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)

const myTurn = computed(() => currentTurnPlayerIndex.value === playerIndex.value && phase.value !== "game-over")
// const score = computed(() => gameState.value?.players[playerIndex.value].score)
const score = ref(0)
const gameHistoryChange = ref(0)

const loading = ref(false)
const config = ref({ level: 1, numberOfDecks: 1, targetScore: 5, tableSize: 12 })
const modal = ref(null as any)

watch(phase, (newPhase) => {
  if (newPhase === 'game-over') {
    handleGameOver()
    score.value = 0
  }
})

async function handleGameOver() {
  try {
    if (score.value) {
      console.log("Game State: ", gameState.value)
      const didWin = score.value >= config.value.targetScore
      const updatePayload = {
        playerId: gameState.value?.players[playerIndex.value].name,
        didWin: didWin,
        level: gameHistoryChange.value
      }
      const response = await fetch('/api/update-player-history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })
      if (response.ok) {
        alert('Player score history updated successfully!')
      } else {
        throw new Error('Failed to update player history')
      }
    }
  } catch (error) {
    console.error('Failed to update player history:', error)
  }
}


// Configuration Modal
function showConfigModal() {
  modal.value.show()
}

function getConfig() {
  loading.value = true
  socket.emit('get-config')
}

function updateConfig() {
  loading.value = true
  socket.emit('update-config', config.value)
}

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
// Game State & Action update
socket.on("game-state", (newPlayerIndex: number, newCurrentTurnPlayerIndex: number, newLevel: number, newPhase: GamePhase, newPlayCount: number, newTableCards: Card[]) => {
  if (newPlayerIndex != null) {
    playerIndex.value = newPlayerIndex
  }
  currentTurnPlayerIndex.value = newCurrentTurnPlayerIndex
  gameHistoryChange.value = newLevel
  phase.value = newPhase
  playCount.value = newPlayCount
  tableCards.value = newTableCards
  console.log(`${playerIndex.value}: ${tableCards.value}`)
})

socket.on('game-update', data => {
  gameState.value = data
  tableCards.value = data.table.cards
  currentTurnPlayerIndex.value = data.currentTurnPlayerIndex
  phase.value = data.phase
  playCount.value = data.playCount
  score.value = data.players[playerIndex.value].score
  message.value = ''
})

socket.on('player-update', result => {
  message.value = result.message
})

// Functions for features
function drawCards() {
  const action = {
    action: "draw-card",
    playerIndex: playerIndex.value,
  }
  socket.emit('action', action)
}

function selectCard(card: Card) {
  const index = selectedCards.value.findIndex(c => c.id === card.id)
  if (index >= 0) {
    selectedCards.value.splice(index, 1)
  } else if (selectedCards.value.length < 3) {
    selectedCards.value.push(card)
  }
}

function pass() {
  const action = {
    action: "pass",
    playerIndex: playerIndex.value,
  }
  socket.emit('action', action)
}

function getHint() {
  const action = {
    action: "get-hint",
    playerIndex: playerIndex.value,
  }
  socket.emit('action', action)
  // alert(hint(tableCards.value))
}

function submitSet() {
  if (selectedCards.value.length === 3) {
    const action = {
      action: "select-cards",
      inputCards: selectedCards.value,
      playerIndex: playerIndex.value,
    }
    socket.emit('action', action)
    selectedCards.value = []
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cards-container div.selected img {
  border: 3px solid #FFD700;
  transform: scale(1.1);
}

.cards-container {
  margin-top: 20px;
  padding: 0 15px;
}

.card-image {
  width: 100%;
  transition: transform 0.3s;
  cursor: pointer;
  padding: 5px;
}

.card-image:hover {
  transform: scale(1.1);
}

.card-column {
  margin-bottom: 20px;
}

.submit-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: blue;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.result-message {
  margin-top: 20px;
  color: red;
}
</style>
