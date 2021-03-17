import DiscountGroup from '../../controllers/discountGroup';
import { OPCODE } from 'openapi-internal-sdk';
import { Router } from 'express';
import { Wrapper } from '../../tools';

export default function getInternalRouter(): Router {
  const router = Router();

  // router.use(
  //   '/:discountGroupId',
  //   InternalDiscountGroupMiddleware(),
  //   getInternalDiscountGroupRouter()
  // );

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { total, discountGroups } = await DiscountGroup.getDiscountGroups(
        req.query
      );

      res.json({ opcode: OPCODE.SUCCESS, discountGroups, total });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { body } = req;
      const { discountGroupId } = await DiscountGroup.createDiscountGroup(body);
      res.json({ opcode: OPCODE.SUCCESS, discountGroupId });
    })
  );

  return router;
}
