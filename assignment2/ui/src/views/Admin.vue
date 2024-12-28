<template>
  <b-overlay :show="loading">
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
                <div class="d-flex align-items-center">
                  <span class="mr-2">Reviewed:</span>
                  <b-form-checkbox
                    v-model="item.reviewed"
                    @change="updateReviewedStatus(item.id, item.reviewed)"
                  ></b-form-checkbox>
                  <b-button @click="handleClickDeleteListParticipant(item.id)" class="ml-2" size="sm"><b-icon-trash /></b-button>
                </div>
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
</b-overlay>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { SignupList, SignupListBasicInfo, Id, getLists, addList, getList, addParticipantToList, deleteList, deleteParticipantOnList,updateParticipantOnList} from '../data.ts'

const loading = ref(false)
const lists: Ref<SignupListBasicInfo[]> = ref([])
const nameOfListToCreate = ref("")

const selectedList: Ref<null | SignupList> = ref(null)
const nameOfParticipantToAdd = ref("")

async function refreshLists() {
    loading.value = true
    try {
        lists.value = await getLists()    
        if (selectedList.value && !lists.value.find(l => l.id === selectedList.value!.id)) {
            selectedList.value = null
        }
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}
onMounted(refreshLists)

async function selectList(listId: Id) {
    loading.value = true
    try {
        selectedList.value = await getList(listId)
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}

async function handleClickAddList() {
    loading.value = true
    try {
        const id = await addList(nameOfListToCreate.value)
        nameOfListToCreate.value = ""
        await refreshLists()
        await selectList(id)
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}

async function refreshSelectedList() {
    if (selectedList.value == null) {
        return
    }
    loading.value = true
    try {
        selectedList.value = await getList(selectedList.value.id)
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}

async function handleClickAddParticipant() {
    if (selectedList.value == null) {
        return
    }
    loading.value = true
    try {
        await addParticipantToList(
          selectedList.value?.id, 
          {
            name: nameOfParticipantToAdd.value,
            reviewed: false,
          }
        )
        nameOfParticipantToAdd.value = ""
        await refreshSelectedList()
        await refreshLists()
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}


async function handleClickDeleteList(listId: Id) {
    loading.value = true
    try {
        await deleteList(listId)
        if (listId === selectedList.value?.id) {
            selectedList.value = null
        }
        await refreshLists()
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}

async function handleClickDeleteListParticipant(participantId: Id) {
    if (!selectedList.value) {
        return
    }
    loading.value = true
    try {
        await deleteParticipantOnList(selectedList.value?.id, participantId)
        await refreshSelectedList()
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}

async function updateReviewedStatus(participantId:Id, reviewed:boolean) {
  if (!selectedList.value) {
    return
  }
  loading.value = true
  try {
        await updateParticipantOnList(selectedList.value.id, participantId, { reviewed })
        await refreshSelectedList()
    } catch (error) {
        console.error(error)
    }
    finally {
        loading.value = false
    }
}
</script>