import { FastifyRequest, FastifyReply } from 'fastify';

export default class ErrorMiddleware {
  static handle(error: any, request: FastifyRequest, reply: FastifyReply) {
    request.log.error({
      msg: '🚨 Error occurred',
      reqId: request.id,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: {
          'content-type': request.headers['content-type'],
          'user-agent': request.headers['user-agent']?.substring(0, 100),
          'x-api-key': request.headers['x-api-key'] ? '[PRESENT]' : '[MISSING]',
        },
        body: request.body
          ? JSON.stringify(request.body).substring(0, 500) + '...'
          : undefined,
      },
    });

    if (error.validation) {
      request.log.warn({
        msg: '📋 Validation error',
        reqId: request.id,
        validation: error.validation,
      });
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed.',
        details: error.validation,
      });
    }

    const IS_PRODUCTION = process.env.NODE_ENV === 'production';
    const message = IS_PRODUCTION ? 'Internal Server Error' : error.message;

    return reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || 'ServerError',
      message: message,
    });
  }
}
