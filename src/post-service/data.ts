import { seed, rand, randPost } from '@ngneat/falso'
import { range, sortBy, compact } from 'lodash'

seed('seed')

export type PostData = {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly star: number
  readonly authorId: string
}

export type UserRefData = {
  readonly id: string
}

const postsData = range(100).map((i) => {
  const { title, body } = randPost()
  const star = rand(range(100))
  return {
    id: `post${i}` as string,
    title,
    body,
    star,
    authorId: `user${rand(range(10))}` as string,
  } as const satisfies PostData
})

const userPostRelations = postsData.map(
  ({ id, authorId }) => ({ postId: id, userId: authorId }) as const,
)

export async function getPopularPosts() {
  return sortBy(postsData, (p) => p.star)
    .reverse()
    .slice(0, 5)
}

export async function getPostById(id: string) {
  return postsData.find((p) => p.id === id) ?? null
}

export async function getPostsByIds(ids: readonly string[]) {
  return compact(ids.map(getPostById))
}

export async function getPostIdsByAuthorId(authorId: string) {
  return userPostRelations
    .filter((r) => r.userId === authorId)
    .map((r) => r.postId)
}
