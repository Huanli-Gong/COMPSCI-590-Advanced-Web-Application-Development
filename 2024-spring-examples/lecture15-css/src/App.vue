<template>
  <div>
    <b-navbar toggleable="lg" type="dark" :variant="navBarVariant">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-navbar-brand v-b-modal.theme-modal href="#">
        CSS Demo
      </b-navbar-brand>
      
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/scrollable">Scrollable</b-nav-item>
          <b-nav-item href="/positioning">Positioning</b-nav-item>
          <b-nav-item href="/grid">Grid</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-modal id="theme-modal" @cancel="handleCancel" title="Theme">
      <b-form-radio-group
        v-model="navBarVariant"
        :options="[
          { text: 'Blue', value: 'primary' },
          { text: 'Red', value: 'danger' },
        ]"
      />
    </b-modal>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { BvModalEvent } from 'bootstrap-vue'
import { getCurrentInstance, ref } from 'vue'

const navBarVariant = ref("primary")

function handleCancel(bvModalEvent: BvModalEvent) {
  // an unfortunate but necessary hack to allow 
  // $-style BootstrapVue APIs to be called from Vue 3 and above
  const { $bvModal } = (getCurrentInstance()!.proxy) as any

  bvModalEvent.preventDefault()
  $bvModal.msgBoxOk("Sorry, we didn't implement cancel correctly!")
}
</script>