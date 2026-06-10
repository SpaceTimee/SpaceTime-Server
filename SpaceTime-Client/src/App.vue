<script setup lang="ts">
import { endpoints } from '@/endpoints'
</script>

<template>
  <main>
    <h1>SpaceTime Server</h1>
    <p>绝赞建设中，可用功能：</p>
    <ul>
      <li v-for="endpoint in endpoints" :key="endpoint.name">
        <a :href="endpoint.href">{{ endpoint.name }}</a>
        <code>{{ endpoint.method }} {{ endpoint.path }}</code>
      </li>
    </ul>
    <p>0.4.1 by Space Time</p>
  </main>
</template>

<style scoped lang="less">
h1 {
  text-align: center;
}

li {
  margin-top: 0.5rem;
}
</style>
