<template>
  <main>
    <h1>欢迎你，SpaceTime Server 绝赞建设中</h1>
    <p>当前可使用的功能 :</p>
    <ul>
      <li>
        <a href="/api">/api: 开放接口</a>
        <ol>
          <li>
            <a href="/api/generate">/api/generate?[string]domain=wikipedia.org: 生成伪造规则</a>
          </li>
          <li><a href="/api/search">/api/search?[string]domain=wikipedia.org: 搜索内置规则</a></li>
          <li><a href="/api/check">/api/check: 测试内置规则</a></li>
          <li>
            <a href="/api/download"
              >/api/download/[string]file?[string]file=Cealing-Host.json&[string?]mime&[string?]name:
              下载指定文件</a
            >
          </li>
        </ol>
      </li>
      <li>
        <a href="/files">/files: 文件分发</a>
        <ol>
          <li><a href="/files/Cealing-Host.json">/files/Cealing-Host.json: Cealing Host (可订阅)</a></li>
          <li>
            <a href="/files/Cealing-Host-A.json">/files/Cealing-Host-A.json: Cealing Host A (可订阅)</a>
          </li>
          <li>
            <a href="/files/Cealing-Host-P.json">/files/Cealing-Host-P.json: Cealing Host P (可订阅)</a>
          </li>
        </ol>
      </li>
    </ul>
    <p>SpaceTime Server 0.1.5 by Space Time</p>
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
