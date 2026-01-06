import { defineStore } from 'pinia'

export const useJobStore = defineStore('job', {
  state: () => ({
    selectedJob: null as null | {
      name: string
      value?: string
      requirements?: { type: string; value: string }[]
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
