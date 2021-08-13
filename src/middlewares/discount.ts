import dayjs from 'dayjs';
import { Callback, Discount, InternalError, OPCODE, Wrapper } from '..';

export function DiscountMiddleware(props?: {
  throwIfIsUsed?: boolean;
}): Callback {
  const { throwIfIsUsed } = { throwIfIsUsed: false, ...props };

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

    const discount = await Discount.getDiscountOrThrow(
      discountGroup,
      discountId
    );

    if (
      throwIfIsUsed &&
      discount.expiredAt &&
      dayjs(discount.expiredAt).isBefore(dayjs())
    ) {
      throw new InternalError(
        '만료된 할인은 사용할 수 없습니다.',
        OPCODE.ERROR
      );
    }

    req.discount = discount;
    await next();
  });
}
