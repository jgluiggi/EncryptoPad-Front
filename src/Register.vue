<template>
  <div class="w-96 p-4 mx-auto mt-20 border rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Register</h2>
    <input v-model="username" type="text" placeholder="username" class="w-full p-2 mb-2 border rounded" />
    <input v-model="email" type="email" placeholder="Email" class="w-full p-2 mb-2 border rounded" />
    <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-2 border rounded" />
    <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="w-full p-2 mb-4 border rounded" />
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <button @click="register" class="w-full p-2 bg-green-500 text-white rounded">Register</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const router = useRouter();

const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const register = async () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = "All fields are required";
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }
  if (!passwordRegex.test(password.value)) {
    error.value = "Password must be at least 8 characters, include a number, a special character, and an uppercase letter";
    return;
  }
  if(!emailRegex.test(email.value)) {
    error.value = "Try a valid e-mail.";
    return;
  }
  error.value = '';
  const response = await fetch('http://localhost:3000/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
  });
  const data = await response.json();
  router.replace('/login');
};
</script>
