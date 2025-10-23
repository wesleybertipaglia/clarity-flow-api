import { FastifyInstance } from 'fastify';
import { ChatRouteSchema } from '../lib/schemas';
import AiController from '../controller/ai.controller';

const controller = new AiController();

export const aiRoutes = async (server: FastifyInstance) => {
  const handleChat = controller.handleChat.bind(controller);

  server.post(
    '/chat',
    {
      schema: ChatRouteSchema,
      preHandler: [
        async (request, _reply) => {
          request.log.info({
            msg: '📨 AI Chat route called',
            reqId: request.id,
            method: request.method,
            url: request.url,
            hasBody: !!request.body,
            bodySize: request.body ? JSON.stringify(request.body).length : 0,
          });
        },
      ],
    },
    handleChat
  );
};
