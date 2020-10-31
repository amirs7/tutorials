<template>
  <div class="hello">
    <div>
      <ul>
        <li v-for="(note, index) in notes" :key="index">
          {{ note.text }}
          <button @click="deleteNote(note)">Delete</button>
        </li>
      </ul>
    </div>
    <div>
      <input v-model="text" />
      <button @click="addNote">Add</button>
    </div>
    <button @click="listNotes">Reload</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Note, NotesApiClient } from "../api/NotesApiClient";

const apiClient = new NotesApiClient();

@Component
export default class Notes extends Vue {
  notes = [] as any[];
  text = "" as string;

  async mounted(){
    await this.listNotes();
  }

  async listNotes() {
    this.notes = await apiClient.listNotes();
  }
  async addNote(){
    await apiClient.createNote(this.text);
    await this.listNotes();
    this.text = "";
  }
  async deleteNote(note: Note) {
    await apiClient.deleteNote(note);
    await this.listNotes();
  }
}
</script>
<style scoped>
</style>
