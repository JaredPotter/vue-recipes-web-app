<template>
  <div id="app">
    <h1>Jared's Laravel Recipes</h1>
    <h3>Build using Laravel, mysql, and Vue.</h3>
    <div id="nav">
      <router-link class="nav-link" to="/recipes">Recipes</router-link>
      <!-- | -->
      <!-- <router-link class="nav-link" to="/equipment"
        >Equipment (coming soon)</router-link
      >
      |
      <router-link class="nav-link" to="/taste-tests"
        >Taste Tests (coming soon)</router-link
      > -->
    </div>

    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #2c3e50;
  margin-top: 60px;

  #nav .nav-link {
    font-size: 1.4rem;
  }

  #nav {
    margin-bottom: 1rem;
  }
}
</style>
