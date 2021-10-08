import { DiscountGroup, RESULT, Wrapper, WrapperCallback } from '..';

export function DiscountGroupMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { discountGroupId } = req.params;
    if (!discountGroupId) throw RESULT.CANNOT_FIND_DISCOUNT_GROUP();
    const { platform } = req.loggined;
    req.discountGroup = await DiscountGroup.getDiscountGroupOrThrow(
      discountGroupId,
      platform
    );

    await next();
  });
}
