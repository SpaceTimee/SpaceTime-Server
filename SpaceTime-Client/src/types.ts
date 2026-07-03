export type EndpointMethod = 'ANY' | 'GET' | 'POST'

export type EndpointInfo = {
  readonly name: string
  readonly method: EndpointMethod
  readonly path: string
  readonly href: string
}
