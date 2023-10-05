import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/post-service/__generated__/graphql.ts': {
      schema: 'src/post-service/typeDefs.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        immutableTypes: true,
        enumsAsConst: true,
        mappers: {
          Post: 'src/post-service/data#PostData',
          User: 'src/post-service/data#UserRefData',
        },
      },
    },
    'src/user-service/__generated__/graphql.ts': {
      schema: 'src/user-service/typeDefs.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        immutableTypes: true,
        enumsAsConst: true,
        mappers: {
          User: 'src/user-service/data#UserData',
        },
      },
    },
  },
}

export default config
