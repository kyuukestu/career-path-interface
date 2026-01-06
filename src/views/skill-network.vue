<script setup lang="ts">
import { ref } from 'vue'

//TODO - Tag System for Skills, use to weigh skill overlap on jobs

const graphOptions = ref({
  tooltip: { formatter: '{b}: {c}% skill overlap' },
  series: [
    {
      type: 'graph',
      layout: 'force',
      roam: true,
      label: { show: true },
      force: { repulsion: 200 },
      data: [
        { name: 'Data Analyst', value: 100, symbolSize: 60, itemStyle: { color: '#4CAF50' } },
        { name: 'Business Analyst', value: 70, symbolSize: 40 },
        { name: 'Data Scientist', value: 60, symbolSize: 50 },
        { name: 'BI Developer', value: 50, symbolSize: 35 },
      ],
      links: [
        { source: 'Data Analyst', target: 'Business Analyst', value: 70 },
        { source: 'Data Analyst', target: 'Data Scientist', value: 60 },
        { source: 'Data Analyst', target: 'BI Developer', value: 50 },
      ],
      lineStyle: { width: 2, curveness: 0.2 },
    },
  ],
})
</script>

<template>
  <v-chart :option="graphOptions" autoresize style="height: 600px" />
</template>
