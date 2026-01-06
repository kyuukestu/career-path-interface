import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'

import ECharts from 'vue-echarts'
import 'echarts/lib/chart/tree'
import 'echarts/lib/chart/graph'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
  },
})
app.component('v-chart', ECharts)
app.mount('#app')
