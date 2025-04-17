import './assets/main.css'
import 'quasar/src/css/index.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import App from './App.vue'
import router from './router'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, {})
app.use(router)

app.mount('#app')
