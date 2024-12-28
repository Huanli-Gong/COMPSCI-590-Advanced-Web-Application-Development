<template>
  <div class="mx-3 my-3">
    <b-jumbotron bg-variant="primary" text-variant="white" :header="`Welcome, ${name}`" />

    <h2>Orders</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table v-if="customer" :items="customer.orders" :fields="fields"  />
    
    <h2>Draft Order</h2>
    Check the ingredients you want:
    <ul>
      <li v-for="ingredient in possibleIngredients">
        <b-button @click="AddIngredient(ingredient)">Add {{ingredient.name}}</b-button> ${{ingredient.price}} 
      </li>
    </ul>

    <h3>Selected Ingredients:</h3>
    <ul>
      <li v-for="(ingredient, index) in draftOrderIngredients">
        {{ ingredient.name }} - ${{ingredient.price}} <b-button @click="draftOrderIngredients.splice(index, 1)">Delete</b-button>
      </li>
    </ul>

    <h3>Total Cost: ${{draftOrderIngredients.reduce((total, ingredient) => total + ingredient.price, 0)}}</h3>

    <div class="mt-2">
      <b-button @click="save">Save</b-button>
    </div>
    <div class="mt-2">
      <b-button @click="submit">Submit</b-button>
      Note: must save before submitting
    </div>
    <ChatbotView @addIngredient="AddIngredient" :possibleIngredients="possibleIngredients"/>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, Ref } from 'vue'
import { CustomerWithOrders, Ingredient } from "../../../server/data"
import ChatbotView from './Chatbot.vue'

// props
interface Props {
  customerId: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  customerId: "",
})

const customer: Ref<CustomerWithOrders | null> = ref(null)

const name = computed(() => customer.value?.name || props.customerId)
const draftOrderIngredients: Ref<Ingredient[]> = ref([])
const possibleIngredients: Ref<Ingredient[]> = ref([])

function AddIngredient(ingredient: Ingredient) {
  draftOrderIngredients.value.push(ingredient)
}

async function refresh() {
  possibleIngredients.value = await (await fetch("/api/possible-ingredients")).json()
  if (props.customerId) {
    customer.value = await (await fetch("/api/customer/" + encodeURIComponent(props.customerId))).json()
    const draftOrderIngredientIds = (await (await fetch("/api/customer/" + encodeURIComponent(props.customerId) + "/draft-order")).json())?.ingredientIds || []
    draftOrderIngredients.value = draftOrderIngredientIds.map((id: string) => possibleIngredients.value.find(ingredient => ingredient._id === id))
  }
}
onMounted(refresh)

const fields = [
  { key: '_id'},
  { key: 'customerId'},
  { key: 'state' },
  {
    key: 'ingredientIds',
    label: 'Ingredients',
    formatter: (value, key, item) => {
      return value.map((id: string) => possibleIngredients.value.find(ingredient => ingredient._id === id)?.name)
    }
  }
]

async function save() {
  await fetch(
    "/api/customer/" + encodeURIComponent(props.customerId) + "/draft-order",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ ingredientIds: draftOrderIngredients.value.map(ingredient => ingredient._id) })
    }
  )
}

async function submit() {
  await fetch(
    "/api/customer/" + encodeURIComponent(props.customerId) + "/submit-draft-order",
    { method: "POST" }
  )
  await refresh()
}
</script>