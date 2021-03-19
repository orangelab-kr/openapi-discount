import { Router } from 'express';
import { OPCODE } from 'openapi-internal-sdk';
import Discount from '../../controllers/discount';
import DiscountGroup from '../../controllers/discountGroup';
import InternalDiscountMiddleware from '../../middlewares/internal/discount';
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
    '/',
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await DiscountGroup.modifyDiscountGroup(internal.discountGroup, body);
      res.json({ opcode: OPCODE.SUCCESS });
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

  router.post(
    '/:discountId',
    InternalDiscountMiddleware(),
    Wrapper(async (req, res) => {
      const { discount, discountGroup } = req.internal;
      await Discount.modifyDiscount(discountGroup, discount, req.body);
      res.json({ opcode: OPCODE.SUCCESS });
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
