import { onRequest as baseOnRequest } from '../[[path]]'

export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const pathSegments = context.params.path as string[] | undefined

  return baseOnRequest({
    ...context,
    params: {
      ...context.params,
      path: ['server', ...(pathSegments || [])]
    },
    data: {
      targetUrl: `${new URL(context.request.url).origin}/${pathSegments?.join('/') || 'atom.xml'}`
    }
  })
}
