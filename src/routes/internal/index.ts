import { Router } from 'express';
import {
  DiscountGroup,
  getInternalDiscountGroupRouter,
  InternalDiscountGroupMiddleware,
  RESULT,
  Wrapper,
} from '../..';

export * from './discountGroup';
export function getInternalRouter(): Router {
  const router = Router();

  router.use(
    '/:discountGroupId',
    InternalDiscountGroupMiddleware(),
    getInternalDiscountGroupRouter()
  );

  router.get(
    '/',
    Wrapper(async (req) => {
      const { total, discountGroups } = await DiscountGroup.getDiscountGroups(
        req.query
      );

      throw RESULT.SUCCESS({ details: { discountGroups, total } });
    })
  );

  router.post(
    '/',
    Wrapper(async (req) => {
      const { body } = req;
      const { discountGroupId } = await DiscountGroup.createDiscountGroup(body);
      throw RESULT.SUCCESS({ details: { discountGroupId } });
    })
  );

  return router;
}
