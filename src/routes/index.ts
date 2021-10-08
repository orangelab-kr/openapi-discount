import express, { Application } from 'express';
import {
  clusterInfo,
  getDiscountGroupRouter,
  getInternalRouter,
  InternalMiddleware,
  registerSentry,
  RESULT,
  Wrapper,
} from '..';

export * from './discountGroup';
export * from './internal';

export function getRouter(): Application {
  const router = express();
  registerSentry(router);

  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/discountGroups', getDiscountGroupRouter());
  router.get(
    '/',
    Wrapper(async () => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  return router;
}
