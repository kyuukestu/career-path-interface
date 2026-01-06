<script setup lang="ts">
import { ref } from 'vue'

const isDark = ref(false)

function setTheme(theme: string) {
  const themeLink = document.getElementById('app-theme') as HTMLLinkElement
  if (themeLink) {
    themeLink.href = `/node_modules/@primeuix/themes/${theme}/theme.css`
  }
}

function toggleTheme() {
  if (isDark.value) {
    setTheme('aura-light-blue') // Light mode
  } else {
    setTheme('aura-dark-indigo') // Dark mode
  }
  isDark.value = !isDark.value
}
</script>

<template>
  <button @click="toggleTheme">Toggle {{ isDark ? 'Light' : 'Dark' }} Mode</button>
</template>
