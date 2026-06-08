const protocolVersion = '2025-03-26'
const serverInfo = { name: 'SpaceTime Server', version: '0.3.10' }
const toolsInfo = [
  {
    name: 'generate_host',
    description:
      'Generate a Cealing Host rule for a domain. Returns a JSON array containing domain patterns and the resolved IP address',
    inputSchema: {
      properties: {
        domain: { type: 'string', description: 'Domain name to resolve (default: wikipedia.org)' }
      }
    },
    annotations: {
      title: 'Generate Host',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  {
    name: 'search_host',
    description: 'Search the built-in Cealing Host for a domain. Returns the matching rule entry if found',
    inputSchema: {
      properties: {
        domain: { type: 'string', description: 'Domain name to search for (default: wikipedia.org)' }
      }
    },
    annotations: { title: 'Search Host', readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: 'check_host',
    description:
      'Check the latest availability result for the built-in Cealing Host. Returns a plain text report',
    inputSchema: {
      properties: {}
    },
    annotations: { title: 'Check Host', readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: 'forward_proxy',
    description:
      'Forward an HTTP request through the Ona Prox proxy server to a target URL path. Returns the response body as text',
    inputSchema: {
      properties: {
        url: {
          type: 'string',
          description: 'Target URL path to forward the request to (default: i.pximg.net)'
        },
        method: { type: 'string', description: 'HTTP method (default: GET)' },
        body: { type: 'string', description: 'Request body' }
      }
    },
    annotations: { title: 'Forward Proxy', openWorldHint: true }
  },
  {
    name: 'get_file',
    description:
      'Get a file from SpaceTime Server storage. Returns text content directly or a download URL for binary files',
    inputSchema: {
      properties: {
        path: {
          type: 'string',
          description: 'File path (e.g. host/Cealing-Host.json, center/atom.xml, blog/atom.xml)'
        }
      },
      required: ['path']
    },
    annotations: { title: 'Get File', readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  }
]

export const onRequest = async ({ request }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'POST') return json(error(null, -32000, 'Method Not Allowed: Use POST'), 405)

  if (!request.headers.get('content-type')?.includes('application/json'))
    return json(error(null, -32000, 'Unsupported Media Type: Use application/json'), 415)

  const body = await request.json().catch(() => undefined)
  if (body === undefined) return json(error(null, -32700, 'Parse Error'), 400)

  const origin = new URL(request.url).origin
  const isBatch = Array.isArray(body)
  const responses = (
    await Promise.all(
      (isBatch ? (body as unknown[]) : [body]).map(async (msg) => {
        if (
          !msg ||
          typeof msg !== 'object' ||
          Array.isArray(msg) ||
          (msg as { jsonrpc?: string }).jsonrpc !== '2.0'
        )
          return error(null, -32600, 'Invalid Request')

        const { id, method, params } = msg as {
          id?: unknown
          method?: string
          params?: Record<string, unknown>
        }

        if (id === undefined) return null

        switch (method) {
          case 'initialize':
            return result(id, {
              protocolVersion,
              capabilities: { tools: {} },
              serverInfo
            })

          case 'ping':
            return result(id, {})

          case 'tools/list':
            return result(id, {
              tools: toolsInfo.map((tool) => ({
                ...tool,
                inputSchema: { type: 'object', ...tool.inputSchema }
              }))
            })

          case 'tools/call': {
            const name = params?.name as string | undefined
            if (!name) return error(id, -32602, 'Invalid Params: Tool name required')
            if (!toolsInfo.some((tool) => tool.name === name))
              return error(id, -32602, `Invalid Params: Unknown tool '${name}'`)

            try {
              const text = await callTool(name, (params?.arguments as Record<string, unknown>) ?? {}, origin)
              return result(id, { content: [{ type: 'text', text }] })
            } catch (err) {
              return result(id, {
                content: [
                  { type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }
                ],
                isError: true
              })
            }
          }

          default:
            return error(id, -32601, `Method Not Found: Unknown method ${method}`)
        }
      })
    )
  ).filter((response) => response !== null)

  return responses.length === 0
    ? new Response(null, { status: 202 })
    : json(isBatch ? responses : responses[0])
}

const callTool = async (name: string, args: Record<string, unknown>, origin: string) => {
  switch (name) {
    case 'generate_host':
    case 'search_host': {
      const action = name === 'generate_host' ? 'generate' : 'search'
      return await (
        await fetch(
          `${origin}/api/host/${action}?domain=${encodeURIComponent(String(args.domain ?? 'wikipedia.org'))}`
        )
      ).text()
    }
    case 'check_host':
      return await (await fetch(`${origin}/api/host/check`)).text()
    case 'forward_proxy': {
      const method = String(args.method ?? 'GET').toUpperCase()
      return await (
        await fetch(`${origin}/api/prox/forward/${String(args.url ?? '')}`, {
          method,
          body: method !== 'GET' && method !== 'HEAD' ? (args.body as string | undefined) : undefined
        })
      ).text()
    }
    case 'get_file': {
      const path = String(args.path ?? '')
      const response = await fetch(`${origin}/files/${path}`)

      if (!response.ok) return `Error: ${response.status} ${response.statusText}`

      return /text\/|json|xml|javascript|ecmascript|toml|sql|rtf|subrip|perl|php|dart|\/x-c?sh(?!\w)/.test(
        response.headers.get('content-type') ?? ''
      )
        ? await response.text()
        : `Download URL: ${origin}/files/${path}`
    }
    default:
      throw new Error(`Unknown tool ${name}`)
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const error = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message }
})
const result = (id: unknown, data: unknown) => ({ jsonrpc: '2.0', id, result: data })
