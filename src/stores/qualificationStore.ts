import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQualificationStore = defineStore('qualification', () => {
  const qualifications = ref<any[]>([
    {
      type: 'Education',
      name: 'Bachelor’s Degree in Mechanical Engineering',
      value: 'Bachelor’s Degree in Mechanical Engineering',
    },
    {
      type: 'Experience',
      name: '3+ years in industrial maintenance or design',
      value: '3+ years in industrial maintenance or design',
    },
    {
      type: 'Certification',
      name: 'Professional Engineer (PE) License',
      value: 'Professional Engineer (PE) License',
    },
  ])

  // user's selected qualifications
  const userQualifications = ref<any[]>([])

  return { qualifications, useQualificationStore }
})
