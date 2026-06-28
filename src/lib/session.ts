import { headers } from 'next/headers'

export async function getSession(): Promise<string | null> {
  const h = await headers()
  return h.get('x-user-email')
}
