import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { signMagicToken } from '@/lib/auth'
import { subscribeEmail } from '@/lib/buttondown'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://9min.ch'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const next = typeof body?.next === 'string' ? body.next : '/'

  // Subscribe to Buttondown (creates subscriber if not exists, no-ops if already subscribed)
  subscribeEmail(email).catch(() => {})

  // Stateless magic token — no storage needed
  const token = await signMagicToken(email)
  const magicUrl = `${SITE_URL}/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`

  const { error } = await resend.emails.send({
    from: 'noreply@9min.ch',
    to: email,
    subject: 'Ihr Zugang zu 9min',
    html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #D4D0C8;padding:40px;">
        <tr><td>
          <p style="font-family:Georgia,serif;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#D4A847;margin:0 0 24px;">9min.ch</p>
          <h1 style="font-family:Georgia,serif;font-weight:500;font-size:22px;color:#1A2E1A;margin:0 0 16px;line-height:1.3;">Ihr Anmeldelink</h1>
          <p style="font-family:Georgia,serif;font-size:15px;color:#4A5C4A;line-height:1.6;margin:0 0 32px;">Klicken Sie auf den Button, um sich anzumelden. Der Link ist 15 Minuten gültig.</p>
          <a href="${magicUrl}" style="display:inline-block;background:#1A2E1A;color:#fff;font-family:Georgia,serif;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:13px 28px;text-decoration:none;border-radius:2px;">Anmelden →</a>
          <p style="font-family:Georgia,serif;font-size:12px;color:#8A9C8A;margin:32px 0 0;line-height:1.5;">Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })

  if (error) {
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
