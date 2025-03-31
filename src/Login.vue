<template>
  <div class="w-96 p-4 mx-auto mt-20 border rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Login</h2>
    <input v-model="email" type="email" placeholder="Email" class="w-full p-2 mb-2 border rounded" />
    <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 border rounded" />
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <button @click="login" class="w-full p-2 bg-blue-500 text-white rounded">Login</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) {
    error.value = "All fields are required";
    return;
  }
  error.value = '';
  const response = await fetch('http://localhost:3000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  const data = await response.json();
  localStorage.setItem('jwt', data);
  router.replace('/dashboard');
};
</script>
