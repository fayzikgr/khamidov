import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { i18n } from './i18n'
import SpotlightButton from './components/SpotlightButton.vue'

const app = createApp(App)
app.component('SpotlightButton', SpotlightButton)

app.use(router)
   .use(i18n) // ← ВАЖНО: до mount
   .mount('#app')