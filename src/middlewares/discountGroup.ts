import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

import DiscountGroup from '../controllers/discountGroup';

export default function DiscountGroupMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { discountGroupId } = req.params;
    if (!discountGroupId) {
      throw new InternalError(
        '해당 할인 그룹은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const { platform } = req.loggined;
    req.discountGroup = await DiscountGroup.getDiscountGroupOrThrow(
      discountGroupId,
      platform
    );

    await next();
  });
}
