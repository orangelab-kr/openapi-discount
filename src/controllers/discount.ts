import { DiscountGroupModel, DiscountModel, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { DiscountGroup, Joi, PATTERN, prisma, RESULT } from '..';

export class Discount {
  public static async getDiscounts(
    discountGroup: DiscountGroupModel,
    props: {
      take?: number;
      skip?: number;
      search?: number;
      orderByField?: 'usedAt' | 'expiredAt' | 'createdAt';
      orderBySort?: 'asc' | 'desc';
    }
  ): Promise<{ total: number; discounts: DiscountModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE.default(0),
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      showUsed: PATTERN.DISCOUNT.SHOW_USED,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'usedAt',
        'expriedAt',
        'createdAt',
        'updatedAt'
      ).default('createdAt'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.default('desc'),
    });

    const { take, skip, search, orderByField, orderBySort, showUsed } =
      await schema.validateAsync(props);
    const { discountGroupId } = discountGroup;
    const where: Prisma.DiscountModelWhereInput = {
      discountGroup: { discountGroupId },
    };

    const orderBy = { [orderByField]: orderBySort };
    if (search) where.discountId = { contains: search };
    if (!showUsed) where.lockedAt = null;
    const [total, discounts] = await prisma.$transaction([
      prisma.discountModel.count({ where }),
      prisma.discountModel.findMany({ take, skip, where, orderBy }),
    ]);

    return { total, discounts };
  }

  public static async getDiscount(
    discountGroup: DiscountGroupModel,
    discountId: string
  ): Promise<DiscountModel | null> {
    const { discountGroupId } = discountGroup;
    const where: Prisma.DiscountModelWhereInput = {
      discountId,
      discountGroup: { discountGroupId },
    };

    const include: Prisma.DiscountModelInclude = { discountGroup: true };
    return prisma.discountModel.findFirst({ where, include });
  }

  public static async getDiscountOrThrow(
    discountGroup: DiscountGroupModel,
    discountId: string
  ): Promise<DiscountModel> {
    const discount = await Discount.getDiscount(discountGroup, discountId);
    if (!discount) throw RESULT.CANNOT_FIND_DISCOUNT();
    return discount;
  }

  public static async modifyDiscount(
    discountGroup: DiscountGroupModel,
    discount: DiscountModel,
    props: { usedAt: Date; lockedAt: Date }
  ): Promise<void> {
    const schema = Joi.object({
      usedAt: PATTERN.DISCOUNT.USED_AT.optional(),
      lockedAt: PATTERN.DISCOUNT.LOCKED_AT.optional(),
    });

    const { usedAt, lockedAt } = await schema.validateAsync(props);
    if (
      lockedAt &&
      discount.expiredAt &&
      dayjs(lockedAt).isAfter(dayjs(discount.expiredAt))
    )
      throw RESULT.EXPIRED_DISCOUNT();

    const { discountId } = discount;
    if (discount.usedAt && usedAt) throw RESULT.ALREADY_USED_DISCOUNT();
    if (discount.lockedAt && lockedAt) throw RESULT.ALREADY_USING_DISCOUMT();
    const { discountGroupId } = discountGroup;
    await prisma.discountModel.updateMany({
      where: { discountId, discountGroup: { discountGroupId } },
      data: { usedAt, lockedAt },
    });
  }

  public static async createDiscount(
    discountGroup: DiscountGroupModel
  ): Promise<DiscountModel> {
    const { discountGroupId, enabled, remainingCount, validity } =
      discountGroup;

    if (!enabled) throw RESULT.DISABLED_DISCOUNT_GROUP();
    if (remainingCount !== null && remainingCount <= 0) {
      throw RESULT.LIMIT_EXCESS_DISCOUNT_GROUP();
    }

    const data: Prisma.DiscountModelCreateInput = {
      discountGroup: { connect: { discountGroupId } },
    };

    if (validity) data.expiredAt = dayjs().add(validity, 's').toDate();
    const include: Prisma.DiscountModelInclude = { discountGroup: true };
    const discount = await prisma.discountModel.create({ data, include });
    await DiscountGroup.decreseDiscountGroupRemainingCount(discountGroup);
    return discount;
  }

  public static async deleteDiscount(
    discountGroup: DiscountGroupModel,
    discount: DiscountModel
  ): Promise<void> {
    const { discountId, usedAt, lockedAt, expiredAt } = discount;
    const { discountGroupId } = discountGroup;
    if (
      usedAt ||
      lockedAt ||
      (expiredAt && dayjs(expiredAt).isBefore(dayjs()))
    ) {
      throw RESULT.CANNOT_CANCEL_DISCOUNT();
    }

    await DiscountGroup.increaseDiscountGroupRemainingCount(discountGroup);
    await prisma.discountModel.deleteMany({
      where: { discountId, discountGroup: { discountGroupId } },
    });
  }
}
