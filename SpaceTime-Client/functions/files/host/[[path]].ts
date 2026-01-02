import { onRequest as baseOnRequest } from '../[[path]]'

export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const pathSegments = context.params.path as string[] | undefined

  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf'
  }

  return baseOnRequest({
    ...context,
    params: {
      ...context.params,
      path: ['host', ...(pathSegments || [])]
    },
    data: {
      targetUrl: fileMap[pathSegments?.join('/') || 'Cealing-Host.json']
    }
  })
}
