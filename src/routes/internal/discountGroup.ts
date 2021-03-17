import Discount from '../../controllers/discount';
import DiscountGroup from '../../controllers/discountGroup';
import InternalDiscountMiddleware from '../../middlewares/internal/discount';
import { OPCODE } from 'openapi-internal-sdk';
import { Router } from 'express';
import { Wrapper } from '../../tools';

export default function getInternalDiscountGroupRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { discountGroup } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, discountGroup });
    })
  );

  router.post(
    '/generate',
    Wrapper(async (req, res) => {
      const { discountGroup } = req.internal;
      const { discountId } = await Discount.createDiscount(discountGroup);
      res.json({ opcode: OPCODE.SUCCESS, discountId });
    })
  );

  router.get(
    '/:discountId',
    InternalDiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discount } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, discount });
    })
  );

  router.delete(
    '/:discountId',
    InternalDiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discountGroup, discount } = req.internal;
      await Discount.deleteDiscount(discountGroup, discount);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/',
    Wrapper(async (req, res) => {
      const { discountGroup } = req.internal;
      await DiscountGroup.deleteDiscountGroup(discountGroup);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
