const BASE = 'https://api.github.com'

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function headers() {
  const token = process.env.GITHUB_TOKEN ?? process.env.GITHUB_PAT
  if (!token) throw new Error('GITHUB_TOKEN (or GITHUB_PAT) not set')
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

function repo() {
  const r = process.env.GITHUB_REPO
  if (!r) throw new Error('GITHUB_REPO not set')
  return r
}

interface GithubFileResponse {
  sha: string
  content: string
  encoding: string
}

export async function getFile(path: string): Promise<{ sha: string; content: string } | null> {
  const res = await fetch(`${BASE}/repos/${repo()}/contents/${path}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub getFile ${path}: ${res.status}`)
  const data: GithubFileResponse = await res.json()
  const content = decodeBase64(data.content)
  return { sha: data.sha, content }
}

export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: encodeBase64(content),
  }
  if (sha) body.sha = sha
  const res = await fetch(`${BASE}/repos/${repo()}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub putFile ${path}: ${res.status} ${err}`)
  }
}

export async function deleteFile(path: string, sha: string, message: string): Promise<void> {
  const res = await fetch(`${BASE}/repos/${repo()}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ message, sha }),
  })
  if (!res.ok && res.status !== 404) {
    const err = await res.text()
    throw new Error(`GitHub deleteFile ${path}: ${res.status} ${err}`)
  }
}
