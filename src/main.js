import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PixelUI, { registerPaintWorklets } from '@mmt817/pixel-ui/dist/es/index.js'
import '@mmt817/pixel-ui/dist/index.css'

registerPaintWorklets()
const app = createApp(App)
app.use(PixelUI)
app.mount('#app')
