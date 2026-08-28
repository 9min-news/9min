import { TwitterApi } from 'twitter-api-v2'

export function getXClient(accessToken: string) {
  return new TwitterApi(accessToken)
}

export function buildAuthUrl(callbackUrl: string): { url: string; codeVerifier: string; state: string } {
  const clientId = process.env.X_API_CLIENT_ID
  if (!clientId) throw new Error('X_API_CLIENT_ID not set')

  const client = new TwitterApi({ clientId, clientSecret: process.env.X_API_CLIENT_SECRET })
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(callbackUrl, {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'note.write'],
  })
  return { url, codeVerifier, state }
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
  callbackUrl: string
): Promise<{ accessToken: string; refreshToken: string | undefined }> {
  const clientId = process.env.X_API_CLIENT_ID
  const clientSecret = process.env.X_API_CLIENT_SECRET
  if (!clientId) throw new Error('X_API_CLIENT_ID not set')

  const client = new TwitterApi({ clientId, clientSecret })
  const { accessToken, refreshToken } = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackUrl,
  })
  return { accessToken, refreshToken }
}

export async function postTweet(text: string): Promise<string> {
  const accessToken = process.env.X_ACCESS_TOKEN
  if (!accessToken) throw new Error('X_ACCESS_TOKEN not set')
  const client = getXClient(accessToken)
  const tweet = await client.v2.tweet(text)
  return tweet.data.id
}

export async function postArticle(title: string, markdownContent: string): Promise<{ tweetId: string }> {
  const accessToken = process.env.X_ACCESS_TOKEN
  if (!accessToken) throw new Error('X_ACCESS_TOKEN nicht gesetzt')
  const client = getXClient(accessToken)
  // Post as X Article (Note Tweet) — appears as long-form card in feed
  // tweet.text is the short preview; note_tweet.text is the full article content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tweet = await client.v2.tweet({
    text: title.slice(0, 280),
    note_tweet: { text: markdownContent },
  } as any)
  return { tweetId: tweet.data.id }
}
