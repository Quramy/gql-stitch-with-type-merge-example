import { stitchSchemas } from '@graphql-tools/stitch'
import {
  wrapSchema,
  RemoveObjectFieldsWithDirective,
  PruneSchema,
} from '@graphql-tools/wrap'

import { loadSubSchemas } from './subSchemas'
import { createVerboseExecutor } from './verboseExecutor'

export async function createMergedSchema() {
  const { userServiceSchema, postServiceSchema } = await loadSubSchemas()

  const schema = stitchSchemas({
    mergeTypes: true,
    mergeDirectives: true,
    subschemas: [
      {
        schema: userServiceSchema,
        batch: true,
        merge: {
          // User: {
          //   fieldName: "user",
          //   selectionSet: "{ id }",
          //   args: ({ id }) => ({ id }),
          // },
          User: {
            canonical: true,
            selectionSet: '{ id }',
            fieldName: 'users',
            key: ({ id }) => id,
            argsFromKeys: (ids) => ({ ids }),
          },
        },
        executor: createVerboseExecutor(userServiceSchema, {
          serviceName: 'user-service',
        }),
      },
      {
        batch: true,
        schema: postServiceSchema,
        merge: {
          User: {
            selectionSet: '{ id }',
            fieldName: 'users',
            key: ({ id }) => id,
            argsFromKeys: (ids) => ({ ids }),
          },
        },
        executor: createVerboseExecutor(postServiceSchema, {
          serviceName: 'post-service',
        }),
      },
    ],
  })

  return wrapSchema({
    schema,
    transforms: [
      new RemoveObjectFieldsWithDirective('internal'),
      new PruneSchema(),
    ],
  })
}
