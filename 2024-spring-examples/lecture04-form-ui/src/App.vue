<template>
  <div class="mx-3 my-3">
    <b-jumbotron header="Contact Card Editor" :lead="dirty ? 'You have unsaved changes.' : 'All changes saved.'" />

    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12" sm="9">
          <b-form>
            <b-form-group
              label="First name:"
              label-for="first-name-input"
            >
              <b-form-input id="first-name-input" v-model="currentCard.firstName" placeholder="Jane" />
            </b-form-group>
            <b-form-group
              label="Last name:"
              label-for="last-name-input"
            >
              <b-form-input id="last-name-input" v-model="currentCard.lastName" placeholder="Doe" />
            </b-form-group>
            <b-form-group
              label="E-mail address:"
              label-for="email-input"
            >
              <b-form-input id="email-input" v-model="currentCard.email" :state="!emailValidation" type="email" placeholder="jane.doe@notreal.cs.duke.edu" required />
              <b-form-invalid-feedback :state="!emailValidation">{{ emailValidation }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group
              label="Birthday:"
              label-for="birthday-input"
            >
              <b-form-datepicker id="birthday-input" v-model="currentCard.birthday" />
            </b-form-group>
          </b-form>

          <b-button 
            v-for="c, i in sampleCards"
            :key="i"
            class="mr-2 mb-2" 
            @click="loadCard(sampleCards[i])"
          >
            Sample Card {{ i + 1 }}
          </b-button>
        </b-col>
        <b-col xs="12" sm="3">
          <b-button class="mr-2 mb-2" :disabled="!canUndo" @click="undo">Undo</b-button>
          <b-button class="mr-2 mb-2" :disabled="!canRedo" @click="redo">Redo</b-button>
          <div style="overflow-y: scroll; max-height: 50vh">
            <b-list-group flush>
              <b-list-group-item
                v-for="x, i in undoRedoBuffer" 
                :key="i"
                :active="i === undoRedoIndex"
                href="#"
                @click="undoRedo(i)"
              >
                <pre :style="{ color: i === undoRedoIndex ? 'white' : '' }">{{ JSON.stringify(x, null, 2) }}</pre>
              </b-list-group-item>
            </b-list-group>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { blankCard, cloneCard, sampleCards, areCardsEquivalent, ContactCard } from './data'

// start off with a blank card
const currentCard = ref(cloneCard(blankCard))

function loadCard(card: ContactCard) {
  currentCard.value = cloneCard(card)
}

///////////////////////////////////////////////////////////////////////////////////////
// form validation

const emailValidation = computed(() => {
  // these are very simplistic rules, just for demonstration purposes
  if (currentCard.value.email.length === 0) {
    return "An e-mail address is required."
  } else if (currentCard.value.email.indexOf("@") <= 0) {
    return "This is not a valid e-mail address."
  } else {
    return ""
  }
})

///////////////////////////////////////////////////////////////////////////////////////
// undo/redo buffer

const undoRedoBuffer = ref([cloneCard(currentCard.value)])
let undoRedoIndex = ref(0)

watch(
  currentCard, 
  () => {
    if (areCardsEquivalent(undoRedoBuffer.value[undoRedoIndex.value], currentCard.value)) {
      // effectively no change relative to what is in the undo/redo buffer
      return
    }

    // add new undo entry and delete everything ahead of this point
    undoRedoBuffer.value.splice(++undoRedoIndex.value, undoRedoBuffer.value.length, cloneCard(currentCard.value))
  }, 
  // necessary because need to pick up on changes to fields inside currentCard
  { deep: true }
)

function undo() {
  loadCard(undoRedoBuffer.value[--undoRedoIndex.value])
}

const canUndo = computed(() => undoRedoIndex.value > 0)

function redo() {
  loadCard(undoRedoBuffer.value[++undoRedoIndex.value])
}

const canRedo = computed(() => undoRedoIndex.value + 1 !== undoRedoBuffer.value.length)

function undoRedo(i: number) {
  loadCard(undoRedoBuffer.value[undoRedoIndex.value = i])
}

///////////////////////////////////////////////////////////////////////////////////////
// dirty flag

let lastSavedUndoRedoIndex = 0
const dirty = computed(() => undoRedoIndex.value !== lastSavedUndoRedoIndex)
</script>