import { Discount, DiscountMiddleware, PlatformMiddleware, Wrapper } from '..';

import { OPCODE } from 'openapi-internal-sdk';
import { Router } from 'express';

export function getDiscountGroupRouter(): Router {
  const router = Router();

  router.get(
    '/',
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
    '/generate',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.generate'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const { discountGroup } = req;
      const discount = await Discount.createDiscount(discountGroup);
      res.json({ opcode: OPCODE.SUCCESS, discount });
    })
  );

  router.get(
    '/:discountId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.view'],
      final: true,
    }),
    DiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discount } = req;
      res.json({ opcode: OPCODE.SUCCESS, discount });
    })
  );

  router.delete(
    '/:discountId',
    PlatformMiddleware({
      permissionIds: ['discountGroups.discount.revoke'],
      final: true,
    }),
    DiscountMiddleware({ throwIfIsUsed: true }),
    Wrapper(async (req, res) => {
      const { discount, discountGroup } = req;
      await Discount.deleteDiscount(discountGroup, discount);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
