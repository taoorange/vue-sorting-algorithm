<template>
  <div class="app-shell">
    <nav class="app-nav">
      <RouterLink class="app-nav-link" to="/sort">排序可视化</RouterLink>
    </nav>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
// 根壳：顶栏导航 + RouterView；具体业务页在 views/
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-nav {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.app-nav-link {
  font-size: 14px;
  color: var(--muted);
  text-decoration: none;
}

.app-nav-link.router-link-active {
  color: var(--btn-primary-bg);
  font-weight: 600;
}

.app-main {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
</style>
