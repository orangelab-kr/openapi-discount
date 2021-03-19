import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

import Discount from '../controllers/discount';

export default function DiscountMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      discountGroup,
      params: { discountId },
    } = req;

    if (!discountGroup || !discountId) {
      throw new InternalError(
        '해당 할인은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.discount = await Discount.getDiscountOrThrow(discountGroup, discountId);
    await next();
  });
}
