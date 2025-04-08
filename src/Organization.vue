<template>
  <section class="section">
    <div class="columns">
      <div class="column is-one-fifth">
        <aside class="menu">
          <p class="menu-label has-text-weight-bold">Organizations</p>
          <ul class="menu-list">
            <li v-for="organization in organizations" :key="organization.id"><a @click="onOrganizationClick(organization)">{{
              organization.id }} : {{ organization.name }}</a>
            </li>
          </ul>
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
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserIdFromToken } from '@/utils/auth';
import { useRouter } from 'vue-router';

const organizations = ref([]);
const organizationsTemp = ref([]);
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
const router = useRouter();

const fetchOrganizations = async () => {
  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
  }
  // Resgata todas as orgs
  const response = await fetch('/api/organizations/getAll', {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Obtem o json de todas as orgs
  organizationsTemp.value = await response.json();

  // Verifica se o usuário atual pertence a alguma organização
  for (const organization of organizationsTemp.value) {
    const res = await fetch(`/api/organizations/${organization.id}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();
    for (const user of users) {
      if (user.id === user_id.value) {
        organizations.value.push(organization);
        break;
      }
    }
  }
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

  if (!response.ok) {
    const error = await response.json();
    console.error('Erro ao criar organização:', error);
  }

  const data = await response.json();
  console.log('Organização criada com sucesso');
  const organizationId = data.id;

  const res2 = await fetch('/api/organizations/add-user/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ organizationId: organizationId, userId: user_id.value })
  });
  if (!res2.ok) {
    const error = await res2.json();
    console.error('Error adding user to organization:', error);
  }
  console.log('User added to organization successfully');
  organizations.value.push({ id: organizationId, name: organizationName.value });
};

const onOrganizationClick = (organization) => {
  console.log('Organização clicada:', organization);
  router.push(`/organizations/${organization.id}`);
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
