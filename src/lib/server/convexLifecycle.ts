const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL

type CreateRequestInput = {
  mode: string
  locale: string
  input: string
  pillar?: string
  sub?: string
}

async function postConvex(path: string, payload: Record<string, unknown>) {
  if (!convexSiteUrl) return null
  try {
    const res = await fetch(`${convexSiteUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function createLifecycleRequest(
  payload: CreateRequestInput,
): Promise<string | null> {
  const data = (await postConvex('/ingest', payload)) as
    | { requestId?: string }
    | null
  return data?.requestId ?? null
}

export async function completeLifecycleRequest(
  requestId: string,
  response: string,
  provider: string,
): Promise<void> {
  await postConvex('/request/complete', { requestId, response, provider })
}

export async function failLifecycleRequest(
  requestId: string,
  error: string,
): Promise<void> {
  await postConvex('/request/fail', { requestId, error })
}
