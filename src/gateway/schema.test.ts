import { graphql, print, type DocumentNode } from 'graphql'
import { gql } from 'graphql-tag'
import { addMocksToSchema } from '@graphql-tools/mock'
import { execute, isIncrementalResult } from '@graphql-tools/executor'
import { loadFiles } from '@graphql-tools/load-files'
import { makeExecutableSchema } from '@graphql-tools/schema'

import type { Resolvers as UserServiceResolvers } from '../user-service/__generated__/graphql'
import type { Resolvers as PostServiceResolvers } from '../post-service/__generated__/graphql'
import { createMergedSchema } from './schema'

const userQueryMock = jest
  .fn<UserServiceResolvers['Query'], []>()
  .mockReturnValue({})
const postQueryMock = jest
  .fn<PostServiceResolvers['Query'], []>()
  .mockReturnValue({})

jest.mock('./subSchemas', () => {
  return {
    loadSubSchemas: async () => {
      const userTypeDefs = await loadFiles('src/user-service/typeDefs.graphql')
      const userServiceSchema = makeExecutableSchema({ typeDefs: userTypeDefs })

      const postTypeDefs = await loadFiles('src/post-service/typeDefs.graphql')
      const postServiceSchema = makeExecutableSchema({ typeDefs: postTypeDefs })

      return {
        userServiceSchema: addMocksToSchema<UserServiceResolvers>({
          schema: userServiceSchema,
          resolvers: {
            Query: userQueryMock(),
          },
        }),
        postServiceSchema: addMocksToSchema<PostServiceResolvers>({
          schema: postServiceSchema,
          resolvers: {
            Query: postQueryMock(),
          },
        }),
      }
    },
  } satisfies typeof import('./subSchemas')
})

describe('gateway schema', () => {
  beforeEach(() => {
    userQueryMock.mockClear()
    postQueryMock.mockClear()
  })

  describe('leraning stitching with type merge', () => {
    test('merge postService result into userService result', async () => {
      userQueryMock.mockReturnValue({
        user: () => ({ id: 'test_user' }),
      })
      postQueryMock.mockReturnValue({
        users: () => [{ id: 'test_usre', posts: [{ id: 'test_post' }] }],
      })

      const query = gql`
        fragment FieldsFromPostService on User {
          posts {
            id
          }
        }

        query {
          user(id: "test_user") {
            id
            ...FieldsFromPostService
          }
        }
      `
      const { data } = await subject(query)
      expect(data).toMatchObject({ user: { posts: [{ id: 'test_post' }] } })
    })

    test('merge userService result into postService result', async () => {
      postQueryMock.mockReturnValue({
        popularPosts: () => [
          { id: 'test_post1', author: { id: 'test_user1' } },
          { id: 'test_post2', author: { id: 'test_user2' } },
          { id: 'test_post3', author: { id: 'test_user1' } },
        ],
      })

      userQueryMock.mockReturnValue({
        users: () => [
          { id: 'test_user1', name: 'user 1' },
          { id: 'test_user2', name: 'user 2' },
        ],
      })

      const query = gql`
        fragment FieldsFromUserService on User {
          name
        }

        query {
          popularPosts {
            id
            author {
              ...FieldsFromUserService
            }
          }
        }
      `
      const { data } = await subject(query)
      expect(data).toMatchObject({
        popularPosts: [
          { author: { name: 'user 1' } },
          { author: { name: 'user 2' } },
          { author: { name: 'user 1' } },
        ],
      })
    })
  })
})

async function subject(document: DocumentNode) {
  const schema = await createMergedSchema()
  return await graphql({ schema, source: print(document) })
}
