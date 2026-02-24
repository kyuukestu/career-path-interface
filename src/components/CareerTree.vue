<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreeChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import CareerCard from './CareerCard.vue'
import { useJobStore } from '@/stores/useJobStore'

// Register ECharts modules
use([CanvasRenderer, TreeChart, TooltipComponent, TitleComponent])

// Props: path to JSON file
const props = defineProps<{ jsonPath: string }>()

const jobIndex = ref<{ title: string; jobFile: string }[]>([])

const treeOptions = ref<any | null>(null)
const jobStore = useJobStore()
// const selectedNode = ref<any | null>(null)

const visible = ref(false)
async function onNodeClick(params: any) {
  if (!params.data.jobFile) return

  const res = await `/JSON-job-descriptions/${params.data.department}/${params.data.jobFile}`
  const jobData = await res.json()

  jobStore.setSelectedJob(jobData)
  // jobStore.setSelectedJob(params.data)
  visible.value = !visible.value
}

// Fetch and load tree data
async function loadTree(path: string) {
  if (!path) return
  try {
    const res = await fetch(path)
    const data = await res.json()

    treeOptions.value = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          const name = params.data.title || ''
          const dept = params.data.department ? `<br/>${params.data.department}` : ''
          return `<strong>${name}</strong>${dept}`
        },
      },
      series: [
        {
          type: 'tree',
          data: [data],
          orient: 'RL', // left-to-right orientation
          symbolSize: 40,
          nodeGap: 140, // space between sibling nodes
          initialTreeDepth: 2,
          expandAndCollapse: false,
          roam: true,
          animationDuration: 750,
          animationDurationUpdate: 750,

          // Line styling
          lineStyle: {
            color: '#bbb',
            width: 3,
            curveness: 0.3,
          },

          // Internal nodes styling
          label: {
            position: 'top',
            verticalAlign: 'middle',
            align: 'middle',
            color: '#1a1a1a',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            lineHeight: 1.4,
            labelLayout: { hideOverlap: true },
          },

          // Leaves styling
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
              color: '#000', // distinct leaf color
              fontSize: 14,
              fontWeight: '600',
              fontStyle: 'italic',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              lineHeight: 1.3,
              labelLayout: { hideOverlap: true },
            },
          },

          // Levels for spacing and styling
          levels: [
            {
              level: 1,
              distance: 160,
              label: { fontSize: 16, color: '#1a1a1a' },
              itemStyle: { borderWidth: 1, borderColor: '#ccc' },
            },
            {
              level: 2,
              distance: 140,
              label: { fontSize: 15, color: '#333' },
              itemStyle: { borderWidth: 1, borderColor: '#bbb' },
            },
            {
              level: 3,
              distance: 120,
              label: { fontSize: 14, color: '#555' },
            },
          ],

          emphasis: {
            focus: 'adjacency',
            label: { fontWeight: 'bold', color: '#ff4500' },
          },
        },
      ],
    }
  } catch (err) {
    console.error('Failed to load tree data:', err)
  }
}

// Watch for prop changes
watch(
  () => props.jsonPath,
  (newPath) => loadTree(newPath),
  { immediate: true },
)

// onMounted(() => loadTree(props.jsonPath))
onMounted(async () => {
  const res = await fetch('/job-index.json')
  jobIndex.value = await res.json()
})
</script>

<template>
  <div class="career-tree">
    <VChart
      v-if="treeOptions"
      :option="treeOptions"
      autoresize
      style="height: 700px; width: 100%"
      @click="onNodeClick"
    />
    <p v-else class="text-gray-500 italic">Loading career path...</p>
  </div>
  <Dialog v-model:visible="visible">
    <CareerCard />
  </Dialog>
</template>

<style scoped>
.career-tree {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fefefe, #fafafa);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
