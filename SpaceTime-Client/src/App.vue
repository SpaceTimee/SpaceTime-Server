<template>
  <main>
    <h1>SpaceTime Server</h1>
    <p>绝赞建设中，可用功能：</p>
    <ul>
      <li><a href="/api/generate?domain=wikipedia.org">生成伪造规则</a> <code>/api/generate?[string]domain=wikipedia.org</code></li>
      <li><a href="/api/search?domain=wikipedia.org">搜索内置规则</a> <code>/api/search?[string]domain=wikipedia.org</code></li>
      <li><a href="/api/check">测试内置规则</a> <code>/api/check</code></li>
      <li><a href="/files/Cealing-Host.json">订阅内置规则</a> <code>/files/Cealing-Host.json</code></li>
      <li><a href="/files/nginx.conf">查看 Nginx 配置</a> <code>/files/nginx.conf</code></li>
    </ul>
    <p>0.2.2 by Space Time</p>
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
