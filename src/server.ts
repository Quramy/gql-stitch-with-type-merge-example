import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'

import { createMergedSchema } from './gateway/schema'

async function startServer() {
  const schema = await createMergedSchema()
  const yoga = createYoga({
    schema,
    graphiql: true,
  })

  // Pass it into a server to hook into request handlers.
  const server = createServer(yoga)

  // Start the server and you're done!
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

startServer()
