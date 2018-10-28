<template>
  <div id="app">
    <v-app>
      <Voting msg="reckless ⚡️ voting" />
    </v-app>
  </div>
</template>

<script>
import Voting from "./components/Voting.vue";

export default {
  name: "app",
  components: {
    Voting
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
