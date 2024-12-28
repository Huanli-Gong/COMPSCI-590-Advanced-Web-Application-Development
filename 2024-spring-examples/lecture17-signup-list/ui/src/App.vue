<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Signup Lists</b-navbar-brand>      
    </b-navbar>
    
    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12" sm="4">
          <b-card no-body class="mb-3">
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                Lists
                <b-button class="ml-3" size="sm" @click="refreshLists"><b-icon-arrow-clockwise /></b-button>
              </div>
            </template>
            <b-list-group flush>
              <b-list-group-item
                v-for="list, i in lists"
                :key="i"
                class="d-flex justify-content-between align-items-center"
                :class="{ 'font-weight-bold': selectedList?.id === list.id }"
              >
                <span @click="selectList(list.id)" :title="list.id">{{ list.name }}</span>
                <span>
                  <b-badge variant="dark" pill>{{ list.count }}</b-badge>
                  <b-button @click="handleClickDeleteList(list.id)" class="ml-2" size="sm"><b-icon-trash /></b-button>
                </span>
              </b-list-group-item>
              <b-list-group-item>
                <b-input-group>
                  <b-form-input v-model="nameOfListToCreate" placeholder="List name" />
                  <b-input-group-append>
                    <b-button @click="handleClickAddList"><b-icon-plus-circle /></b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
        <b-col xs="12" sm="8">
          <b-card no-body>
            <template #header>
              <div v-if="selectedList != null" class="d-flex justify-content-between align-items-center">
                {{ selectedList.name }}
                <b-button class="ml-3" size="sm" @click="refreshSelectedList"><b-icon-arrow-clockwise /></b-button>
              </div>
              <div v-else>
                No List Selected
              </div>
            </template>
            <b-list-group flush>
              <b-list-group-item
                v-for="item, i in (selectedList == null ? [] : selectedList.participants)"
                :key="i"
                class="d-flex justify-content-between align-items-center"
              >
                <span :title="item.id">
                  {{ item.name }}
                </span>
                <span>
                  <b-button @click="handleClickDeleteListParticipant(item.id)" class="ml-2" size="sm"><b-icon-trash /></b-button>
                </span>
              </b-list-group-item>
              <b-list-group-item v-if="selectedList != null">
                <b-input-group>
                  <b-form-input v-model="nameOfParticipantToAdd" placeholder="Name" />
                  <b-input-group-append>
                    <b-button @click="handleClickAddParticipant"><b-icon-plus-circle /></b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { SignupList, SignupListBasicInfo, Id, getLists, addList, getList, addParticipantToList, deleteList, deleteParticipantOnList } from './data'

const lists: Ref<SignupListBasicInfo[]> = ref([])
const nameOfListToCreate = ref("")

const selectedList: Ref<null | SignupList> = ref(null)
const nameOfParticipantToAdd = ref("")

async function refreshLists() {
  lists.value = await getLists()
  if (selectedList.value && !lists.value.find(l => l.id === selectedList.value!.id)) {
    selectedList.value = null
  }
}
onMounted(refreshLists)

async function selectList(listId: Id) {
  selectedList.value = await getList(listId)
}

async function handleClickAddList() {
  const id = await addList(nameOfListToCreate.value)
  nameOfListToCreate.value = ""
  await refreshLists()
  await selectList(id)
}

async function refreshSelectedList() {
  if (selectedList.value == null) {
    return
  }
  selectedList.value = await getList(selectedList.value.id)
}

async function handleClickAddParticipant() {
  if (selectedList.value == null) {
    return
  }
  await addParticipantToList(
    selectedList.value?.id, 
    {
      name: nameOfParticipantToAdd.value,
    }
  )
  nameOfParticipantToAdd.value = ""
  await refreshSelectedList()
  await refreshLists()
}

async function handleClickDeleteList(listId: Id) {
  await deleteList(listId)
  if (listId === selectedList.value?.id) {
    selectedList.value = null    
  }
  await refreshLists()
}

async function handleClickDeleteListParticipant(participantId: Id) {
  if (!selectedList.value) {
    return
  }
  await deleteParticipantOnList(selectedList.value?.id, participantId)
  await refreshSelectedList()
}
</script>