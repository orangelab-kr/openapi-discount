import cors from 'cors';
import express from 'express';
import { InternalError, OPCODE } from 'openapi-internal-sdk';
import serverless from 'serverless-http';
import { Database, getRouter, LoggerMiddleware, Wrapper } from '.';

export * from './controllers';
export * from './middlewares';
export * from './routes';
export * from './tools';

const app = express();
Database.initPrisma();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware());
app.use('/', getRouter());
app.all(
  '*',
  Wrapper(async () => {
    throw new InternalError('Invalid API', OPCODE.ERROR);
  })
);

const options = { basePath: '/v1/discount' };
export const handler = serverless(app, options);
