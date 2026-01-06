<script setup lang="ts">
import promotionHierarchy from './promotion-hierarchy.vue'
import SkillNetwork from './skill-network.vue'
import themeBtn from '@/components/themeBtn.vue'
import { useQualificationStore } from '@/stores/qualificationStore'
import Fuse from 'fuse.js'
import { ref } from 'vue'

const store = useQualificationStore()
const qualificationOptions = ref(store.qualifications)

const fuse = new Fuse(qualificationOptions.value, {
  keys: ['name', 'value'],
  threshold: 0.3,
})

const fuzzyFilter = (option: any, filter: string) => {
  if (!filter) return true

  const results = fuse.search(filter)

  return results.some((r) => r.item.value === option.value)
}

const onCreateOption = (newValue: any) => {
  const newOption = { name: newValue, value: newValue, type: 'Custom' }

  qualificationOptions.value.push(newOption)
  useQualificationStore().qualifications.push(newOption)
}
</script>
<template>
  <MultiSelect
    v-model="useQualificationStore().userQualifications"
    :options="qualificationOptions"
    :filter="true"
    :filterFunction="fuzzyFilter"
    optionLabel="name"
    display="chip"
    optionValue="value"
    class="w-full md:w-56"
    placeholder="Select Qualifications..."
    @create-option="onCreateOption"
  ></MultiSelect>
  <div class="grid grid-cols-12 gap-4 h-screen">
    <!-- Input Panel -->
    <h2 class="font-bold mb-2">Current Role</h2>

    <!-- Chart Panel -->
    <main class="col-span-6 flex flex-col">
      <promotionHierarchy />
      <!-- <SkillNetwork /> -->
    </main>
  </div>
</template>
