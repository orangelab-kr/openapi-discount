import { Database } from './tools';
import dotenv from 'dotenv';
import getRouter from './routes';
import serverless from 'serverless-http';
if (process.env.NODE_ENV === 'development') dotenv.config();

Database.initPrisma();
const options = { basePath: '/v1/discount' };
export const handler = serverless(getRouter(), options);
