import { WrapperCallback, DiscountGroup, RESULT, Wrapper } from '../..';

export function InternalDiscountGroupMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { discountGroupId } = req.params;
    if (!discountGroupId) throw RESULT.CANNOT_FIND_DISCOUNT_GROUP();
    req.internal.discountGroup = await DiscountGroup.getDiscountGroupOrThrow(
      discountGroupId
    );

    await next();
  });
}
