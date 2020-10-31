<template>
  <div id="app">
    <Notes/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Notes from "./components/Notes.vue";

@Component({
  components: {
    Notes,
  },
})
export default class App extends Vue {}
</script>

<style>
</style>
