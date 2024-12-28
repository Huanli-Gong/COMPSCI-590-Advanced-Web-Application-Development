<template>
  <div>
    <h1>Controls</h1>
    <div>
      <button
        v-for="b, i in buttons" :key="i"
        @click="processOperand(calculator, b)"
      >
        {{ b }}
      </button>
      <button @click="processOperand(calculator, 'x')">x</button>
      <button @click="processOperand(calculator, 'y')">y</button>
      <button @click="processOperand(calculator, 'z')">z</button>
    </div>
    <div>
      <input v-model="other">
      <button @click="processOperand(calculator, other)">push</button>
    </div>
    <div>
      <h1>Stack</h1>
      <ol>
        <li 
          v-for="x, i in [...calculator.stack].reverse()" 
          :key="i"
          :style="{ fontWeight: i === 0 ? 'bold' : '' }"
        >
          {{ x }}
        </li>
      </ol>
    </div>
    <div>
      <h1>Variables</h1>
      <pre>{{ JSON.stringify(calculator.variables, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { makeCalculator, operators, processOperand } from "./calculator"

const calculator = ref(makeCalculator())
const other = ref("")

const buttons = [
  ...Object.keys(operators),
  ...Array.from({ length: 10 }).map((_, i) => i.toString()),
]
</script>
