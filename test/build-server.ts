import fastify from 'fastify'
import GQL from 'mercurius'
import { GraphQLUpload } from 'graphql-upload'
import mercuriusGQLUpload from '../index'

const schema = /* GraphQL */ `
  scalar Upload
  type Query {
    add(x: Int, y: Int): Int
  }
  type Mutation {
    uploadImage(image: Upload): String
  }
`

export function build() {
  const app = fastify()

  app.register(mercuriusGQLUpload)

  app.register(GQL, {
    schema,
    resolvers: {
      Upload: GraphQLUpload,
      Query: {
        add: async (_, { x, y }) => {
          return x + y
        },
      },
      Mutation: {
        uploadImage: async (_: unknown, { image }) => {
          const { createReadStream } = await image
          const rs = createReadStream()

          let data = ''

          for await (const chunk of rs) {
            data += chunk
          }

          return data
        },
      },
    },
  })

  app.get('/', async (_request, _reply) => {
    return { hello: 'world' }
  })

  return app
}
