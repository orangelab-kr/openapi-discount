import dayjs from 'dayjs';
import { Discount, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalDiscountMiddleware(props?: {
  throwIfIsUsed?: boolean;
  throwIfIsExpired?: boolean;
}): WrapperCallback {
  const { throwIfIsUsed, throwIfIsExpired } = {
    throwIfIsUsed: false,
    throwIfIsExpired: false,
    ...props,
  };

  return Wrapper(async (req, res, next) => {
    const {
      internal: { discountGroup },
      params: { discountId },
    } = req;

    if (!discountGroup || !discountId) throw RESULT.CANNOT_FIND_DISCOUNT();
    const discount = await Discount.getDiscountOrThrow(
      discountGroup,
      discountId
    );

    if (
      throwIfIsExpired &&
      discount.expiredAt &&
      dayjs(discount.expiredAt).isBefore(dayjs())
    ) {
      throw RESULT.EXPIRED_DISCOUNT();
    }

    if (throwIfIsUsed && discount.usedAt) throw RESULT.ALREADY_USED_DISCOUNT();
    req.internal.discount = discount;
    await next();
  });
}
