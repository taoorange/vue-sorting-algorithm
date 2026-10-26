import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

/** 挂载根应用并注册路由 */
createApp(App).use(router).mount('#app')
