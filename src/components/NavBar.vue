<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => {
      router.push('/')
      toast.add({
        severity: 'info',
        summary: 'Home',
        detail: 'Home',
        life: 3000,
      })
    },
  },
  {
    label: 'Manage',
    icon: 'pi pi-fw pi-file',
    badge: 3,
    items: [
      {
        label: 'Add',
        icon: '',
        command: () => {
          router.push('/add')
          toast.add({
            severity: 'info',
            summary: 'Add',
            detail: 'Add Job Description form.',
            life: 3000,
          })
        },
      },
      {
        label: 'Upload',
        icon: '',
        command: () => {
          router.push('/upload')
          toast.add({
            severity: 'info',
            summary: 'Upload',
            detail: 'Upload Job Description from PDF.',
            life: 3000,
          })
        },
      },
      {
        label: 'Edit',
        icon: '',
        command: () => {
          router.push('/edit')
          toast.add({
            severity: 'info',
            summary: 'Edit',
            detail: 'Edit Job Description form.',
            life: 3000,
          })
        },
      },
    ],
  },
])
</script>
<template>
  <Menubar :model="items">
    <template #start> </template>
    <template #item="{ item, props, hasSubmenu, root }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span> {{ item.label }}</span>
        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
        <i
          v-if="hasSubmenu"
          :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"
        ></i>
      </a>
    </template>
  </Menubar>
</template>
