import { Router } from 'express';
import {
  Discount,
  DiscountGroup,
  DiscountGroupMiddleware,
  DiscountMiddleware,
  PlatformMiddleware,
  RESULT,
  Wrapper,
} from '..';

export function getDiscountGroupRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({
      permissionIds: ['discountGroups.list'],
      final: true,
    }),
    Wrapper(async (req) => {
      const { platformId } = req.loggined.platform;
      const { total, discountGroups } = await DiscountGroup.getDiscountGroups({
        ...req.query,
        platformId,
      });

      throw RESULT.SUCCESS({ details: { discountGroups, total } });
    })
  );

  router.get(
    '/:discountGroupId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.view'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    Wrapper(async (req) => {
      const { discountGroup, query } = req;
      const { total, discounts } = await Discount.getDiscounts(
        discountGroup,
        query
      );

      throw RESULT.SUCCESS({ details: { discountGroup, discounts, total } });
    })
  );

  router.get(
    '/:discountGroupId/generate',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.generate'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    Wrapper(async (req) => {
      const { discountGroup } = req;
      const discount = await Discount.createDiscount(discountGroup);
      throw RESULT.SUCCESS({ details: { discount } });
    })
  );

  router.get(
    '/:discountGroupId/:discountId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.view'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    DiscountMiddleware(),
    Wrapper(async (req) => {
      const { discount } = req;
      throw RESULT.SUCCESS({ details: { discount } });
    })
  );

  router.delete(
    '/:discountGroupId/:discountId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.revoke'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    DiscountMiddleware({ throwIfIsUsed: true }),
    Wrapper(async (req) => {
      const { discount, discountGroup } = req;
      await Discount.deleteDiscount(discountGroup, discount);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
