import type { EndpointInfo } from './types'

export const endpoints = [
  {
    name: '生成伪造规则',
    method: 'GET',
    path: '/api/host/generate?[string]domain=wikipedia.org',
    href: '/api/host/generate?domain=wikipedia.org'
  },
  {
    name: '搜索内置规则',
    method: 'GET',
    path: '/api/host/search?[string]domain=wikipedia.org',
    href: '/api/host/search?domain=wikipedia.org'
  },
  {
    name: '测试内置规则',
    method: 'GET',
    path: '/api/host/check',
    href: '/api/host/check'
  },
  {
    name: '透传代理请求',
    method: 'ANY',
    path: '/api/prox/forward/[string]?[any]',
    href: '/api/prox/forward/'
  },
  {
    name: '订阅内置规则',
    method: 'GET',
    path: '/files/host/[string]=Cealing-Host.json',
    href: '/files/host/Cealing-Host.json'
  },
  {
    name: '下载宣传物料',
    method: 'GET',
    path: '/files/gallery/[string]=SpaceTime-Server-0.2.0.mp4',
    href: '/files/gallery/SpaceTime-Server-0.2.0.mp4'
  },
  {
    name: '订阅主页更新',
    method: 'GET',
    path: '/files/center/[string]=atom.xml',
    href: '/files/center/atom.xml'
  },
  {
    name: '订阅博客更新',
    method: 'GET',
    path: '/files/blog/[string]=atom.xml',
    href: '/files/blog/atom.xml'
  },
  {
    name: '订阅文档更新',
    method: 'GET',
    path: '/files/docs/[string]=atom.xml',
    href: '/files/docs/atom.xml'
  },
  {
    name: '订阅端点更新',
    method: 'GET',
    path: '/files/server/[string]=atom.xml or /atom.xml',
    href: '/atom.xml'
  },
  {
    name: '连接 MCP 服务',
    method: 'POST',
    path: '/mcp',
    href: '/mcp'
  }
] as const satisfies readonly EndpointInfo[]
