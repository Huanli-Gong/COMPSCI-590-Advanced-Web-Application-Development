<template>
  <b-overlay :show="loading">
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Participant Signups</b-navbar-brand>
    </b-navbar>

    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12">
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
                  <b-badge :variant="item.reviewed ? 'success' : 'secondary'">{{ item.reviewed ? 'Approved' : 'Pending' }}</b-badge>
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
</b-overlay>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, ref,Ref } from 'vue';
import { SignupList, Id, getList, addParticipantToList,deleteParticipantOnList } from '../data.ts';

const loading = ref(false)
const nameOfParticipantToAdd = ref("")

const route = useRoute();
const selectedList: Ref<null | SignupList> = ref(null)
const listId: Id = route.params.listId as Id

async function refreshSelectedList() {
  if (!listId) {
    console.error('No listId provided in route.')
    return
  }
  loading.value = true
  try {
    selectedList.value = await getList(listId)
    if (listId !== selectedList.value?.id) {
        selectedList.value = null
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(refreshSelectedList)

async function handleClickAddParticipant() {
  if (selectedList.value == null) {
    return
  }
  loading.value = true
  try {
    await addParticipantToList(
      selectedList.value.id, 
      {
        name: nameOfParticipantToAdd.value,
        reviewed: false
      }
    )
    nameOfParticipantToAdd.value = ""
    await refreshSelectedList()
  } catch (error) {
    console.error(error)
  } finally {
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
</script>

