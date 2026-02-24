<script setup lang="ts">
import { ref } from 'vue'
import { usePrimeVue } from 'primevue/config'
import { useToast } from 'primevue/usetoast'

const $primevue = usePrimeVue()
const toast = useToast()

const totalSize = ref(0)
const totalSizePercent = ref(0)
const files = ref([])
const uploadedFilesPaths = ref([]) // Store paths of uploaded files

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index)
  totalSize.value -= parseInt(formatSize(file.size))
  totalSizePercent.value = totalSize.value / 10
}

const onClearTemplatingUpload = (clear) => {
  clear()
  totalSize.value = 0
  totalSizePercent.value = 0
}

const onSelectedFiles = (event) => {
  files.value = event.files
  files.value.forEach((file) => {
    totalSize.value += parseInt(formatSize(file.size))
  })
}

const uploadEvent = (callback) => {
  totalSizePercent.value = totalSize.value / 10
  callback()
}

const onTemplatedUpload = (event) => {
  // Parse the response from the server
  try {
    const response = JSON.parse(event.xhr.response)

    if (response.files) {
      // Store the uploaded file paths
      uploadedFilesPaths.value = response.files

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${response.files.length} file(s) uploaded to public/uploaded-job-descriptions folder`,
        life: 3000,
      })

      // Log the uploaded files info
      console.log('Uploaded files:', response.files)
    }
  } catch (error) {
    console.error('Error parsing upload response:', error)
    toast.add({
      severity: 'info',
      summary: 'Upload Complete',
      detail: 'Files uploaded successfully',
      life: 3000,
    })
  }
}

const onUploadError = (event) => {
  toast.add({
    severity: 'error',
    summary: 'Upload Failed',
    detail: 'Failed to upload files. Please try again.',
    life: 3000,
  })
  console.error('Upload error:', event)
}

const formatSize = (bytes) => {
  const k = 1024
  const dm = 3
  const sizes = $primevue.config.locale.fileSizeTypes

  if (bytes === 0) {
    return `0 ${sizes[0]}`
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))

  return `${formattedSize} ${sizes[i]}`
}
</script>

<template>
  <div class="card">
    <Toast />
    <FileUpload
      name="demo[]"
      url="http://localhost:3000/api/upload"
      @upload="onTemplatedUpload($event)"
      @error="onUploadError($event)"
      :multiple="true"
      accept="image/*,application/pdf"
      :maxFileSize="1000000"
      @select="onSelectedFiles"
    >
      <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
        <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
          <div class="flex gap-2">
            <Button
              @click="chooseCallback()"
              icon="pi pi-images"
              rounded
              variant="outlined"
              severity="secondary"
            ></Button>
            <Button
              @click="uploadEvent(uploadCallback)"
              icon="pi pi-cloud-upload"
              rounded
              variant="outlined"
              severity="success"
              :disabled="!files || files.length === 0"
            ></Button>
            <Button
              @click="onClearTemplatingUpload(clearCallback)"
              icon="pi pi-times"
              rounded
              variant="outlined"
              severity="danger"
              :disabled="!files || files.length === 0"
            ></Button>
          </div>
          <ProgressBar
            :value="totalSizePercent"
            :showValue="false"
            class="md:w-20rem h-1 w-full md:ml-auto"
          >
            <span class="whitespace-nowrap">{{ totalSize }}B / 1Mb</span>
          </ProgressBar>
        </div>
      </template>
      <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
        <div class="flex flex-col gap-8 pt-4">
          <div v-if="files.length > 0">
            <h5>Pending</h5>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(file, index) of files"
                :key="file.name + file.type + file.size"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <div>
                  <img
                    v-if="file.type.startsWith('image/')"
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                  <i v-else class="pi pi-file-pdf text-6xl text-red-500"></i>
                </div>
                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >{{ file.name }}</span
                >
                <div>{{ formatSize(file.size) }}</div>
                <Badge value="Pending" severity="warn" />
                <Button
                  icon="pi pi-times"
                  @click="onRemoveTemplatingFile(file, removeFileCallback, index)"
                  variant="outlined"
                  rounded
                  severity="danger"
                />
              </div>
            </div>
          </div>

          <div v-if="uploadedFiles.length > 0">
            <h5>Completed</h5>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(file, index) of uploadedFiles"
                :key="file.name + file.type + file.size"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <div>
                  <img
                    v-if="file.type.startsWith('image/')"
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                  <i v-else class="pi pi-file-pdf text-6xl text-red-500"></i>
                </div>
                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >{{ file.name }}</span
                >
                <div>{{ formatSize(file.size) }}</div>
                <Badge value="Completed" class="mt-4" severity="success" />
                <Button
                  icon="pi pi-times"
                  @click="removeUploadedFileCallback(index)"
                  variant="outlined"
                  rounded
                  severity="danger"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #empty>
        <div class="flex items-center justify-center flex-col">
          <i class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color" />
          <p class="mt-6 mb-0">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
