import { createApp } from 'vue'
import App from './App.vue'
// Add Buffer polyfill for browser environment
import { Buffer } from 'buffer'

// Make Buffer globally available for lv_font_conv library
window.Buffer = Buffer

createApp(App).mount('#app')
