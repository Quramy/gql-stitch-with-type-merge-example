import path from 'node:path'
import fs from 'node:fs/promises'

import { makeExecutableSchema } from '@graphql-tools/schema'
import type { IResolvers } from '@graphql-tools/utils'

import { resolvers as userServiceResolvers } from '../user-service/resolvers'
import { resolvers as postServiceResolvers } from '../post-service/resolvers'

async function loadSubSchema(typeDefsPath: string, resolvers: IResolvers) {
  const typeDefs = await fs.readFile(typeDefsPath, 'utf8')
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  return schema
}

export async function loadSubSchemas() {
  const [userServiceSchema, postServiceSchema] = await Promise.all([
    loadSubSchema(
      path.join(__dirname, '../user-service/typeDefs.graphql'),
      userServiceResolvers,
    ),
    loadSubSchema(
      path.join(__dirname, '../post-service/typeDefs.graphql'),
      postServiceResolvers,
    ),
  ])

  return {
    userServiceSchema,
    postServiceSchema,
  }
}
