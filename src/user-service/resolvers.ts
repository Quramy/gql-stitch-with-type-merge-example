import type { Resolvers } from './__generated__/graphql'
import { getUserById, getUsersByIds } from './data'

export const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await getUserById(id)
    },
    users: async (_, { ids }) => {
      return await getUsersByIds(ids)
    },
  },
} satisfies Resolvers
