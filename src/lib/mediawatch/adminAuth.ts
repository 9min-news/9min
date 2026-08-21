import { SignJWT, jwtVerify } from 'jose'

function getSecret() {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) throw new Error('ADMIN_PASSWORD env var not set')
  return new TextEncoder().encode(`mw-admin:${pw}`)
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ sub: 'admin', purpose: 'mw' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.purpose === 'mw'
  } catch {
    return false
  }
}
