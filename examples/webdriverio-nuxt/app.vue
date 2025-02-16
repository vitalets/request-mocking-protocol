<script setup lang="ts">
const { data: users } = useFetch('https://jsonplaceholder.typicode.com/users');
</script>

<template>
  <h2>Users:</h2>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
