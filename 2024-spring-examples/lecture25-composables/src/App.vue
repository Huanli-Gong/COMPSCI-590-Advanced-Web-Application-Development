<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-navbar-brand href="#">
        Composables
      </b-navbar-brand>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/clipboard">Clipboard</b-nav-item>
          <b-nav-item href="/timer">Timer</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    
    <router-view />
  </div>
</template>
