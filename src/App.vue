<template>
  <navigation></navigation>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Navigation from "./components/Navigation.vue";
import { onMounted } from 'vue';

onMounted(() => {
  document.documentElement.classList.add('has-navbar-fixed-top')
})
</script>
