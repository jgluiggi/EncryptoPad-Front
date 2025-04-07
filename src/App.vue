<template>
  <navigation></navigation>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
import Navigation from "./components/Navigation.vue";
import { onMounted } from 'vue';

onMounted(() => {
  document.documentElement.classList.add('has-navbar-fixed-top')
})

function clearStorage() {

    let session = sessionStorage.getItem('register');

    if (session == null) {

        localStorage.removeItem('jwt');
        localStorage.removeItem('key');

    }
    sessionStorage.setItem('register', 1);
}

window.addEventListener('load', clearStorage);
</script>
