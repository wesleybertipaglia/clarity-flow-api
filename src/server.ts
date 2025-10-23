import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import ErrorMiddleware from './middlewares/error.middleware';
import { aiRoutes } from './route/ai.route';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

declare const process: any;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const serverOptions = {
  logger: IS_PRODUCTION
    ? true
    : {
        transport: {
          target: 'pino-pretty',
          options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
      },
  disableRequestLogging: IS_PRODUCTION,
};

const server: FastifyInstance = fastify(serverOptions);

server.setErrorHandler(ErrorMiddleware.handle);

const baseRoute = '/api/v1';

server.register(
  async (fastifyScoped) => {
    await fastifyScoped.register(cors, {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-api-key'],
    });

    await fastifyScoped.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
    });

    fastifyScoped.register(aiRoutes, { prefix: '' });

    fastifyScoped.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
  },
  { prefix: baseRoute + '/ai' }
);

const start = async () => {
  try {
    const host = '0.0.0.0';
    await server.listen({ port: PORT, host });

    (server.log as any).info(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    (server.log as any).info('Server shutting down...');
    await server.close();
  } catch (err) {
    if (err instanceof Error) {
      (server.log as any).error('Error during shutdown');
    } else {
      (server.log as any).error('Unknown error during shutdown');
    }
  } finally {
    process.exit(0);
  }
};

(['SIGINT', 'SIGTERM', 'SIGTSTP'] as string[]).forEach((signal) => {
  process.on(signal, shutdown);
});

start();
