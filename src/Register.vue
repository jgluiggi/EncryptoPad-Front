<template>
  <section class="section">
    <div class="container is-max-tablet">

      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input v-model="username" type="text" placeholder="xX_user_Xx" class="input"
            :class="{'is-success': valid}" />
        </div>
      </div>

      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input v-model="email" type="email" placeholder="secrets@email.xyz" class="input"
            :class="{'is-success': valid, 'is-danger': errorEmail != ''}" />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <p v-if="errorEmail" class="help is-danger">{{ errorEmail }}</p>
        </div>
      </div>

      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input v-model="password" type="password" placeholder="Password!23" class="input"
            :class="{'is-success': valid, 'is-danger': errorPassword != ''}" />
        </div>
      </div>

      <div class="field">
        <label class="label">Confirm Password</label>
        <div class="control">
          <input v-model="confirmPassword" type="password" placeholder="Same as above" class="input"
            :class="{'is-success': valid, 'is-danger': errorPassword != ''}" />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <p v-if="errorPassword" class="help is-danger">{{ errorPassword }}</p>
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button @click="register" class="button is-success">Register</button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorPassword = ref('');
const errorEmail = ref('');
const valid = ref(false);
const router = useRouter();

const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const register = async () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    errorPassword.value = "All fields are required";
    errorEmail.value = " ";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorPassword.value = "Passwords do not match";
    return;
  }
  if (!passwordRegex.test(password.value)) {
    errorPassword.value = "Password must be at least 8 characters, include a number, a special character, and an uppercase letter";
    return;
  }
  if(!emailRegex.test(email.value)) {
    errorEmail.value = "Try a valid e-mail.";
    return;
  }
  errorPassword.value = '';
  errorEmail.value = '';
  valid.value = true;
  const response = await fetch('http://localhost:3000/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
  });
  const data = await response.json();
  router.replace('/login');
};
</script>
