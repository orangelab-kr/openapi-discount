import express, { Application } from 'express';
import {
  clusterInfo,
  DiscountGroupMiddleware,
  getDiscountGroupRouter,
  getInternalRouter,
  InternalError,
  InternalMiddleware,
  OPCODE,
  PlatformMiddleware,
  Wrapper,
} from '..';

export * from './discountGroup';
export * from './internal';

export function getRouter(): Application {
  const router = express();
  InternalError.registerSentry(router);

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
        ...clusterInfo,
      });
    })
  );

  return router;
}
