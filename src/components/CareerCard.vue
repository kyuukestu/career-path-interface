<script setup lang="ts">
import { useQualificationStore } from '@/stores/qualificationStore'
import { useJobStore } from '@/stores/useJobStore'
import { watch } from 'vue'

const store = useQualificationStore()
const jobStore = useJobStore()

watch(
  () => store.userQualifications,
  (newVal) => {
    console.log('User qualifications changed:', newVal)
  },
)
</script>
<template>
  <Card v-if="jobStore.selectedJob">
    <template #title>{{ jobStore.selectedJob.title }}</template>
    <template #content>
      <p>{{ jobStore.selectedJob.purpose }}</p>
     <h4>Key Responsibilities</h4>

      <ul v-if="jobStore.selectedJob.key_responsibilities?.length">
        <li
          v-for="(item, index) in jobStore.selectedJob.key_responsibilities"
          :key="index"
        >
          {{ item }}
        </li>
      </ul>
        
    </template>
  </Card>
</template>
