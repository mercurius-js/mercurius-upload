import fp from 'fastify-plugin'
import { processRequest, UploadOptions } from 'graphql-upload'

import type { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    isMultipart?: true
  }
}

const mercuriusGQLUpload: FastifyPluginCallback<UploadOptions> = (
  fastify,
  options = {},
  done
) => {
  fastify.addContentTypeParser('multipart', (req, _payload, done) => {
    req.isMultipart = true
    done(null)
  })

  fastify.addHook('preValidation', async function (request, reply) {
    if (!request.isMultipart) {
      return
    }

    request.body = await processRequest(request.raw, reply.raw, options)
  })

  done()
}

export default fp(mercuriusGQLUpload, {
  fastify: '>= 3.x',
  name: 'mercurius-upload',
})
