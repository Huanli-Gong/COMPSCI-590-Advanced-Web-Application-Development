<template>
  <div class="mx-3 my-3">

    <!-- TODO: insert code here! -->
    <div v-if="currentFlashcard">
      <b-jumbotron>
      <div>
        {{ currentFlashcard.problem }}
      </div>
      <ol class="flashcard-choices">
        <li v-for="(choice, index) in currentFlashcard.choices" :key="index">
          <button @click="checkAnswer(index)">{{ choice }}</button>
        </li>
      </ol>
      </b-jumbotron>
    </div>
    <div v-else>
      <p>No more flashcards!</p>
    </div>

  </div>
</template>

<script setup lang="ts">

// TODO: insert code here!

import { ref } from 'vue';
import flashcards from '../public/data.json';

let currentCardIndex = 0;
const currentFlashcard = ref(flashcards[currentCardIndex]);

function checkAnswer(index: number) {
  if (index === currentFlashcard.value.correctChoiceIndex) {
    alert('Correct!');
  } else {
    alert('Wrong!');
  }
  // Move to the next flashcard
  if (currentCardIndex < flashcards.length - 1) {
    currentCardIndex++;
    currentFlashcard.value = flashcards[currentCardIndex];
  } else {
    currentFlashcard.value = null;
  }
}
</script>
