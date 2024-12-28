<template>
  <div class="mx-3 my-3">
    <b-jumbotron header="Signup List" />

    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12" sm="6">
          <b-form>
            <b-form-group
              label="Name:"
              label-for="name-input"
            >
              <b-form-input id="name-input" v-model="name" placeholder="Jane" />
            </b-form-group>
            <b-button class="mr-2 mb-2" @click="submit">Submit</b-button>
          </b-form>
        </b-col>
        <b-col xs="12" sm="6">
          <b-button class="mr-2 mb-2" @click="refresh">Refresh</b-button>
          <div style="overflow-y: auto; max-height: 50vh">
            <b-list-group flush>
              <b-list-group-item
                v-for="x, i in participantList" 
                :key="i"
              >
                {{ x }}
              </b-list-group-item>
            </b-list-group>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const participantList = ref([] as string[])
const name = ref("")

async function refresh() {
  const response = await fetch("/api/list")
  participantList.value = await response.json()
}
onMounted(refresh)

async function submit() {
  if (participantList.value.includes(name.value)) {
    alert("This person is already on the list!")
    return
  }

  const response = await fetch(
    "/api/list/participant/" + name.value,
    { method: "PUT" }
  )
  alert("Successfully added " + name.value + " to the list.\n\n" + JSON.stringify(await response.json()))
  await refresh()
}
</script>