import fp from 'fastify-plugin'
import { processRequest, UploadOptions } from 'graphql-upload'

import type { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    mercuriusUploadMultipart?: true
  }
}

const mercuriusGQLUpload: FastifyPluginCallback<UploadOptions> = (
  fastify,
  options,
  done
) => {
  fastify.addContentTypeParser('multipart', (req, _payload, done) => {
    req.mercuriusUploadMultipart = true
    done(null)
  })

  fastify.addHook('preValidation', async function (request, reply) {
    if (!request.mercuriusUploadMultipart) {
      return
    }

    request.body = await processRequest(request.raw, reply.raw, options)
  })

  done()
}

export const mercuriusUpload = fp(mercuriusGQLUpload, {
  fastify: '>= 3.x',
  name: 'mercurius-upload',
})

export default mercuriusUpload
