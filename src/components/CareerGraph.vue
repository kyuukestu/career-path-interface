<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart, TreeChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'

// Register ECharts modules
use([CanvasRenderer, TreeChart, GraphChart, TooltipComponent, TitleComponent])

// Props: path to JSON file
const props = defineProps<{
  jsonPath: string
}>()

const treeOptions = ref<any | null>(null)

function treeToGraph(tree: any) {
  const nodes: any[] = []
  const links: any[] = []

  function traverse(node: any, parent: any = null) {
    nodes.push({ name: node.name, value: node.value })
    if (parent) {
      links.push({ source: parent.name, target: node.name })
    }
    if (node.children) {
      node.children.forEach((child: any) => traverse(child, node))
    }
  }

  traverse(tree)
  return { nodes, links }
}

function onChartClick(params: any) {
  if (params.dataType === 'node') {
    alert('You clicked on a node')
  }

  if (params.dataType === 'edge') {
    alert('You clicked on an edge')
  }
}

// Fetch and load tree data
async function loadTree(path: string) {
  if (!path) return
  try {
    const res = await fetch(path)
    const data = await res.json()
    const graphData = treeToGraph(data)

    treeOptions.value = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          const name = params.data.name || ''
          const value = params.data.value ?? ''
          return `${name}${value ? ': ' + value : ''}`
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: graphData.nodes,
          links: graphData.links,
          orient: 'RL',
          symbolSize: 35,
          initialTreeDepth: 2,
          expandAndCollapse: true,
          animationDuration: 750,
          animationDurationUpdate: 750,
          roam: true,
          force: {
            repulsion: 200,
            edgeLength: [100, 200],
          },

          // Styling for internal nodes
          label: {
            position: 'left',
            align: 'right',
            verticalAlign: 'middle',
            color: '#1a1a1a',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            lineHeight: 1.4,
            hideOverlap: true,
          },

          lineStyle: {
            color: '#999',
            width: 5,
            curveness: 0.3,
          },

          // Optional: level-based spacing for better layout
          emphasis: {
            focus: 'adjacency',
            label: {
              show: true,
              fontWeight: 'bold',
              color: '#ff4500',
            },
            lineStyle: {
              width: 7,
              color: '#ff4500',
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

onMounted(() => loadTree(props.jsonPath))
</script>

<template>
  <div class="career-tree">
    <VChart
      v-if="treeOptions"
      :option="treeOptions"
      autoresize
      style="height: 700px; width: 100%"
      @click="onChartClick"
    />
    <p v-else class="text-gray-500 italic">Loading career path...</p>
  </div>
</template>

<style scoped>
.career-tree {
  padding: 1rem;
  background-color: #fafafa; /* subtle background */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
