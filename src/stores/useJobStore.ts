import { defineStore } from 'pinia'

export const useJobStore = defineStore('job', {
  state: () => ({
    selectedJob: null as null | {
      title: string
      purpose?: string
      key_responsibilities?: string[]
    },
  }),

  actions: {
    setSelectedJob(job: any) {
      this.selectedJob = job
    },
    clearJob() {
      this.selectedJob = null
    },
  },
})
