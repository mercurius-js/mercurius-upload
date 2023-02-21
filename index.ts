import * as util from 'util';
import stream from 'stream';
import fp from 'fastify-plugin'
import processRequest, {
  ProcessRequestOptions,
} from 'graphql-upload/processRequest.js'

const finishedStream = util.promisify(stream.finished);

import type { FastifyPluginCallback } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    mercuriusUploadMultipart?: true
  }
}

const mercuriusGQLUpload: FastifyPluginCallback<ProcessRequestOptions> = (
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

  fastify.addHook('onSend', async function (request) {
    if (!request.mercuriusUploadMultipart) {
      return
    }

    await finishedStream(request.raw)
  })

  done()
}

export const mercuriusUpload = fp(mercuriusGQLUpload, {
  fastify: '>= 4.x',
  name: 'mercurius-upload',
})

export default mercuriusUpload
