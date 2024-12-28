<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-navbar-brand href="#">
        Composables
      </b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/spaceships">Spaceships</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

const httpLink = createHttpLink({
  // see https://studio.apollographql.com/public/SpaceX-pxxbxen/variant/current/home
  uri: 'https://spacex-production.up.railway.app/',
})
const cache = new InMemoryCache()
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

provide(DefaultApolloClient, apolloClient)
</script>