<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreeChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import CareerCard from './CareerCard.vue'

// Register ECharts modules
use([CanvasRenderer, TreeChart, TooltipComponent, TitleComponent])

// Props: path to JSON file
const props = defineProps<{ jsonPath: string }>()

const jobIndex = ref<{ title: string; jobFile: string }[]>([])
const treeOptions = ref<any | null>(null)
const selectedTitle = ref<string | null>(null)
const visible = ref(false)

// Handle node click
async function onNodeClick(params: any) {
  console.log('Params:', params.data)
  if (!params.data?.name) return
  selectedTitle.value = params.data.name
  console.log('Selected title:', selectedTitle.value)

  visible.value = true
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
      },
      series: [
        {
          type: 'tree',
          data: [data],
          orient: 'RL', // left-to-right orientation
          symbolSize: 40,
          nodeGap: 140,
          initialTreeDepth: 2,
          expandAndCollapse: false,
          roam: true,
          animationDuration: 750,
          animationDurationUpdate: 750,
          lineStyle: { color: '#bbb', width: 3, curveness: 0.3 },
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
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
              color: '#000',
              fontSize: 14,
              fontWeight: '600',
              fontStyle: 'italic',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              lineHeight: 1.3,
              labelLayout: { hideOverlap: true },
            },
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

// Load job index on mount
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
      @click="(params) => onNodeClick(params)"
    />
    <p v-else class="text-gray-500 italic">Loading career path...</p>
  </div>
  <Dialog v-model:visible="visible">
    <CareerCard v-if="selectedTitle" :title="selectedTitle" />
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
