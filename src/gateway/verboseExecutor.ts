import { type GraphQLSchema, print } from 'graphql'

import { type Executor } from '@graphql-tools/utils'
import { isIncrementalResult, execute } from '@graphql-tools/executor'

function isPromiseLike(x: unknown): x is PromiseLike<any> {
  return !!x && typeof x === 'object' && 'then' in x
}

export function createVerboseExecutor(
  schema: GraphQLSchema,
  { serviceName }: { readonly serviceName: string },
) {
  if (process.env.NODE_ENV === 'test') return undefined
  const executor: Executor<{ __seq: number | undefined }> = async ({
    document,
    context,
    variables,
  }) => {
    const seq = context?.__seq ?? 0
    if (!seq && context) {
      console.log('Start sequence')
      context.__seq = 1
    } else if (context) {
      context.__seq = seq + 1
    }
    const log = (...args: any[]) =>
      console.log(`#${seq}: [${serviceName}]`, ...args)
    log('Start to exeute operation:')
    console.log(print(document))
    console.log(JSON.stringify(variables))
    console.log()
    const result = await execute({
      schema,
      document,
      variableValues: variables,
      contextValue: context,
    })
    if (isIncrementalResult(result)) {
      throw new Error()
    }
    log('End to exeute operation.')
    return result
  }
  return executor
}
