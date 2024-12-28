<template>
  <div>
    <b-card-group>
      <b-card title="Counter">
        <div v-b-popover.hover.top="'If this number is moving, it means the browser isn\'t frozen'">{{
        counter.toFixed(1) }}</div>
      </b-card>
      <b-card title="Last Result">
        <b-button @click="clearLastResult">Clear</b-button>
        {{ lastResult }}
      </b-card>
      <b-card title="Normal">
        <div v-for="v, i in Object.keys(normalVariants)" :key="i">
          <b-button v-for="s in sizes" :key="s" class="mx-2 my-2" @click="runNormalVariant(v, s)">{{ v }} {{ s }}
          </b-button>
        </div>
      </b-card>
      <b-card title="Callback">
        <div v-for="v, i in Object.keys(callbackVariants)" :key="i">
          <b-button v-for="s in sizes" :key="s" class="mx-2 my-2" @click="runCallbackVariant(v, s)">{{ v }} {{ s }}
          </b-button>
        </div>
      </b-card>
      <b-card title="Promise">
        <div v-for="v, i in Object.keys(promiseVariants)" :key="i">
          <b-button v-for="s in sizes" :key="s" class="mx-2 my-2" @click="runPromiseVariant(v, s)">{{ v }} {{ s }}
          </b-button>
        </div>
      </b-card>
    </b-card-group>

    <b-card-group>
      <b-card title="Weather Forecast">
        <b-button @click="refreshWeatherForecast">Refresh</b-button>
        <div>{{ weatherForecast }}</div>
      </b-card>
    </b-card-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/////////////////////////////////////////////////////////////////////////////////
// counter that increments every tenth of a second using setInterval

const counter = ref(0)
setInterval(() => counter.value += 0.1, 100)

/////////////////////////////////////////////////////////////////////////////////
// sieve result rendering

const lastResult = ref("")

function showResult(a: number[]) {
  lastResult.value = `found ${a.length} primes: ${a.slice(0, 4)}...${a.slice(-1)}`
}

function clearLastResult() {
  lastResult.value = ""
}

/////////////////////////////////////////////////////////////////////////////////
// normal-style findPrimes implementations

const normalVariants: Record<string, (n: number) => number[]> = {
  findPrimes(n: number) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    for (let i = 2; i <= Math.sqrt(n); i++) {
      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    return a.flatMap((x, i) => x ? [i] : [])
  },
}

function runNormalVariant(v: string, n: number) {
  showResult(normalVariants[v](n))
}

/////////////////////////////////////////////////////////////////////////////////
// callback-style findPrimes implementations

const callbackVariants: Record<string, (n: number, callback: (primes: number[]) => void) => void> = {
  findPrimesWithCallback(n: number, callback: (primes: number[]) => void) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    for (let i = 2; i <= Math.sqrt(n); i++) {
      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    callback(a.flatMap((x, i) => x ? [i] : []))
  },
  brokenNonBlockingFindPrimesWithCallback(n: number, callback: (primes: number[]) => void) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    for (let i = 2; i <= Math.sqrt(n); i++) {
      // the following code is basically completely ineffective
      lastResult.value = `STILL WORKING! ${i}`
      setTimeout(() => {
      }, 0)

      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    callback(a.flatMap((x, i) => x ? [i] : []))
  },
  nonBlockingFindPrimesWithCallback(n: number, callback: (primes: number[]) => void) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    function outerLoop(i: number): void {
      if (i <= Math.sqrt(n)) {
        if (i % 100 === 0) {
          lastResult.value = `STILL WORKING! ${i}`
          setTimeout(() => {
            innerLoop(i)
            outerLoop(i + 1)
          }, 0)
        } else {
          innerLoop(i)
          return outerLoop(i + 1)
        }
      } else {
        return callback(a.flatMap((x, i) => x ? [i] : []))
      }
    }

    function innerLoop(i: number): void {
      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    outerLoop(2)
  },
}

function runCallbackVariant(v: string, n: number) {
  callbackVariants[v](n, showResult)
}

/////////////////////////////////////////////////////////////////////////////////
// Promise-style findPrimes implementations

const promiseVariants: Record<string, (n: number) => Promise<number[]>> = {
  findPrimesWithPromise(n: number) {
    return new Promise((resolve, reject) => {
      const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

      for (let i = 2; i <= Math.sqrt(n); i++) {
        for (let j = 2; i * j <= n; j++) {
          a[i * j] = false
        }
      }

      resolve(a.flatMap((x, i) => x ? [i] : []))
    })
  },
  async findPrimesWithPromiseAsync(n: number) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    for (let i = 2; i <= Math.sqrt(n); i++) {
      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    return a.flatMap((x, i) => x ? [i] : [])
  },
  async nonBlockingFindPrimesWithPromiseAsync(n: number) {
    const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (i % 100 === 0) {
        lastResult.value = `STILL WORKING! ${i}`
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 0)
        })
      }
      for (let j = 2; i * j <= n; j++) {
        a[i * j] = false
      }
    }

    return a.flatMap((x, i) => x ? [i] : [])
  },
}

function runPromiseVariant(v: string, n: number) {
  promiseVariants[v](n).then(showResult)
}

/////////////////////////////////////////////////////////////////////////////////
// sieve size options

const sizes = [100, 30000000]

/////////////////////////////////////////////////////////////////////////////////
// weather forecast (using dummy data in /public/)

const weatherForecast = ref("")

async function refreshWeatherForecast() {
  weatherForecast.value = ""
  const raleigh = await (await fetch("/raleigh.json")).json()
  const durham = await (await fetch("/durham.json")).json()
  const chapelHill = await (await fetch("/chapel-hill.json")).json()
  weatherForecast.value += "raleigh: " + JSON.stringify(raleigh) + "; "
  weatherForecast.value += "durham: " + JSON.stringify(durham) + "; "
  weatherForecast.value += "chapel hill: " + JSON.stringify(chapelHill)
}

// callback hell/pyramid of doom version

// function refreshWeatherForecast() {
//   weatherForecast.value = ""
//   fetch("/raleigh.json").then(raleighResult => {
//     raleighResult.json().then(raleigh => {
//       fetch("/durham.json").then(durhamResult => {
//         durhamResult.json().then(durham => {
//           fetch("/chapel-hill.json").then(chapelHillResult => {
//             chapelHillResult.json().then(chapelHill => {
//               weatherForecast.value += "raleigh: " + JSON.stringify(raleigh) + "; "
//               weatherForecast.value += "durham: " + JSON.stringify(durham) + "; "
//               weatherForecast.value += "chapel hill: " + JSON.stringify(chapelHill)
//             })
//           })
//         })
//       })
//     })
//   })
// }

</script>