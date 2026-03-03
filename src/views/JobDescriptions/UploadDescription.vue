<script setup lang="ts">
import { ref } from 'vue'
import { usePrimeVue } from 'primevue/config'
import { useToast } from 'primevue/usetoast'

const $primevue = usePrimeVue()
const toast = useToast()

const totalSize = ref(0)
const totalSizePercent = ref(0)
const files = ref([])
const uploadedFilesPaths = ref([])

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
  try {
    const response = JSON.parse(event.xhr.response)
    if (response.files) {
      uploadedFilesPaths.value = response.files
      toast.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `${response.files.length} file(s) stored successfully`,
        life: 3000,
      })
    }
  } catch (error) {
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
}

const formatSize = (bytes) => {
  const k = 1024
  const dm = 3
  const sizes = $primevue.config.locale.fileSizeTypes
  if (bytes === 0) return `0 ${sizes[0]}`
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
</script>

<template>
  <div class="upload-page">
    <Toast />

    <!-- Page heading -->
    <div class="upload-heading">
      <div class="upload-heading-icon">
        <i class="pi pi-folder-open"></i>
      </div>
      <div>
        <h1 class="upload-title">Document Upload</h1>
        <p class="upload-subtitle">Add PDF job descriptions to the repository</p>
      </div>
    </div>

    <FileUpload
      name="demo[]"
      url="http://localhost:3000/api/upload"
      @upload="onTemplatedUpload($event)"
      @error="onUploadError($event)"
      :multiple="true"
      accept="image/*,application/pdf"
      :maxFileSize="1000000"
      @select="onSelectedFiles"
      class="upload-component"
    >
      <!-- ── Toolbar ── -->
      <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
        <div class="upload-toolbar">
          <div class="toolbar-actions">
            <button
              class="tool-btn tool-btn--choose"
              @click="chooseCallback()"
              title="Choose files"
            >
              <i class="pi pi-plus"></i>
              <span>Add Files</span>
            </button>
            <button
              class="tool-btn tool-btn--upload"
              @click="uploadEvent(uploadCallback)"
              :disabled="!files || files.length === 0"
              title="Upload"
            >
              <i class="pi pi-cloud-upload"></i>
              <span>Upload</span>
            </button>
            <button
              class="tool-btn tool-btn--clear"
              @click="onClearTemplatingUpload(clearCallback)"
              :disabled="!files || files.length === 0"
              title="Clear all"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>

          <div class="toolbar-progress">
            <div class="progress-labels">
              <span class="progress-used">{{ totalSize }}B</span>
              <span class="progress-limit">? MB limit</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: Math.min(totalSizePercent, 100) + '%' }"
                :class="{ 'progress-fill--warn': totalSizePercent > 80 }"
              ></div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── File list ── -->
      <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
        <div class="file-panels">
          <!-- Pending -->
          <div v-if="files.length > 0" class="file-panel">
            <div class="panel-label">
              <span class="panel-dot panel-dot--pending"></span>
              Pending — {{ files.length }} file{{ files.length !== 1 ? 's' : '' }}
            </div>
            <div class="file-grid">
              <div
                v-for="(file, index) of files"
                :key="file.name + file.type + file.size"
                class="file-card file-card--pending"
              >
                <div class="file-card-icon">
                  <img
                    v-if="file.type.startsWith('image/')"
                    :alt="file.name"
                    :src="file.objectURL"
                  />
                  <i v-else class="pi pi-file-pdf"></i>
                </div>
                <div class="file-card-meta">
                  <span class="file-card-name">{{ file.name }}</span>
                  <span class="file-card-size">{{ formatSize(file.size) }}</span>
                </div>
                <button
                  class="file-card-remove"
                  @click="onRemoveTemplatingFile(file, removeFileCallback, index)"
                  title="Remove"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div v-if="uploadedFiles.length > 0" class="file-panel">
            <div class="panel-label">
              <span class="panel-dot panel-dot--done"></span>
              Uploaded — {{ uploadedFiles.length }} file{{ uploadedFiles.length !== 1 ? 's' : '' }}
            </div>
            <div class="file-grid">
              <div
                v-for="(file, index) of uploadedFiles"
                :key="file.name + file.type + file.size"
                class="file-card file-card--done"
              >
                <div class="file-card-icon file-card-icon--done">
                  <img
                    v-if="file.type.startsWith('image/')"
                    :alt="file.name"
                    :src="file.objectURL"
                  />
                  <i v-else class="pi pi-file-pdf"></i>
                </div>
                <div class="file-card-meta">
                  <span class="file-card-name">{{ file.name }}</span>
                  <span class="file-card-size">{{ formatSize(file.size) }}</span>
                </div>
                <button
                  class="file-card-remove"
                  @click="removeUploadedFileCallback(index)"
                  title="Remove"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Empty state ── -->
      <template #empty>
        <div class="dropzone-empty">
          <div class="dropzone-icon-ring">
            <i class="pi pi-cloud-upload"></i>
          </div>
          <p class="dropzone-text">Drop files here</p>
          <p class="dropzone-hint">PDF or image files up to ? MB each</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────
   Tokens
───────────────────────────────────────── */
:root {
  --bg: #0d0f12;
  --surface: #13171d;
  --surface-2: #1a1f27;
  --surface-3: #222830;
  --border: rgba(255, 255, 255, 0.07);
  --border-2: rgba(255, 255, 255, 0.12);
  --text: #e8eaed;
  --text-2: #8b95a3;
  --text-3: #505a68;
  --amber: #f0a940;
  --amber-dim: rgba(240, 169, 64, 0.12);
  --amber-mid: rgba(240, 169, 64, 0.25);
  --green: #3ecf72;
  --green-dim: rgba(62, 207, 114, 0.12);
  --red: #f25a5a;
  --red-dim: rgba(242, 90, 90, 0.1);
}

/* ─────────────────────────────────────────
   Page shell
───────────────────────────────────────── */
.upload-page {
  padding: 2rem 2rem 3rem;
  max-width: 860px;
  margin: 0 auto;
  color: var(--text);
}

/* ─────────────────────────────────────────
   Heading
───────────────────────────────────────── */
.upload-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.upload-heading-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: var(--amber-dim);
  border: 1px solid var(--amber-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--amber);
  font-size: 1.2rem;
  flex-shrink: 0;
}
.upload-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text);
  line-height: 1.2;
}
.upload-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.825rem;
  color: var(--text-2);
}

/* ─────────────────────────────────────────
   Override PrimeVue FileUpload shell
───────────────────────────────────────── */
.upload-component :deep(.p-fileupload) {
  background: var(--surface) !important;
  border: 1px solid var(--border-2) !important;
  border-radius: 14px !important;
  overflow: hidden;
}
.upload-component :deep(.p-fileupload-header) {
  background: var(--surface-2) !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 0 !important;
}
.upload-component :deep(.p-fileupload-content) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* ─────────────────────────────────────────
   Toolbar
───────────────────────────────────────── */
.upload-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
}
.toolbar-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 7px;
  border: 1px solid var(--border-2);
  background: var(--surface-3);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    opacity 0.15s;
}
.tool-btn i {
  font-size: 0.85rem;
}
.tool-btn:hover:not(:disabled) {
  background: var(--surface-3);
  border-color: var(--border-2);
  filter: brightness(1.15);
}
.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tool-btn--choose {
  border-color: var(--amber-mid);
  color: var(--amber);
  background: var(--amber-dim);
}
.tool-btn--choose:hover:not(:disabled) {
  background: rgba(240, 169, 64, 0.2);
}
.tool-btn--upload {
  border-color: rgba(62, 207, 114, 0.25);
  color: var(--green);
  background: var(--green-dim);
}
.tool-btn--upload:hover:not(:disabled) {
  background: rgba(62, 207, 114, 0.2);
}
.tool-btn--clear {
  border-color: rgba(242, 90, 90, 0.2);
  color: var(--red);
  background: var(--red-dim);
  padding: 0.45rem 0.6rem;
}
.tool-btn--clear:hover:not(:disabled) {
  background: rgba(242, 90, 90, 0.18);
}

/* Progress */
.toolbar-progress {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 160px;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-2);
}
.progress-track {
  height: 3px;
  border-radius: 99px;
  background: var(--surface-3);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--amber);
  transition: width 0.3s ease;
}
.progress-fill--warn {
  background: var(--red);
}

/* ─────────────────────────────────────────
   Drop zone empty state
───────────────────────────────────────── */
.dropzone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2rem;
  gap: 0.6rem;
}
.dropzone-icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px dashed var(--border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.dropzone-empty:hover .dropzone-icon-ring {
  border-color: var(--amber-mid);
  color: var(--amber);
}
.dropzone-text {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-2);
}
.dropzone-hint {
  margin: 0;
  font-size: 0.775rem;
  color: var(--text-3);
}

/* ─────────────────────────────────────────
   File panels
───────────────────────────────────────── */
.file-panels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem;
}
.panel-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2);
  margin-bottom: 0.75rem;
}
.panel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.panel-dot--pending {
  background: var(--amber);
  box-shadow: 0 0 6px var(--amber);
}
.panel-dot--done {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
}

/* File grid */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.6rem;
}

/* File card */
.file-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  transition:
    border-color 0.15s,
    background 0.15s;
  position: relative;
}
.file-card:hover {
  border-color: var(--border-2);
  background: var(--surface-3);
}
.file-card--pending {
  border-left: 3px solid var(--amber);
}
.file-card--done {
  border-left: 3px solid var(--green);
}

.file-card-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 7px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--red);
  font-size: 1.1rem;
}
.file-card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-card-icon--done {
  color: var(--green);
}

.file-card-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.file-card-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-card-size {
  font-size: 0.7rem;
  color: var(--text-3);
}

.file-card-remove {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-3);
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}
.file-card-remove:hover {
  background: var(--red-dim);
  border-color: rgba(242, 90, 90, 0.3);
  color: var(--red);
}

/* ─────────────────────────────────────────
   Responsive
───────────────────────────────────────── */
@media (max-width: 560px) {
  .upload-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-progress {
    width: 100%;
  }
  .file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
