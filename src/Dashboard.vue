<template>
  <div class="w-96 p-4 mx-auto mt-20 border rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Dashboard</h2>
    <div>
      <h3 class="text-lg font-semibold">Folders</h3>
      <ul>
        <li v-for="folder in folders" :key="folder.id" @click="showFolder(folder)">{{ folder.name }}</li>
      </ul>
    </div>
    <div class="mt-4">
      <h3 class="text-lg font-semibold">Notes</h3>
      <ul>
        <li v-for="note in notes" :key="note.id" @click="showNote(note)">
          {{ note.title }}
        </li>
      </ul>
    </div>

    <!-- Note Content -->
    <div v-if="selectedNote" class="mt-4 p-4 border rounded">
      <h4 class="font-semibold">Note Content</h4>
      <p>{{ selectedNote.content }}</p>
    </div>
  </div>
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
