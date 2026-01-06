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
    <template #title>{{ jobStore.selectedJob.name }}</template>
    <template #content>
      <div v-for="req in jobStore.selectedJob.requirements || []" :key="req.value" class="mb-2">
        <!-- <pre>{{ store.userQualifications }}</pre> -->
        <Message
          :severity="
            Array.isArray(store.userQualifications) && store.userQualifications.includes(req.value)
              ? 'success'
              : 'error'
          "
        >
          {{ req.type }}: {{ req.value }}
        </Message>
      </div>
    </template>
  </Card>
</template>
