const BD_API = 'https://api.buttondown.com/v1'

function headers() {
  return {
    'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface SubscriberMeta {
  bookmarks: string[]
  readHistory: string[]
}

interface Subscriber {
  id: string
  email: string
  metadata: Partial<SubscriberMeta>
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const res = await fetch(`${BD_API}/subscribers?email=${encodeURIComponent(email)}`, {
    headers: headers(),
    next: { revalidate: 0 },
  })
  if (!res.ok) return null
  const data = await res.json()
  const subscriber = data.results?.[0] ?? null
  return subscriber
}

export async function setMetadata(id: string, metadata: Partial<SubscriberMeta>) {
  await fetch(`${BD_API}/subscribers/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ metadata }),
  })
}

export async function subscribeEmail(email: string) {
  await fetch(`${BD_API}/subscribers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email }),
  })
}

export function emptyMeta(): SubscriberMeta {
  return { bookmarks: [], readHistory: [] }
}
