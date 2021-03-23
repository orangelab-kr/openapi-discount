import express, { Application } from 'express';
import morgan from 'morgan';
import os from 'os';
import { DiscountGroupMiddleware, PlatformMiddleware } from '../middlewares';
import InternalMiddleware from '../middlewares/internal';
import InternalError from '../tools/error';
import logger from '../tools/logger';
import OPCODE from '../tools/opcode';
import Wrapper from '../tools/wrapper';
import getDiscountGroupRouter from './discountGroup';
import getInternalRouter from './internal';

export default function getRouter(): Application {
  const router = express();
  InternalError.registerSentry(router);

  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use(
    '/:discountGroupId',
    PlatformMiddleware(),
    DiscountGroupMiddleware(),
    getDiscountGroupRouter()
  );

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', 404);
    })
  );

  return router;
}
