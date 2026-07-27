import { DurableObject } from 'cloudflare:workers'

type CensorCheckResult =
  { results: Record<string, number>; error?: never } | { error: string; results?: never }

type StoredSession = {
  expiresAt: number
  result?: CensorCheckResult
}

type WaitOutcome = CensorCheckResult | 'cancelled' | 'timeout'

const sessionKey = 'session'

const jsonResponse = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  })

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

const isCensorCheckResult = (value: unknown): value is CensorCheckResult => {
  if (!isPlainRecord(value)) return false

  const hasResults = Object.hasOwn(value, 'results')
  const hasError = Object.hasOwn(value, 'error')

  if (hasResults === hasError || Object.keys(value).length !== 1) return false
  if (hasError) return typeof value.error === 'string' && value.error.trim().length > 0
  if (!isPlainRecord(value.results)) return false

  return Object.entries(value.results).every(
    ([target, latency]) =>
      target.trim().length > 0 &&
      typeof latency === 'number' &&
      Number.isInteger(latency) &&
      latency >= 0 &&
      latency <= 2_147_483_647
  )
}

const isSameResult = (currentResult: CensorCheckResult, incomingResult: CensorCheckResult) => {
  if (currentResult.error !== undefined || incomingResult.error !== undefined)
    return currentResult.error === incomingResult.error

  const currentEntries = Object.entries(currentResult.results)

  return (
    currentEntries.length === Object.keys(incomingResult.results).length &&
    currentEntries.every(
      ([target, latency]) =>
        Object.hasOwn(incomingResult.results, target) && incomingResult.results[target] === latency
    )
  )
}

const outcomeResponse = (outcome: WaitOutcome) => {
  if (outcome === 'timeout')
    return jsonResponse({ error: 'Gateway Timeout', message: 'Censor check timed out' }, 504)

  if (outcome === 'cancelled')
    return jsonResponse({ error: 'Workflow Error', message: 'Censor check was cancelled' }, 502)

  if (outcome.error !== undefined) return jsonResponse({ error: 'Censor Error', message: outcome.error }, 502)

  return jsonResponse(outcome.results)
}

export class CensorSession extends DurableObject {
  readonly #waiters = new Set<{
    resolve: (outcome: WaitOutcome) => void
    timeoutId: number
  }>()

  async start() {
    if ((await this.ctx.storage.get(sessionKey)) !== undefined)
      return jsonResponse({ error: 'Conflict', message: 'Censor check already started' }, 409)

    const expiresAt = Date.now() + 15 * 60_000

    await Promise.all([
      this.ctx.storage.put<StoredSession>(sessionKey, { expiresAt }),
      this.ctx.storage.setAlarm(expiresAt)
    ])

    return new Response(null, { status: 204 })
  }

  async wait() {
    const session = await this.ctx.storage.get<StoredSession>(sessionKey)

    if (session === undefined)
      return jsonResponse({ error: 'Not Found', message: 'Censor check not found' }, 404)
    if (session.result !== undefined) return outcomeResponse(session.result)

    const remainingMilliseconds = session.expiresAt - Date.now()

    if (remainingMilliseconds <= 0) return outcomeResponse(await this.#expireSession())

    const { promise, resolve } = Promise.withResolvers<WaitOutcome>()

    this.#waiters.add({
      resolve,
      timeoutId: setTimeout(() => {
        void this.#expireSession().catch(() => this.#resolveWaiters('timeout'))
      }, remainingMilliseconds)
    })

    return outcomeResponse(await promise)
  }

  async complete(censorCheckResult: CensorCheckResult) {
    if (!isCensorCheckResult(censorCheckResult))
      return jsonResponse({ error: 'Bad Request', message: 'Invalid censor result' }, 400)

    const session = await this.ctx.storage.get<StoredSession>(sessionKey)

    if (session === undefined)
      return jsonResponse({ error: 'Not Found', message: 'Censor check not found' }, 404)

    if (session.result !== undefined)
      return isSameResult(session.result, censorCheckResult)
        ? new Response(null, { status: 204 })
        : jsonResponse({ error: 'Conflict', message: 'Censor check already has a different result' }, 409)

    if (session.expiresAt <= Date.now()) {
      await this.#expireSession()
      return jsonResponse({ error: 'Not Found', message: 'Censor check expired' }, 404)
    }

    await this.ctx.storage.put<StoredSession>(sessionKey, { ...session, result: censorCheckResult })
    this.#resolveWaiters(censorCheckResult)

    return new Response(null, { status: 204 })
  }

  async cancel() {
    await this.#clearSession()
    this.#resolveWaiters('cancelled')

    return new Response(null, { status: 204 })
  }

  override async alarm() {
    await this.#expireSession()
  }

  async #expireSession() {
    const outcome = (await this.ctx.storage.get<StoredSession>(sessionKey))?.result ?? 'timeout'

    await this.#clearSession()
    this.#resolveWaiters(outcome)

    return outcome
  }

  #clearSession() {
    return this.ctx.storage.deleteAll()
  }

  #resolveWaiters(outcome: WaitOutcome) {
    for (const waiter of this.#waiters) {
      clearTimeout(waiter.timeoutId)
      waiter.resolve(outcome)
    }

    this.#waiters.clear()
  }
}

export default {
  fetch: () => jsonResponse({ error: 'Not Found', message: 'This Worker has no public routes' }, 404)
} satisfies ExportedHandler<Env>
