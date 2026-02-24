<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const formData = reactive({
  positionTitle: '',
  department: '',
  mainPurpose: '',
  reportingRelationships: '',
  supervisoryResponsibilities: '',
  duties: [''],
  knowledgeAndSkills: ``,
  education: [''],
  competencies: [''],
  contacts: '',
  performanceCriteria: [''],
})

// Save form
const saveForm = () => {
  // Validate required fields
  if (!formData.positionTitle || !formData.department) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Position Title and Department are required',
      life: 3000,
    })
    return
  }

  // Filter out empty items from lists
  const cleanedData = {
    ...formData,
    duties: formData.duties.filter((item) => item.trim() !== ''),
    education: formData.education.filter((item) => item.trim() !== ''),
    competencies: formData.competencies.filter((item) => item.trim() !== ''),
    performanceCriteria: formData.performanceCriteria.filter((item) => item.trim() !== ''),
  }

  console.log('Saved Job Description:', cleanedData)

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Job Description saved successfully',
    life: 3000,
  })

  // Here you would typically send the data to your backend
  // await saveToBackend(cleanedData)
}

// Clear form
const clearForm = () => {
  Object.assign(formData, {
    positionTitle: '',
    department: '',
    mainPurpose: '',
    reportingRelationships: '',
    supervisoryResponsibilities: '',
    duties: [''],
    knowledgeAndSkills: ``,
    education: [''],
    competencies: [''],
    contacts: '',
    performanceCriteria: [''],
  })

  toast.add({
    severity: 'info',
    summary: 'Form Cleared',
    detail: 'All fields have been reset',
    life: 3000,
  })
}

// Export as JSON
const exportForm = () => {
  const dataStr = JSON.stringify(formData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `job-description-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  toast.add({
    severity: 'success',
    summary: 'Exported',
    detail: 'Job Description exported successfully',
    life: 3000,
  })
}
</script>

<template>
  <div class="card">
    <Toast />

    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">Create Job Description</h2>
        <p class="text-muted-color">
          Fill in the details to create a comprehensive job description
        </p>
      </div>
    </div>

    <Divider />

    <!-- Form Content -->
    <div class="max-w-4xl mx-auto">
      <!-- Title (Non-editable, centered) -->
      <h1 class="text-4xl font-bold">Job Description</h1>

      <!-- Position Title -->
      <div class="mb-6">
        <FloatLabel>
          <InputText id="positionTitle" v-model="formData.positionTitle" class="w-full" />
          <label for="positionTitle">Position Title</label>
        </FloatLabel>
      </div>

      <!-- Department -->
      <div class="mb-6">
        <FloatLabel>
          <InputText id="department" v-model="formData.department" class="w-full" />
          <label for="department">Department</label>
        </FloatLabel>
      </div>

      <Divider />

      <!-- Main Purpose of Job -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Main Purpose of Job</h2>
        <Editor v-model="formData.mainPurpose" editor-style="height: 200px" />
      </div>

      <!-- Reporting Relationships -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Reporting Relationships</h2>
        <Editor v-model="formData.reportingRelationships" editor-style="height: 200px" />
      </div>

      <!-- Supervisory Responsibilities -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Supervisory Responsibilities</h2>
        <Editor v-model="formData.supervisoryResponsibilities" editor-style="height: 200px" />
      </div>

      <Divider />

      <!-- Key Duties and Responsibilities -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Key Duties and Responsibilities</h2>

        <div class="space-y-4">
          <div v-for="(duty, index) in formData.duties" :key="`duty-${index}`" class="w-full">
            <Editor
              v-model="formData.duties[index]"
              editor-style="height: 120px"
              class="w-full mb-2"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="removeItem('duties', index)"
              :disabled="formData.duties.length === 1"
            />
          </div>
        </div>
      </div>

      <Divider />

      <!-- Knowledge and Skills Required -->
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">Knowledge and Skills Required</h2>
        <Editor v-model="formData.knowledgeAndSkills" editor-style="height: 300px" />
      </div>

      <!-- Education/Experience -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">Education/Experience</h2>

        <div class="space-y-4">
          <div v-for="(edu, index) in formData.education" :key="`edu-${index}`" class="w-full">
            <Editor
              :id="`education-${index}`"
              v-model="formData.education[index]"
              class="w-full mb-2"
              editor-style="height: 300px"
            />
          </div>
        </div>
      </div>

      <!-- Key Competencies -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">Key Competencies</h2>

        <div class="space-y-4">
          <div v-for="(comp, index) in formData.competencies" :key="`comp-${index}`" class="w-full">
            <Editor
              :id="`competencies-${index}`"
              v-model="formData.competencies[index]"
              class="w-full mb-2"
              editor-style="height: 300px"
            />

            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="removeItem('competencies', index)"
              :disabled="formData.competencies.length === 1"
            />
          </div>
        </div>
      </div>

      <Divider />

      <!-- Contacts -->
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">Contacts</h2>
        <Editor v-model="formData.contacts" editor-style="height: 200px" />
      </div>

      <!-- Performance Criteria -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Performance Criteria</h2>

        <div class="space-y-4">
          <div
            v-for="(criteria, index) in formData.performanceCriteria"
            :key="`criteria-${index}`"
            class="w-full"
          >
            <Editor
              v-model="formData.performanceCriteria[index]"
              editor-style="height: 120px"
              class="w-full mb-2"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="removeItem('performanceCriteria', index)"
              :disabled="formData.performanceCriteria.length === 1"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-8">
        <Button
          label="Clear Form"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="clearForm"
        />
        <Button
          label="Export JSON"
          icon="pi pi-download"
          severity="info"
          outlined
          @click="exportForm"
        />
        <Button label="Save Job Description" icon="pi pi-save" size="large" @click="saveForm" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
