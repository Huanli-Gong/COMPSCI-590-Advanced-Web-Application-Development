<template>
  <div>
    <b-navbar toggleable="lg" type="dark" :variant="'primary'">
      <b-navbar-brand href="/">
        <span v-if="user?.name">Welcome, {{ user.name }}</span>
        <span v-else>Game of Set</span>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item v-if="user?.preferred_username == null" href="/api/login">Login</b-nav-item>
          <b-nav-item v-if="user?.roles?.includes('regularPlayer') || user?.roles?.includes('advancedPlayer')"
            href="/player">Profile</b-nav-item>
          <b-nav-item v-if="user?.roles?.includes('advancedPlayer')" href="/player-history">History</b-nav-item>
          <b-nav-item v-if="user?.preferred_username" @click="logout">Logout</b-nav-item>
          <form method="POST" action="/api/logout" id="logoutForm" />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'

const user = ref({} as any)
provide("user", user)

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json()
})

function logout() {
  ; (window.document.getElementById('logoutForm') as HTMLFormElement).submit()
}
</script>

<style scoped>
body {
  background-color: #F1F8E9;
  font-family: 'Arial', sans-serif;
}
</style>