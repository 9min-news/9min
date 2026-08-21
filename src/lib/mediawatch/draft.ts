import { getFile, putFile, deleteFile } from './github'

export type DraftStatus = 'extracted' | 'draft' | 'review' | 'published' | 'discarded'

export interface Draft {
  id: string
  sourceUrl: string
  quelle: string
  originalTitle: string
  title: string
  markdown: string
  status: DraftStatus
  createdAt: string
  updatedAt: string
  publishedUrl?: string
  xPostId?: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
}

function draftPath(id: string) {
  return `data/mediawatch/drafts/${id}.json`
}

function newId() {
  return `mw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export async function createDraft(fields: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Promise<Draft> {
  const now = new Date().toISOString()
  const draft: Draft = { id: newId(), createdAt: now, updatedAt: now, ...fields }
  await putFile(draftPath(draft.id), JSON.stringify(draft, null, 2), `mediawatch: create draft ${draft.id}`)
  return draft
}

export async function getDraft(id: string): Promise<Draft | null> {
  const file = await getFile(draftPath(id))
  if (!file) return null
  return JSON.parse(file.content) as Draft
}

export async function updateDraft(id: string, patch: Partial<Draft>): Promise<Draft> {
  const file = await getFile(draftPath(id))
  if (!file) throw new Error(`Draft ${id} not found`)
  const current = JSON.parse(file.content) as Draft
  const updated: Draft = { ...current, ...patch, id, updatedAt: new Date().toISOString() }
  await putFile(draftPath(id), JSON.stringify(updated, null, 2), `mediawatch: update draft ${id}`, file.sha)
  return updated
}

export async function deleteDraft(id: string): Promise<void> {
  const file = await getFile(draftPath(id))
  if (!file) return
  await deleteFile(draftPath(id), file.sha, `mediawatch: delete draft ${id}`)
}

export async function listDrafts(): Promise<Draft[]> {
  // List directory via GitHub tree API to find all draft files
  const token = process.env.GITHUB_TOKEN
  const repoName = process.env.GITHUB_REPO
  if (!token || !repoName) return []

  const res = await fetch(
    `https://api.github.com/repos/${repoName}/git/trees/HEAD?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return []

  interface TreeItem { path: string; type: string }
  const { tree } = await res.json() as { tree: TreeItem[] }
  const draftFiles = tree
    .filter((item) => item.path.startsWith('data/mediawatch/drafts/') && item.path.endsWith('.json'))
    .map((item) => item.path)

  const drafts = await Promise.all(
    draftFiles.map(async (path) => {
      const file = await getFile(path)
      if (!file) return null
      return JSON.parse(file.content) as Draft
    })
  )

  return drafts
    .filter(Boolean)
    .sort((a, b) => new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime()) as Draft[]
}
