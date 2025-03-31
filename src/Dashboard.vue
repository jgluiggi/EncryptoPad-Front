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
          <button @click="open = true" class="button is-small">+</button>
          <div class="modal" :class="{'is-active': open, '': !open}">
            <div class="modal-background"></div>
            <div class="modal-content notification is-primary">
              <div class="field">
                <div class="control">
                  <input v-model="folderName" type="text" placeholder="Folder name" class="input"/>
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <button @click="createFolder()" class="button is-small">Create folder!</button>
                </div>
              </div>
            </div>
            <button @click="open = false" class="modal-close is-large" aria-label="close"></button>
          </div>
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
        <div class="column is-one-third">
          <div class="field">
            <div class="control">
              <input v-model="noteTitle" type="text" placeholder="Note title" class="input"/>
            </div>
          </div>
        </div>
        <textarea v-model="content" class="textarea" placeholder="Write here!" rows="20"></textarea>

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
import { getUserIdFromToken } from '@/utils/auth';

const folders = ref([]);
const notes = ref([]);
const content = ref('');
const folderName = ref('');
const noteTitle = ref('');
const user_id = ref(null);
const selectedFolder = ref(null);
const selectedNote = ref(null);
const token = localStorage.getItem('jwt');
const open = ref(false);

const fetchFolders = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch(`http://localhost:3000/folders/getByUserId/${user_id.value}`, {
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

const createNote = async () => {
  const response = await fetch('http://localhost:3000/notes/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: title.value, content: content.value, folder_id: folder_id.value })
  });
  notes.value = await response.json();
};

const createFolder = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch('http://localhost:3000/folders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: folderName.value, user_id: user_id.value })
  });
  notes.value = await response.json();
  fetchFolders();
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
