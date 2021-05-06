import { Callback, DiscountGroup, InternalError, OPCODE, Wrapper } from '../..';

export function InternalDiscountGroupMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { discountGroupId } = req.params;
    if (!discountGroupId) {
      throw new InternalError(
        '해당 할인 그룹은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.discountGroup = await DiscountGroup.getDiscountGroupOrThrow(
      discountGroupId
    );

    await next();
  });
}
