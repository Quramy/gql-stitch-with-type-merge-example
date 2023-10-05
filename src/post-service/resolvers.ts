import type { Resolvers } from './__generated__/graphql'
import {
  getPopularPosts,
  getPostById,
  getPostsByIds,
  getPostIdsByAuthorId,
} from './data'

export const resolvers = {
  Post: {
    author: ({ authorId }) => {
      return {
        id: authorId,
      }
    },
  },
  User: {
    posts: async ({ id }) => {
      const postIds = await getPostIdsByAuthorId(id)
      return postIds.map((id) => ({ id }))
    },
  },
  Query: {
    popularPosts: async () => {
      const posts = await getPopularPosts()
      return posts
    },
    post: async (_, { id }) => {
      return getPostById(id)
    },
    posts: async (_, { ids }) => {
      return getPostsByIds(ids)
    },
    users: async (_, { ids }) => {
      return ids.map((id) => ({ id }))
    },
  },
} as const satisfies Resolvers
