<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const toast = useToast()

const selectedFile = ref(null)
const extractedText = ref('')
const isProcessing = ref(false)
const progress = ref(0)
const fileType = ref('')
const documentPreview = ref('')

const hasContent = computed(() => extractedText.value.length > 0)

const onFileSelect = (event) => {
  const file = event.files[0]
  if (!file) return

  selectedFile.value = file
  fileType.value = file.type
  extractedText.value = ''
  progress.value = 0

  // Create preview URL
  documentPreview.value = URL.createObjectURL(file)

  toast.add({
    severity: 'info',
    summary: 'File Selected',
    detail: `${file.name} ready for processing`,
    life: 3000,
  })
}

const processDocument = async () => {
  if (!selectedFile.value) {
    toast.add({
      severity: 'warn',
      summary: 'No File',
      detail: 'Please select a file first',
      life: 3000,
    })
    return
  }

  isProcessing.value = true
  progress.value = 0
  extractedText.value = ''

  try {
    if (fileType.value === 'application/pdf') {
      await processPDF()
    } else if (fileType.value.startsWith('image/')) {
      await processImage()
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Text extracted successfully',
      life: 3000,
    })
  } catch (error) {
    console.error('Processing error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to extract text from document',
      life: 3000,
    })
  } finally {
    isProcessing.value = false
    progress.value = 100
  }
}

const processPDF = async () => {
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result)
        const pdf = await pdfjsLib.getDocument(typedArray).promise
        const numPages = pdf.numPages
        let fullText = ''

        for (let i = 1; i <= numPages; i++) {
          progress.value = Math.round((i / numPages) * 100)

          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item) => item.str).join(' ')

          fullText += `\n--- Page ${i} ---\n${pageText}\n`
        }

        extractedText.value = fullText.trim()
        resolve()
      } catch (error) {
        reject(error)
      }
    }

    fileReader.onerror = reject
    fileReader.readAsArrayBuffer(selectedFile.value)
  })
}

const processImage = async () => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(selectedFile.value, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          progress.value = Math.round(m.progress * 100)
        }
      },
    })
      .then(({ data: { text } }) => {
        extractedText.value = text
        resolve()
      })
      .catch(reject)
  })
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(extractedText.value)
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Text copied to clipboard',
      life: 2000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to copy text',
      life: 2000,
    })
  }
}

const downloadText = () => {
  const blob = new Blob([extractedText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `extracted-text-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const clearDocument = () => {
  selectedFile.value = null
  extractedText.value = ''
  progress.value = 0
  fileType.value = ''
  if (documentPreview.value) {
    URL.revokeObjectURL(documentPreview.value)
    documentPreview.value = ''
  }
}
</script>

<template>
  <div class="card">
    <Toast />

    <div class="mb-6">
      <h2 class="text-3xl font-bold mb-2">Document Text Extractor</h2>
      <p class="text-muted-color">Extract text from PDFs and images using OCR</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upload Section -->
      <div class="col-span-1">
        <Panel header="Upload Document" class="h-full">
          <FileUpload
            mode="basic"
            name="document"
            accept="image/*,application/pdf"
            :maxFileSize="5000000"
            @select="onFileSelect"
            :auto="false"
            chooseLabel="Choose File"
            class="mb-4"
          />

          <div v-if="selectedFile" class="mt-4">
            <Divider />

            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="font-semibold">{{ selectedFile.name }}</p>
                <p class="text-sm text-muted-color">
                  {{ (selectedFile.size / 1024).toFixed(2) }} KB
                </p>
              </div>
              <Button icon="pi pi-times" severity="danger" text rounded @click="clearDocument" />
            </div>

            <!-- Document Preview -->
            <div v-if="documentPreview" class="mb-4">
              <img
                v-if="fileType.startsWith('image/')"
                :src="documentPreview"
                alt="Document preview"
                class="w-full rounded-lg border border-surface"
              />
              <div v-else class="p-8 bg-surface-50 dark:bg-surface-800 rounded-lg text-center">
                <i class="pi pi-file-pdf text-6xl text-red-500 mb-2"></i>
                <p class="text-muted-color">PDF Document</p>
              </div>
            </div>

            <Button
              label="Extract Text"
              icon="pi pi-bolt"
              @click="processDocument"
              :loading="isProcessing"
              :disabled="isProcessing"
              class="w-full"
              severity="primary"
            />

            <ProgressBar v-if="isProcessing" :value="progress" class="mt-4">
              <template #value="{ value }">
                <span class="text-sm">{{ value }}%</span>
              </template>
            </ProgressBar>
          </div>

          <div v-else class="text-center py-8">
            <i class="pi pi-cloud-upload text-6xl text-muted-color mb-4"></i>
            <p class="text-muted-color">Select a PDF or image file to begin</p>
          </div>
        </Panel>
      </div>

      <!-- Results Section -->
      <div class="col-span-1">
        <Panel header="Extracted Text" class="h-full">
          <div v-if="hasContent">
            <div class="flex gap-2 mb-4">
              <Button
                label="Copy"
                icon="pi pi-copy"
                size="small"
                @click="copyToClipboard"
                outlined
              />
              <Button
                label="Download"
                icon="pi pi-download"
                size="small"
                @click="downloadText"
                outlined
              />
            </div>

            <Divider />

            <Textarea v-model="extractedText" rows="20" class="w-full font-mono text-sm" readonly />

            <div class="mt-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-color">Characters:</p>
                  <p class="font-semibold">{{ extractedText.length.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-muted-color">Words:</p>
                  <p class="font-semibold">
                    {{
                      extractedText
                        .split(/\s+/)
                        .filter((w) => w.length > 0)
                        .length.toLocaleString()
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <i class="pi pi-file-edit text-6xl text-muted-color mb-4"></i>
            <p class="text-muted-color">Extracted text will appear here</p>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
