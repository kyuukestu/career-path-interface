<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  title: string
}>()

// Reactive state
const jobData = ref<any>(null)
const jobIndex = ref<any[]>([])
const loading = ref(false)
const publicPDFPath = ref<string | null>(null)

// Load job index once
onMounted(async () => {
  try {
    const res = await fetch('/job-index.json')
    jobIndex.value = await res.json()
  } catch (err) {
    console.error('Failed to load job index:', err)
  }
})

// Structured loader function
async function loadJob(title: string) {
  if (!title || jobIndex.value.length === 0) {
    return
  }

  const match = jobIndex.value.find((job) => job.title === title)

  if (!match) {
    jobData.value = null
    publicPDFPath.value = null
    return
  }

  loading.value = true
  jobData.value = null
  publicPDFPath.value = match.publicPDFPath || null

  try {
    const res = await fetch(match.publicJSONPath)
    jobData.value = await res.json()
  } catch (err) {
    console.error('Failed to load job JSON:', err)
    jobData.value = null
  } finally {
    loading.value = false
  }
}

// React when either title OR jobIndex changes
watch(
  [() => props.title, jobIndex],
  ([newTitle]) => {
    loadJob(newTitle)
  },
  { immediate: true },
)

function openPDF() {
  if (publicPDFPath.value) {
    window.open(publicPDFPath.value, '_blank')
  }
}
</script>

<template>
  <Card>
    <template #title>
      <span v-if="loading">Loading...</span>
      <span v-else-if="jobData">{{ jobData.title }}</span>
      <span v-else>Select a role</span>
    </template>

    <template #content>
      <div v-if="loading">Fetching job details...</div>

      <div v-else-if="jobData">
        <p>{{ jobData.purpose }}</p>

        <h4 v-if="jobData.key_responsibilities?.length">Key Responsibilities</h4>
        <ul v-if="jobData.key_responsibilities?.length">
          <li v-for="(item, index) in jobData.key_responsibilities" :key="index">
            {{ item }}
          </li>
        </ul>

        <h4 v-if="jobData.education?.length">Education / Experience</h4>
        <ul v-if="jobData.education?.length">
          <li v-for="(item, index) in jobData.education" :key="index">
            {{ item }}
          </li>
        </ul>

        <h4 v-if="jobData.performance?.length">Performance Criteria</h4>
        <ul v-if="jobData.performance?.length">
          <li v-for="(item, index) in jobData.performance" :key="index">
            {{ item }}
          </li>
        </ul>

        <!-- PDF Button -->
        <div v-if="publicPDFPath" style="margin-top: 1rem">
          <button @click="openPDF">View Full Job Description (PDF)</button>
        </div>
      </div>

      <div v-else>No data found.</div>
    </template>
  </Card>
</template>
