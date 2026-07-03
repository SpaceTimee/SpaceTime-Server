import { onRequest as baseOnRequest } from '../[[path]]'

export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const pathSegments = context.params.path as string[] | undefined

  return baseOnRequest({
    ...context,
    params: {
      ...context.params,
      path: ['docs', ...(pathSegments ?? [])]
    },
    data: {
      targetUrl: `${context.env.DOCS_URL || 'http://localhost'}/${pathSegments?.join('/') || 'atom.xml'}`
    }
  })
}
