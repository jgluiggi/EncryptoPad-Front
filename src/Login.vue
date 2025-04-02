<template>
  <section class="section">
    <div class="container is-max-tablet">
      <div class="field">
        <label class="label">E-mail</label>
        <div class="control">
          <input v-model="email" type="email" placeholder="Email" class="input"
            :class="{'is-danger': error != ''}" />
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input v-model="password" type="password" placeholder="Password" class="input"
            :class="{'is-danger': error != ''}" />
          <p v-if="error" class="text-red-500">{{ error }}</p>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button @click="login" class="button is-success">Login</button>
        </div>
      </div>
    </div>
  </section>
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
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    const data = await response.json();
    if (!response.ok) {
      error.value = data.message || date.error || 'Login failed';
      return;
    }

    if (!data.token) {
      error.value = 'No token received from server';
      return;
    }

    localStorage.setItem('jwt', data.token);
    router.replace('/dashboard');
  } catch (err) {
    error.value = 'An unexpected error ocurred';
    console.error('Fetch error: ', err);
  }
};
</script>
