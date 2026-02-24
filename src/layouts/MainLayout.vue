<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>
<template>
    <div class="layout">
      <NavBar />

      <main class="content">
        <router-view />
      </main>
      </div>
</template>
<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 1rem;
}
</style>
