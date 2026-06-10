import { onRequest as baseOnRequest } from '../[[path]]'

export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const pathSegments = context.params.path as string[] | undefined

  return baseOnRequest({
    ...context,
    params: {
      ...context.params,
      path: ['status', ...(pathSegments || [])]
    },
    data: {
      targetUrl: `${context.env.STATUS_URL || 'http://localhost'}/${pathSegments?.join('/') || 'feed.rss'}`
    }
  })
}
