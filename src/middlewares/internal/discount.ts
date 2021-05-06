import { Callback, Discount, InternalError, OPCODE, Wrapper } from '../..';

export function InternalDiscountMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { discountGroup },
      params: { discountId },
    } = req;

    if (!discountGroup || !discountId) {
      throw new InternalError(
        '해당 할인은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.discount = await Discount.getDiscountOrThrow(
      discountGroup,
      discountId
    );

    await next();
  });
}
