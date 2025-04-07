<template>
  <section class="section">
    <div class="columns">
      <div class="column is-one-fifth">
        <aside class="menu">
          <p class="menu-label has-text-weight-bold">Organizations</p>
          <ul class="menu-list">
            <li v-for="organization in organizations" :key="organization.id"><a>{{
              organization.id }} : {{ organization.name }}</a>
              <ul class="menu-list">
                <li v-for="folder in folders" :key="folder.id"><a>{{
                  folder.id }} : {{ folder.name }}</a>
                  <ul class="menu-list">
                      <li v-for="note in notes" @click="showNote(note)"><a v-if="note.folder_id == folder.id">
                        {{ note.title }}</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <div class="buttons">
            <button @click="open = true" class="button is-small is-success has-text-weight-bold">+</button>
            <button @click="openDelete = true" class="button is-small is-danger has-text-weight-bold">-</button>
          </div>
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
          <div class="modal" :class="{'is-active': openDelete, '': !openDelete}">
            <div class="modal-background"></div>
            <div class="modal-content notification ">
              <div class="field">
                <div class="control">
                  <input v-model="folderDeletionId" type="text" placeholder="Folder id to delete" class="input"/>
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <button @click="deleteFolder()" class="button is-small is-danger">Delete folder.</button>
                </div>
              </div>
            </div>
            <button @click="openDelete = false" class="modal-close is-large" aria-label="close"></button>
          </div>
        </aside>
      </div>

      <div class="column">
        <label class="label">Dashboard</label>
          <div class="field has-addons">
            <div class="control">
              <input v-model="organizationName" type="text" placeholder="Organization name" class="input"/>
            </div>
            <div class="control">
              <button @click="createOrganization()" class="button is-success">Create
            organization!</button>
            </div>
          </div>

          <div class="field has-addons">
            <div class="control">
              <input v-model="userAdd_id" type="text" placeholder="1, 2 or any number" class="input"/>
            </div>
            <div class="control">
              <button @click="addUser()" class="button is-warning">Add user to organization!</button>
            </div>
          </div>
          <div class="field has-addons">
            <div class="control">
              <input v-model="folder_id" type="text" placeholder="1, 2 or any number" class="input"/>
            </div>
            <div class="control">
              <button @click="addFolder()" class="button is-warning">Add folder to organization!</button>
            </div>
          </div>

          <div class="field has-addons">
            <div class="control">
              <input v-model="userAdd_id" type="text" placeholder="1, 2 or any number" class="input"/>
            </div>
            <div class="control">
              <button @click="deleteUser()" class="button is-danger">Remove user from organization.</button>
            </div>
          </div>
          <div class="field has-addons">
            <div class="control">
              <input v-model="folder_id" type="text" placeholder="1, 2 or any number" class="input"/>
            </div>
            <div class="control">
              <button @click="deleteFolder()" class="button is-danger">Remove folder from organization.</button>
            </div>
          </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserIdFromToken } from '@/utils/auth';

const organizations = ref([]);
const folders = ref([]);
const notes = ref([]);
const content = ref('');
const folderName = ref('');
const organizationName = ref('');
const noteContent = ref('');
const userAdd_id = ref(null);
const user_id = ref(null);
const note_id = ref(null);
const folder_id = ref(null);
const folderDeletionId = ref(null);
const selectedFolder = ref(null);
const selectedNote = ref(null);
const token = localStorage.getItem('jwt');
const open = ref(false);
const openDelete = ref(false);

const fetchOrganizations = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch('/api/organizations/getAll/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  organizations.value = await response.json();
};

const fetchFolders = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch(`/api/organizations/${user_id.value}/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  folders.value = await response.json();
};

const fetchNotes = async () => {
  const response = await fetch(`/api/organizations/${user_id.value}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  notes.value = await response.json();
};

const createOrganization = async () => {
  if (!organizationName.value) {
    console.error('Name your organization');
    return;
  }
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch('/api/organizations/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: organizationName.value })
  });
};

const createFolder = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch('/api/folders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: folderName.value, user_id: user_id.value })
  });
  fetchFolders();
};

const deleteFolder = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  if (!folderDeletionId.value) {
    console.error('Provide the folder id for deletion');
    return;
  }
  const response = await fetch(`/api/folders/delete/${folderDeletionId.value}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  fetchFolders();
};

const deleteOrganization = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  if (!note_id.value) {
    console.error('Provide the note id for deletion');
    return;
  }
  const response = await fetch(`/api/organizations/delete/${note_id.value}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  fetchNotes();
};

const showFolder = (folder) => {
  selectedFolder.value = folder;
};

const showNote = (note) => {
  selectedNote.value = note;
  noteTitle.value = note.title;
  noteContent.value = note.content;
  folder_id.value = note.folder_id;
  note_id.value = note.id;
};

onMounted(() => {
  fetchOrganizations();
  fetchFolders();
  fetchNotes();
});
</script>
