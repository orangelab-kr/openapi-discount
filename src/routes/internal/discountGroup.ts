import { Router } from 'express';
import {
  Discount,
  DiscountGroup,
  InternalDiscountMiddleware,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalDiscountGroupRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req) => {
      const {
        internal: { discountGroup },
        query,
      } = req;

      const { total, discounts } = await Discount.getDiscounts(
        discountGroup,
        query
      );

      throw RESULT.SUCCESS({ details: { discountGroup, discounts, total } });
    })
  );

  router.post(
    '/',
    Wrapper(async (req) => {
      const { body, internal } = req;
      await DiscountGroup.modifyDiscountGroup(internal.discountGroup, body);
      throw RESULT.SUCCESS();
    })
  );

  router.get(
    '/generate',
    Wrapper(async (req) => {
      const { discountGroup } = req.internal;
      const discount = await Discount.createDiscount(discountGroup);
      throw RESULT.SUCCESS({ details: { discount } });
    })
  );

  router.get(
    '/:discountId',
    InternalDiscountMiddleware(),
    Wrapper(async (req) => {
      const { discount } = req.internal;
      throw RESULT.SUCCESS({ details: { discount } });
    })
  );

  router.post(
    '/:discountId',
    InternalDiscountMiddleware(),
    Wrapper(async (req) => {
      const { discount, discountGroup } = req.internal;
      await Discount.modifyDiscount(discountGroup, discount, req.body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:discountId',
    InternalDiscountMiddleware({ throwIfIsUsed: true }),
    Wrapper(async (req) => {
      const { discountGroup, discount } = req.internal;
      await Discount.deleteDiscount(discountGroup, discount);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/',
    Wrapper(async (req) => {
      const { discountGroup } = req.internal;
      await DiscountGroup.deleteDiscountGroup(discountGroup);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
