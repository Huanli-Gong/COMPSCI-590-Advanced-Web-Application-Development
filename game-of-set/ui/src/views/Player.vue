<template>
    <div class="player-info-container">
        <b-card title="Edit Your Player Profile">
            <b-form @submit.prevent="submitForm">
                <b-form-group label="Preferred Username:" label-for="preferred-username-input">
                    <b-form-input id="preferred-username-input" v-model="playerData.preferred_username"
                        disabled></b-form-input>
                </b-form-group>

                <b-form-group label="Name:" label-for="name-input">
                    <b-form-input id="name-input" v-model="playerData.name" required></b-form-input>
                </b-form-group>

                <b-form-group label="Nickname:" label-for="nickname-input">
                    <b-form-input id="nickname-input" v-model="playerData.nickname" required></b-form-input>
                </b-form-group>

                <b-form-group label="Email Address:" label-for="email-input">
                    <b-form-input type="email" id="email-input" v-model="playerData.email" required></b-form-input>
                </b-form-group>

                <b-form-group label="Preferred Level:" label-for="level-select">
                    <b-form-select id="level-select" v-model="playerData.preferredLevel"
                        :options="levelOptions"></b-form-select>
                </b-form-group>

                <b-button type="submit" variant="primary" v-if="isAuthorized">Update Profile</b-button>
            </b-form>
        </b-card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, Ref, inject } from 'vue'

const playerData = ref({
    name: '',
    preferred_username: '',
    nickname: '',
    email: '',
    preferredLevel: 1,
})
const user: Ref<any> = inject("user")!
const isAuthorized = ref(true)

console.log("Player Profile: ", user.value)

const levelOptions = [
    { value: 1, text: 'Level 1' },
    { value: 2, text: 'Level 2' },
    { value: 3, text: 'Level 3' },
    { value: 4, text: 'Level 4' }
]

async function submitForm() {
    try {
        const response = await fetch('/api/update-player-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerData.value),
            credentials: 'include'
        })
        if (response.ok) {
            const result = await response.json()
            alert('Profile updated successfully!')
            console.log(result)
        } else {
            throw new Error('Failed to update')
        }
    } catch (error) {
        console.error('Failed to update player information:', error)
        alert('Failed to update profile.')
    }
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
        try {
            let response_mongo = await fetch('/api/player-info')
            if (!response_mongo.ok) {
                console.log('Fetching general user info due to:', response_mongo.status)
                if (response_mongo.status === 401) {
                    isAuthorized.value = false
                    alert('Please log in to view this data.')
                    return
                }

                if (response_mongo.status === 403) {
                    alert('You do not have permission to view this data.')
                    isAuthorized.value = false
                    playerData.value = {
                        name: '',
                        preferred_username: '',
                        nickname: '',
                        email: '',
                        preferredLevel: 0,
                    } // Clear player data if not authorized
                } else {
                    playerData.value = { ...playerData.value, ...user.value }
                }
                return
            }
            const data = await response_mongo.json()
            playerData.value = { ...playerData.value, ...data }
        } catch (error) {
            console.error('Failed to fetch player information:', error)
            alert('An error occurred while fetching the data.')
        }
    }
    else {
        alert('No user detected. Please log in.')
        return
    }}, { immediate: true })
</script>

<style scoped>
.player-info-container {
    max-width: 500px;
    margin: auto;
    padding-top: 20px;
}

.cards-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    justify-content: center;
    padding: 20px;
}

.cards-container img {
    width: auto;
    height: 140px;
    cursor: pointer;
    transition: transform 0.3s;
}

.cards-container img:hover {
    transform: scale(1.1);
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