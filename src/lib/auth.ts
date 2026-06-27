import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
)

export async function signMagicToken(email: string): Promise<string> {
  return new SignJWT({ sub: email, purpose: 'magic' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.purpose !== 'magic') return null
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

export async function signSession(email: string): Promise<string> {
  return new SignJWT({ sub: email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
