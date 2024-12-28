<template>
    <div class="chart-container">
        <div class="game-history-chart">
            <canvas ref="chartRef"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, Ref, inject, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { ScoreHistory } from '../model'

const historyData = ref({
    levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
    wins: [0, 0, 0, 0],
    losses: [0, 0, 0, 0],
})
const user: Ref<any> = inject("user")!

console.log("Game History: ", user.value)

const chartRef = ref<HTMLCanvasElement | null>(null)

function updateChartData(history: ScoreHistory[]) {
    historyData.value.wins = history.map(h => h.win)
    historyData.value.losses = history.map(h => h.loss)
}

watch(user, async (newValue, oldValue) => {
    // console.log("User", user)
    console.log("new: ", newValue)
    console.log("old", oldValue)
    console.log("___________")
    if (oldValue === undefined) {
        return
    }
    if (user.value) {
        console.log("User: ", user.value)
        console.log("User", user.value.roles)
        const response = await fetch('/api/player-history')
        if (!response.ok) {
            if (response.status === 401) {
                alert('Please log in to view this data.')
                return
            }

            if (response.status === 403) {
                alert('You do not have permission to view this data.')
                historyData.value = {
                    levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
                    wins: [0, 0, 0, 0],
                    losses: [0, 0, 0, 0],
                } // Clear history data if not authorized
            } else {
                alert('No current player\'s history. Please try to update profile and create a record. Come back later!')
                historyData.value = {
                    levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
                    wins: [0, 0, 0, 0],
                    losses: [0, 0, 0, 0],
                }
            }
            return // Exit the function early
        }
        // historyData.value = {
        //     levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
        //     wins: [3, 3, 3, 3],
        //     losses: [2, 2, 2, 2],
        // }
        const data = await response.json()
        updateChartData(data.scoreHistory)

        await nextTick()
        if (chartRef.value) {
            const ctx = chartRef.value.getContext('2d')
            if (ctx) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: historyData.value.levels,
                        datasets: [{
                            label: 'Wins',
                            backgroundColor: '#42b983',
                            data: historyData.value.wins
                        }, {
                            label: 'Losses',
                            backgroundColor: '#e45050',
                            data: historyData.value.losses
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                })
            }
        } else {
            console.error('Canvas element is not available')
        }
    }
    else {
        alert('No user detected. Please log in.')
        return
    }
}, { immediate: true })
</script>

<style scoped>
.chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
}

.game-history-chart {
    width: 70vw;
    height: 70vh;
}

.game-history-chart canvas {
    width: 100%;
    height: 100%;
}
</style>