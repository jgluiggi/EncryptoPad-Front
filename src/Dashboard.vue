<template>
  <section class="section">
    <div class="columns">
      <div class="column is-one-fifth">
        <aside class="menu">
          <p class="menu-label has-text-weight-bold">Folders</p>
          <ul class="menu-list">
            <li v-for="folder in folders" :key="folder.id" @click="showFolder(folder)"><a>{{
              folder.id }} : {{ folder.name }}</a>
              <ul class="menu-list">
                  <li v-for="note in notes" @click="showNote(note)"><a v-if="note.folder_id == folder.id">
                    {{ note.title }}</a>
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
          <div class="field">
            <div class="control">
              <input v-model="noteTitle" type="text" placeholder="Note title" class="input"/>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <textarea v-model="noteContent" class="textarea" placeholder="Write here!" rows="20"></textarea>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <input v-model="folder_id" type="text" placeholder="1, 2 or any number" class="input"/>
            </div>
          </div>

          <div class="buttons">
              <button @click="createNote()" class="button is-small is-success">Create note!</button>
              <button @click="deleteNote()" class="button is-small is-danger">Delete note.</button>
          </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserIdFromToken } from '@/utils/auth';
import { encrypt, decrypt, getKeyFromPassword, getSalt, importKey, exportKey } from '@/utils/encryption';

const folders = ref([]);
const notes = ref([]);
const content = ref('');
const folderName = ref('');
const noteTitle = ref('');
const noteContent = ref('');
const user_id = ref(null);
const note_id = ref(null);
const folder_id = ref(null);
const folderDeletionId = ref(null);
const selectedFolder = ref(null);
const selectedNote = ref(null);
const token = localStorage.getItem('jwt');
const key = localStorage.getItem('key');
const open = ref(false);
const openDelete = ref(false);

const keyJwk = ref(null);

const loadKey = async () => {
  const stored = localStorage.getItem('keyStored');
  if (stored) {
    keyJwk.value = JSON.parse(stored);
  } else {
    await generateKey();
  }
};

const generateKey = async () => {
  const generatedKey = await getKeyFromPassword(key, getSalt());
  if (!localStorage.getItem('keyStored')) {
    keyJwk.value = await exportKey(generatedKey);
    localStorage.setItem('keyStored', JSON.stringify(keyJwk.value));
    console.log(JSON.stringify(keyJwk.value))
  }
}

const giveKeyToUser = async () => {
  if (keyJwk.value) {
    return JSON.stringify(keyJwk.value);
  }
}

const createNote = async () => {
  if (!noteTitle.value || !noteContent.value || !folder_id.value) {
    console.error('Fill everything before creating a note.');
    return;
  }
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }

  if (!keyJwk.value) {
    await generateKey();
  }
  var keyInUse = await importKey(keyJwk.value);
  const ciphertext = await encrypt(noteContent.value, keyInUse);
  noteContent.value = ciphertext;

  const response = await fetch('/api/notes/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: noteTitle.value, content: noteContent.value, folder_id: folder_id.value })
  });
  fetchNotes();
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

const deleteNote = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  if (!note_id.value) {
    console.error('Provide the note id for deletion');
    return;
  }
  const response = await fetch(`/api/notes/delete/${note_id.value}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  fetchNotes();
};

const showFolder = (folder) => {
  selectedFolder.value = folder;
};

const showNote = async (note) => {
  var text = note.content;
  var keyInUse = await importKey(JSON.parse(localStorage.getItem('keyStored')));
  try {
    text = await decrypt(note.content, keyInUse);
  } catch (err) {
    console.error('Your key is not the one used to encrypt, please try with the real one.');
  }
  keyInUse = null;
  selectedNote.value = note;
  noteTitle.value = note.title;
  noteContent.value = text;
  folder_id.value = note.folder_id;
  note_id.value = note.id;
};

const fetchFolders = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  const response = await fetch(`/api/folders/getByUserId/${user_id.value}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  folders.value = await response.json();
};

const fetchNotes = async () => {
  const response = await fetch('/api/notes/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });
  notes.value = await response.json();
};

onMounted(() => {
  fetchFolders();
  fetchNotes();
  loadKey();
});
</script>
