<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ title: string }>()

const jobData = ref<any>(null)
const jobIndex = ref<any[]>([])
const loading = ref(false)
const publicPDFPath = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('/job-index.json')
    jobIndex.value = await res.json()
  } catch (err) {
    console.error('Failed to load job index:', err)
  }
})

async function loadJob(title: string) {
  if (!title || jobIndex.value.length === 0) return
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

watch(
  [() => props.title, jobIndex],
  ([newTitle]) => {
    loadJob(newTitle)
  },
  { immediate: true },
)

function openPDF() {
  if (publicPDFPath.value) window.open(publicPDFPath.value, '_blank')
}
</script>

<template>
  <div class="jd-card">
    <!-- ── Loading state ── -->
    <div v-if="loading" class="jd-state">
      <div class="jd-spinner"><span></span><span></span><span></span></div>
      <p class="jd-state-text">Fetching job details…</p>
    </div>

    <!-- ── Empty / no selection ── -->
    <div v-else-if="!jobData" class="jd-state jd-state--empty">
      <div class="jd-empty-icon">
        <i class="pi pi-briefcase"></i>
      </div>
      <p class="jd-state-text">Select a role to view details</p>
    </div>

    <!-- ── Job content ── -->
    <div v-else class="jd-content" key="content">
      <!-- Header -->
      <div class="jd-header">
        <div class="jd-header-badge">
          <i class="pi pi-briefcase"></i>
        </div>
        <div class="jd-header-text">
          <h2 class="jd-title">{{ jobData.title }}</h2>
          <span v-if="jobData.department" class="jd-dept">{{ jobData.department }}</span>
        </div>
        <button v-if="publicPDFPath" class="jd-pdf-btn" @click="openPDF" title="Open PDF">
          <i class="pi pi-file-pdf"></i>
          <span>PDF</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="jd-divider"></div>

      <!-- Purpose -->
      <p v-if="jobData.purpose" class="jd-purpose">{{ jobData.purpose }}</p>

      <!-- Sections -->
      <div class="jd-sections">
        <div v-if="jobData.key_responsibilities?.length" class="jd-section">
          <div class="jd-section-header">
            <span class="jd-section-pip jd-section-pip--amber"></span>
            <h3 class="jd-section-title">Key Responsibilities</h3>
          </div>
          <ul class="jd-list">
            <li
              v-for="(item, i) in jobData.key_responsibilities"
              :key="i"
              class="jd-list-item"
              :style="{ animationDelay: i * 40 + 'ms' }"
            >
              <span class="jd-list-marker"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div v-if="jobData.education?.length" class="jd-section">
          <div class="jd-section-header">
            <span class="jd-section-pip jd-section-pip--blue"></span>
            <h3 class="jd-section-title">Education / Experience</h3>
          </div>
          <ul class="jd-list">
            <li
              v-for="(item, i) in jobData.education"
              :key="i"
              class="jd-list-item"
              :style="{ animationDelay: i * 40 + 'ms' }"
            >
              <span class="jd-list-marker jd-list-marker--blue"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div v-if="jobData.performance?.length" class="jd-section">
          <div class="jd-section-header">
            <span class="jd-section-pip jd-section-pip--green"></span>
            <h3 class="jd-section-title">Performance Criteria</h3>
          </div>
          <ul class="jd-list">
            <li
              v-for="(item, i) in jobData.performance"
              :key="i"
              class="jd-list-item"
              :style="{ animationDelay: i * 40 + 'ms' }"
            >
              <span class="jd-list-marker jd-list-marker--green"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer PDF button -->
      <div v-if="publicPDFPath" class="jd-footer">
        <button class="jd-pdf-full-btn" @click="openPDF">
          <i class="pi pi-file-pdf"></i>
          View Full Job Description
          <i class="pi pi-arrow-up-right jd-arrow"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────
   Tokens — kept consistent with suite
───────────────────────────────────────── */
.jd-card {
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
  --blue: #5b9cf6;
  --blue-dim: rgba(91, 156, 246, 0.12);
  --green: #3ecf72;
  --green-dim: rgba(62, 207, 114, 0.12);

  background: var(--surface);
  border: 1px solid var(--border-2);
  border-radius: 14px;
  overflow: hidden;
  color: var(--text);
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

/* ─────────────────────────────────────────
   States (loading / empty)
───────────────────────────────────────── */
.jd-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
}
.jd-state-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-3);
}

/* Spinner: three pulsing dots */
.jd-spinner {
  display: flex;
  gap: 5px;
  align-items: center;
}
.jd-spinner span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
  animation: dot-pulse 1.2s ease-in-out infinite;
}
.jd-spinner span:nth-child(2) {
  animation-delay: 0.2s;
}
.jd-spinner span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.jd-empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px dashed var(--border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 1.3rem;
}

/* ─────────────────────────────────────────
   Job content
───────────────────────────────────────── */
.jd-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  animation: fade-up 0.3s ease both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.jd-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.25rem 1.375rem 1.1rem;
}
.jd-header-badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 9px;
  background: var(--amber-dim);
  border: 1px solid var(--amber-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--amber);
  font-size: 1rem;
  margin-top: 2px;
}
.jd-header-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.jd-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  line-height: 1.25;
}
.jd-dept {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--amber);
  opacity: 0.85;
}

/* Header PDF button */
.jd-pdf-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-2);
  background: var(--surface-3);
  color: var(--text-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  margin-top: 2px;
}
.jd-pdf-btn:hover {
  background: rgba(242, 90, 90, 0.1);
  color: #f25a5a;
  border-color: rgba(242, 90, 90, 0.25);
}

/* Divider */
.jd-divider {
  height: 1px;
  background: var(--border);
  margin: 0 1.375rem;
}

/* Purpose */
.jd-purpose {
  margin: 0;
  padding: 1.1rem 1.375rem 0.25rem;
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-2);
  border-left: 2px solid var(--surface-3);
  margin-left: 1.375rem;
  margin-right: 1.375rem;
  padding-left: 0.875rem;
  margin-top: 1rem;
  background: var(--surface-2);
  border-radius: 0 6px 6px 0;
}

/* Sections */
.jd-sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 1.375rem;
  flex: 1;
}

.jd-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}
.jd-section-pip {
  width: 3px;
  height: 14px;
  border-radius: 99px;
  flex-shrink: 0;
}
.jd-section-pip--amber {
  background: var(--amber);
}
.jd-section-pip--blue {
  background: var(--blue);
}
.jd-section-pip--green {
  background: var(--green);
}

.jd-section-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2);
}

/* List */
.jd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.jd-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.845rem;
  line-height: 1.55;
  color: var(--text-2);
  animation: fade-up 0.25s ease both;
}
.jd-list-marker {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--amber);
  margin-top: 0.52em;
}
.jd-list-marker--blue {
  background: var(--blue);
}
.jd-list-marker--green {
  background: var(--green);
}

/* Footer */
.jd-footer {
  padding: 0 1.375rem 1.25rem;
  margin-top: auto;
}
.jd-pdf-full-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(242, 90, 90, 0.2);
  background: rgba(242, 90, 90, 0.07);
  color: #f07070;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  letter-spacing: 0.01em;
}
.jd-pdf-full-btn:hover {
  background: rgba(242, 90, 90, 0.13);
  border-color: rgba(242, 90, 90, 0.35);
  color: #f25a5a;
}
.jd-arrow {
  margin-left: auto;
  font-size: 0.7rem;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 480px) {
  .jd-header {
    padding: 1rem;
  }
  .jd-sections {
    padding: 1rem;
  }
  .jd-footer {
    padding: 0 1rem 1rem;
  }
  .jd-purpose {
    margin-left: 1rem;
    margin-right: 1rem;
    padding-left: 0.75rem;
  }
}
</style>
