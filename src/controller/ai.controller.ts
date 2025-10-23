import { FastifyRequest, FastifyReply } from 'fastify';
import { ChatRouteBody } from '../lib/schemas';
import { handleChatWithGenkit } from '../ai/chat/chat.flow';

export default class AiController {
  async handleChat(
    req: FastifyRequest<{ Body: ChatRouteBody }>,
    res: FastifyReply
  ) {
    const apiKey = req.headers['x-api-key'] as string;

    req.log.info({
      msg: '🤖 AI Chat request received',
      reqId: req.id,
      question:
        req.body.question?.substring(0, 100) +
        (req.body.question?.length > 100 ? '...' : ''),
      hasApiKey: !!apiKey,
      action: req.body.action,
      type: req.body.type,
      context: {
        hasUser: !!req.body.context?.user,
        userRole: req.body.context?.user?.role,
        userDepartment: req.body.context?.user?.department,
        companies: req.body.context?.companies?.length || 0,
        employees: req.body.context?.employees?.length || 0,
        tasks: req.body.context?.tasks?.length || 0,
        sales: req.body.context?.sales?.length || 0,
        appointments: req.body.context?.appointments?.length || 0,
      },
      headers: {
        'x-api-key': apiKey ? '[PRESENT]' : '[MISSING]',
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']?.substring(0, 50),
      },
    });

    try {
      const dto = { ...req.body, apiKey };
      req.log.debug({
        msg: '🔍 Processing chat request',
        reqId: req.id,
        dtoKeys: Object.keys(dto),
        questionLength: req.body.question?.length,
        contextSize: JSON.stringify(req.body.context).length,
      });

      const result = await handleChatWithGenkit(dto);

      req.log.info({
        msg: '✅ AI Chat response sent',
        reqId: req.id,
        responseType: typeof result,
        hasResponse: !!result,
        responseKeys:
          result && typeof result === 'object' ? Object.keys(result) : [],
      });

      return res.send(result);
    } catch (error) {
      req.log.error({
        msg: '❌ AI Chat error',
        reqId: req.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body,
        headers: req.headers,
      });
      throw error;
    }
  }
}
