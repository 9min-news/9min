import { cookies } from 'next/headers'
import { verifySession } from './auth'

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('9min_session')?.value
  if (!token) return null
  return verifySession(token)
}
