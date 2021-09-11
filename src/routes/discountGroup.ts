import { Router } from 'express';
import { OPCODE } from 'openapi-internal-sdk';
import {
  Discount,
  DiscountGroupMiddleware,
  DiscountMiddleware,
  PlatformMiddleware,
  Wrapper,
} from '..';

export function getDiscountGroupRouter(): Router {
  const router = Router();

  router.get(
    '/:discountGroupId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.view'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    Wrapper(async (req, res) => {
      const { discountGroup, query } = req;
      const { total, discounts } = await Discount.getDiscounts(
        discountGroup,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, discountGroup, discounts, total });
    })
  );

  router.get(
    '/:discountGroupId/generate',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.generate'],
      final: true,
    }),
    DiscountGroupMiddleware(),
    Wrapper(async (req, res) => {
      const { discountGroup } = req;
      const discount = await Discount.createDiscount(discountGroup);
      res.json({ opcode: OPCODE.SUCCESS, discount });
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
    Wrapper(async (req, res) => {
      const { discount } = req;
      res.json({ opcode: OPCODE.SUCCESS, discount });
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
    Wrapper(async (req, res) => {
      const { discount, discountGroup } = req;
      await Discount.deleteDiscount(discountGroup, discount);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
