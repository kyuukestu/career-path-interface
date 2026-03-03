<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface JobIndexItem {
  id: string
  title: string
  department: string
  publicJSONPath: string
  publicPDFPath: string
}

const jobs = ref<JobIndexItem[]>([])
const loading = ref(true)
const search = ref('')
const layout = ref<'list' | 'grid'>('list')
const options = ref(['list', 'grid'])

async function loadJobs() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}job-index.json`)
    const data: JobIndexItem[] = await response.json()
    jobs.value = data.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('Failed to load job index:', error)
  } finally {
    loading.value = false
  }
}

const filteredJobs = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return jobs.value
  return jobs.value.filter((job) => `${job.title} ${job.department}`.toLowerCase().includes(term))
})

onMounted(loadJobs)
</script>

<template>
  <div class="jobs-wrapper">
    <DataView :value="filteredJobs" :layout="layout" paginator :rows="9" :loading="loading">
      <!-- Header -->
      <template #header>
        <div class="dv-header">
          <div class="dv-header-left">
            <span class="dv-title">Job Descriptions</span>
            <span class="dv-count" v-if="!loading">{{ filteredJobs.length }} positions</span>
          </div>
          <div class="dv-header-right">
            <span class="p-input-icon-left search-wrap">
              <i class="pi pi-search" />
              <InputText
                v-model="search"
                placeholder="Search by title or department…"
                class="search-input"
              />
            </span>
            <SelectButton v-model="layout" :options="options" :allowEmpty="false">
              <template #option="{ option }">
                <i :class="option === 'list' ? 'pi pi-bars' : 'pi pi-th-large'" />
              </template>
            </SelectButton>
          </div>
        </div>
      </template>

      <!-- LIST VIEW -->
      <template #list="slotProps">
        <div class="list-container">
          <div
            v-for="(item, index) in slotProps.items"
            :key="item.id"
            class="list-item"
            :class="{ 'list-item--first': index === 0 }"
          >
            <div class="list-icon">
              <img src="/images/pdf-icon.svg" alt="PDF" />
            </div>
            <div class="list-text">
              <div class="list-title">{{ item.title }}</div>
              <div>
                <span class="dept-pill">{{ item.department }}</span>
              </div>
            </div>
            <div class="list-actions">
              <a :href="item.publicPDFPath" target="_blank">
                <Button icon="pi pi-file-pdf" label="PDF" />
              </a>
              <a :href="item.publicJSONPath" target="_blank">
                <Button icon="pi pi-code" label="JSON" severity="secondary" variant="outlined" />
              </a>
            </div>
          </div>
        </div>
      </template>

      <!-- GRID VIEW -->
      <template #grid="slotProps">
        <div class="grid-container">
          <div v-for="item in slotProps.items" :key="item.id" class="grid-card">
            <div class="grid-card-accent"></div>
            <div class="grid-icon-wrap">
              <img src="/images/pdf-icon.svg" alt="PDF" class="grid-icon" />
            </div>
            <div class="grid-body">
              <div class="grid-dept">{{ item.department }}</div>
              <div class="grid-title">{{ item.title }}</div>
            </div>
            <div class="grid-footer">
              <a :href="item.publicPDFPath" target="_blank" class="grid-btn-pdf">
                <Button icon="pi pi-file-pdf" label="PDF" class="w-full" />
              </a>
              <a :href="item.publicJSONPath" target="_blank">
                <Button icon="pi pi-code" severity="secondary" variant="outlined" />
              </a>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style scoped>
.jobs-wrapper {
  padding: 1.5rem;
}
.jobs-wrapper :deep(.p-dataview) {
  border: none;
  background: transparent;
}

/* Header */
.dv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0.25rem;
  border-bottom: 2px solid var(--surface-200, #e5e7eb);
  margin-bottom: 0.25rem;
}
.dv-header-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
.dv-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-color, #f3f4f6);
}
.dv-count {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color-secondary, #6b7280);
  background: var(--surface-100, #f3f4f6);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--surface-200, #e5e7eb);
}
.dv-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-input {
  padding-left: 2.25rem !important;
  border-radius: 8px !important;
  min-width: 220px;
  font-size: 0.875rem;
}

/* List */
.list-container {
  display: flex;
  flex-direction: column;
}
.list-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1rem;
  border-top: 1px solid var(--surface-200, #e5e7eb);
  transition: background 0.15s ease;
}
.list-item--first {
  border-top: none;
}
.list-item:hover {
  background: var(--surface-50, #f9fafb);
}
.list-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-100, #f3f4f6);
  border: 1px solid var(--surface-200, #e5e7eb);
  border-radius: 10px;
  padding: 8px;
}
.list-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.list-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.list-title {
  font-size: 0.975rem;
  font-weight: 600;
  color: var(--text-color, #f3f4f6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.dept-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--primary-color, #6366f1);
  background: color-mix(in srgb, var(--primary-color, #6366f1) 10%, transparent);
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--primary-color, #6366f1) 20%, transparent);
}
.list-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
  padding: 0.75rem 0;
}
.grid-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--surface-200, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-0, #fff);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.grid-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.11);
  transform: translateY(-2px);
}
.grid-card-accent {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--primary-color, #6366f1),
    color-mix(in srgb, var(--primary-color, #6366f1) 55%, #a855f7)
  );
}
.grid-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 0.75rem;
  background: var(--surface-50, #f9fafb);
  border-bottom: 1px solid var(--surface-100, #f3f4f6);
}
.grid-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  opacity: 0.85;
}
.grid-body {
  padding: 0.85rem 1rem 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.grid-dept {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--primary-color, #6366f1);
}
.grid-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color, #f3f4f6);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.grid-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--surface-100, #f3f4f6);
  align-items: center;
}
.grid-btn-pdf {
  flex: 1;
  display: block;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .list-item:hover {
    background: var(--surface-800, #1e293b);
  }
  .grid-card {
    background: var(--surface-900, #0f172a);
    border-color: var(--surface-700, #334155);
  }
  .grid-card:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
  }
  .grid-icon-wrap {
    background: var(--surface-800, #1e293b);
    border-color: var(--surface-700, #334155);
  }
  .grid-footer {
    border-color: var(--surface-700, #334155);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .dv-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .dv-header-right {
    width: 100%;
  }
  .search-input {
    min-width: unset;
    width: 100%;
  }
  .list-item {
    flex-wrap: wrap;
  }
  .list-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
