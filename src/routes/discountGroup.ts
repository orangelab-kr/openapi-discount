import { Router } from 'express';
import { OPCODE } from 'openapi-internal-sdk';
import Discount from '../controllers/discount';
import { DiscountMiddleware } from '../middlewares';
import { Wrapper } from '../tools';

export default function getDiscountGroupRouter(): Router {
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
    Wrapper(async (req, res) => {
      const { discountGroup } = req;
      const { discountId } = await Discount.createDiscount(discountGroup);
      res.json({ opcode: OPCODE.SUCCESS, discountId });
    })
  );

  router.get(
    '/:discountId',
    DiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discount } = req;
      res.json({ opcode: OPCODE.SUCCESS, discount });
    })
  );

  router.delete(
    '/:discountId',
    DiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discount, discountGroup } = req;
      await Discount.deleteDiscount(discountGroup, discount);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
