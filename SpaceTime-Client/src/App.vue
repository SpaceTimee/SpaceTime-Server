<template>
  <main>
    <h1>SpaceTime Server</h1>
    <p>绝赞建设中，可用功能：</p>
    <ul>
      <li>
        <a href="/api/host/generate?domain=wikipedia.org">生成伪造规则</a>
        <code>/api/host/generate?[string]domain=wikipedia.org</code>
      </li>
      <li>
        <a href="/api/host/search?domain=wikipedia.org">搜索内置规则</a>
        <code>/api/host/search?[string]domain=wikipedia.org</code>
      </li>
      <li><a href="/api/host/check">测试内置规则</a> <code>/api/host/check</code></li>
      <li>
        <a href="/files/host/Cealing-Host.json">订阅内置规则</a>
        <code>/files/host/[string]path=Cealing-Host.json</code>
      </li>
      <li>
        <a href="/files/gallery/SpaceTime-Server-0.2.0.mp4">下载宣传物料</a>
        <code>/files/gallery/[string]path=SpaceTime-Server-0.2.0.mp4</code>
      </li>
      <li>
        <a href="/files/blog/atom.xml">订阅博客更新</a>
        <code>/files/blog/[string]path=atom.xml</code>
      </li>
    </ul>
    <p>0.3.5 by Space Time</p>
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
