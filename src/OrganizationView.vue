<template>
  <section class="section">
    <div class="columns">
      <div class="column is-one-fifth">
        <aside class="menu">
          <p class="menu-label has-text-weight-bold">{{ organization.name }}</p>
          <ul class="menu-list">
            <li v-for="folder in folders" :key="folder.id"><a @click="showFolder(folder)">{{ folder.id }}: {{ folder.name }}</a>
              <ul class="menu-list">
                <li v-for="note in notes" :key="note.id" @click="showNote(note)">
                  <a v-if="note.folder_id == folder.id">{{ note.title }}</a>
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
            <div class="modal-content notification">
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
        <h2 class="title is-4">{{ organization.name }} - Dashboard</h2>

        <!-- Note Management -->
        <div class="box">
          <h3 class="subtitle">Note Management</h3>
          <div class="field">
            <div class="control">
              <input v-model="noteTitle" type="text" placeholder="Note title" class="input"/>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <textarea v-model="noteContent" class="textarea" placeholder="Write here!" rows="10"></textarea>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <input v-model="folder_id" type="text" placeholder="Folder ID" class="input"/>
            </div>
          </div>
          <div class="buttons">
            <button @click="createNote()" class="button is-success">Create note!</button>
            <button @click="updateNote()" v-if="note_id" class="button is-info">Update note</button>
            <button @click="deleteNote()" v-if="note_id" class="button is-danger">Delete note</button>
          </div>
        </div>

        <!-- User Management -->
        <div class="box">
          <h3 class="subtitle">User Management</h3>
          <div class="field has-addons">
            <div class="control">
              <input v-model="userAdd_id" type="text" placeholder="User ID to add" class="input"/>
            </div>
            <div class="control">
              <button @click="addUser()" class="button is-warning">Add user to organization</button>
            </div>
          </div>

          <h4 class="subtitle is-6 mt-4">Organization Members</h4>
          <div class="table-container">
            <table class="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in organizationUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>
                    <button @click="deleteUser(user.id)" class="button is-small is-danger">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="box has-background-danger-light">
          <h3 class="subtitle">Danger Zone</h3>
          <button @click="confirmDelete = true" class="button is-danger">Delete Organization</button>

          <div class="modal" :class="{'is-active': confirmDelete, '': !confirmDelete}">
            <div class="modal-background"></div>
            <div class="modal-content notification is-danger">
              <h4 class="title is-5">Delete Organization</h4>
              <p>Are you sure you want to delete this organization? This action cannot be undone.</p>
              <div class="buttons mt-4">
                <button @click="deleteOrganization()" class="button is-danger">Yes, delete it</button>
                <button @click="confirmDelete = false" class="button">Cancel</button>
              </div>
            </div>
            <button @click="confirmDelete = false" class="modal-close is-large" aria-label="close"></button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserIdFromToken } from '@/utils/auth';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const organizationId = ref(null);
const organization = ref({});
const folders = ref([]);
const notes = ref([]);
const organizationUsers = ref([]);

const folderName = ref('');
const noteTitle = ref('');
const noteContent = ref('');
const userAdd_id = ref('');
const user_id = ref(null);
const note_id = ref(null);
const folder_id = ref(null);
const folderDeletionId = ref(null);
const selectedFolder = ref(null);
const selectedNote = ref(null);

const token = localStorage.getItem('jwt');
const open = ref(false);
const openDelete = ref(false);
const confirmDelete = ref(false);

// Fetch organization details
const fetchOrganization = async () => {
  try {
    const response = await fetch(`/api/organizations/getById/${organizationId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Failed to fetch organization');
      return;
    }

    organization.value = await response.json();
  } catch (error) {
    console.error('Error fetching organization:', error);
  }
};

// Fetch organization folders
const fetchFolders = async () => {
  try {
    const response = await fetch(`/api/organizations/${organizationId.value}/folders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Failed to fetch folders');
      return;
    }

    folders.value = await response.json();
  } catch (error) {
    console.error('Error fetching folders:', error);
  }
};

// Fetch organization notes
const fetchNotes = async () => {
  try {
    const response = await fetch(`/api/organizations/${organizationId.value}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Failed to fetch notes');
      return;
    }

    notes.value = await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

// Fetch organization users
const fetchOrganizationUsers = async () => {
  try {
    const response = await fetch(`/api/organizations/${organizationId.value}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Failed to fetch organization users');
      return;
    }

    organizationUsers.value = await response.json();
  } catch (error) {
    console.error('Error fetching organization users:', error);
  }
};

// Create a folder
const createFolder = async () => {
  if (!folderName.value) {
    console.error('Folder name is required');
    return;
  }

  user_id.value = getUserIdFromToken();

  try {
    const response = await fetch('/api/folders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: folderName.value,
        user_id: user_id.value
      })
    });

    await fetch(`/api/organizations/add-folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationId: organizationId.value,
        folderId: (await response.json()).id
      })
    });

    if (!response.ok) {
      console.error('Failed to create folder');
      return;
    }

    folderName.value = '';
    open.value = false;
    fetchFolders();
  } catch (error) {
    console.error('Error creating folder:', error);
  }
};

// Delete a folder
const deleteFolder = async () => {
  if (!folderDeletionId.value) {
    console.error('Provide the folder id for deletion');
    return;
  }

  try {
    const response = await fetch(`/api/folders/delete/${folderDeletionId.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to delete folder');
      return;
    }

    folderDeletionId.value = '';
    openDelete.value = false;
    fetchFolders();
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
};

// Create a note
const createNote = async () => {
  if (!noteTitle.value || !noteContent.value || !folder_id.value) {
    console.error('Fill everything before creating a note.');
    return;
  }

  try {
    const response = await fetch('/api/notes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: noteTitle.value,
        content: noteContent.value,
        folder_id: folder_id.value,
        organization_id: organizationId.value
      })
    });

    if (!response.ok) {
      console.error('Failed to create note');
      return;
    }

    noteTitle.value = '';
    noteContent.value = '';
    folder_id.value = '';
    fetchNotes();
  } catch (error) {
    console.error('Error creating note:', error);
  }
};

// Update a note
const updateNote = async () => {
  if (!noteTitle.value || !noteContent.value || !note_id.value) {
    console.error('Cannot update note without title, content, or ID');
    return;
  }

  try {
    const response = await fetch(`/api/notes/update/${note_id.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: noteTitle.value,
        content: noteContent.value,
        folder_id: folder_id.value
      })
    });

    if (!response.ok) {
      console.error('Failed to update note');
      return;
    }

    fetchNotes();
  } catch (error) {
    console.error('Error updating note:', error);
  }
};

// Delete a note
const deleteNote = async () => {
  if (!note_id.value) {
    console.error('Provide the note id for deletion');
    return;
  }

  try {
    const response = await fetch(`/api/notes/delete/${note_id.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to delete note');
      return;
    }

    noteTitle.value = '';
    noteContent.value = '';
    folder_id.value = '';
    note_id.value = null;
    fetchNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

// Add a user to the organization
const addUser = async () => {
  if (!userAdd_id.value) {
    console.error('Provide a user ID to add');
    return;
  }

  try {
    const response = await fetch('/api/organizations/add-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationId: organizationId.value,
        userId: userAdd_id.value
      })
    });

    if (!response.ok) {
      console.error('Failed to add user to organization');
      return;
    }

    userAdd_id.value = '';
    fetchOrganizationUsers();
  } catch (error) {
    console.error('Error adding user to organization:', error);
  }
};

// Remove a user from the organization
const deleteUser = async (userId) => {
  if (!userId) {
    console.error('Provide a user ID to remove');
    return;
  }

  try {
    const response = await fetch('/api/organizations/remove-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        organizationId: organizationId.value,
        userId: userId
      })
    });

    if (!response.ok) {
      console.error('Failed to remove user from organization');
      return;
    }

    fetchOrganizationUsers();
  } catch (error) {
    console.error('Error removing user from organization:', error);
  }
};

// Delete the organization
const deleteOrganization = async () => {
  try {
    const response = await fetch(`/api/organizations/delete/${organizationId.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to delete organization');
      return;
    }

    router.push('/dashboard');
  } catch (error) {
    console.error('Error deleting organization:', error);
  }
};

// Show folder details
const showFolder = (folder) => {
  selectedFolder.value = folder;
};

// Show note details
const showNote = (note) => {
  selectedNote.value = note;
  noteTitle.value = note.title;
  noteContent.value = note.content;
  folder_id.value = note.folder_id;
  note_id.value = note.id;
};

onMounted(() => {
  // Get organization ID from route params
  organizationId.value = route.params.id;
  if (!organizationId.value) {
    console.error('No organization ID provided');
    router.push('/organizations');
    return;
  }

  user_id.value = getUserIdFromToken();
  if (!user_id.value) {
    console.error('User not authenticated or token is invalid');
    router.push('/login');
    return;
  }

  fetchOrganization();
  fetchFolders();
  fetchNotes();
  fetchOrganizationUsers();
});
</script>
