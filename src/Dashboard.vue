<template>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third">
        <aside class="menu">
          <p class="menu-label">Folders</p>
          <ul class="menu-list">
            <li v-for="folder in folders" :key="folder.id" @click="showFolder(folder)"><a>{{
              folder.name }}</a></li>
          </ul>
        <div class="mt-4">
          <p class="menu-label">Notes</p>
          <ul>
            <li v-for="note in notes" :key="note.id" @click="showNote(note)">
              {{ note.title }}
            </li>
          </ul>
        </div>
        </aside>
      </div>
      <div class="column">
          <label class="label">Dashboard</label>

          <!-- Note Content -->
          <div v-if="selectedNote" class="mt-4 p-4 border rounded">
            <h4 class="font-semibold">Note Content</h4>
            <p>{{ selectedNote.content }}</p>
          </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const folders = ref([]);
const notes = ref([]);
const selectedFolder = ref(null);
const selectedNote = ref(null);
const token = localStorage.getItem('jwt');

const fetchFolders = async () => {
  const response = await fetch('http://localhost:3000/folders/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });
  folders.value = await response.json();
};

const fetchNotes = async () => {
  const response = await fetch('http://localhost:3000/notes/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });
  notes.value = await response.json();
};

const showFolder = (folder) => {
  selectedFolder.value = folder;
};

const showNote = (note) => {
  selectedNote.value = note;
};

onMounted(() => {
  fetchFolders();
  fetchNotes();
});
</script>
