<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import CareerTree from '@/components/CareerTree.vue'
import CareerGraph from '@/components/CareerGraph.vue'
import { useQualificationStore } from '@/stores/qualificationStore'

const selectedDepartment = ref('')
const active = ref(0)
const departments = ref([
  { name: 'None', value: '' }, //TODO - Remove Tree on value none
  { name: 'Finance & Accounting', value: 'finance' },
  { name: 'Human Resources Development & Administration', value: 'hr' },
  { name: 'Logistics & Marketing', value: 'logistics' },
  { name: 'Refinery Production', value: 'refinery' },
  { name: 'Reliability & Maintenance', value: 'maintenance' },
  { name: 'Safety, Environment & Quality', value: 'safety' },
  { name: 'Strategic Planning & Business Support', value: 'strategic' },
])

watch(selectedDepartment, () => {
  console.log('Selected department:', selectedDepartment.value)
})

const path = computed(() => {
  return selectedDepartment.value ? `/json/${selectedDepartment.value}.json` : ''
})
</script>

<template>
  <Select
    v-model="selectedDepartment"
    :options="departments"
    optionLabel="name"
    optionValue="value"
    placeholder="Select a department"
    class="w-full md:w-56"
  ></Select>

  <div class="flex mb-2 gap-2 justify-content-end">
    <Button
      @click="active = 0"
      rounded
      label="1"
      class="w-2rem h-2rem p-0"
      :outlined="active !== 0"
    />
    <Button
      @click="active = 1"
      rounded
      label="2"
      class="w-2rem h-2rem p-0"
      :outlined="active !== 1"
    />
  </div>

  <TabView :activeIndex="active">
    <TabPanel header="Tree View">
      <CareerTree :jsonPath="path" />
    </TabPanel>
    <TabPanel header="Graph View">
      <CareerGraph :jsonPath="path" />
    </TabPanel>
  </TabView>
</template>
