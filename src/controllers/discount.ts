import { DiscountGroup, InternalError, Joi, OPCODE, PATTERN } from '..';
import { DiscountGroupModel, DiscountModel, Prisma } from '@prisma/client';

import { Database } from '../tools';
import dayjs from 'dayjs';

const { prisma } = Database;

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

    const orderBy: Prisma.DiscountModelOrderByInput = {
      [orderByField]: orderBySort,
    };

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
    if (!discount) {
      throw new InternalError(
        '해당 할인은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

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
      lockedAt !== null &&
      discount.expiredAt !== null &&
      dayjs(lockedAt).isAfter(dayjs(discount.expiredAt))
    ) {
      throw new InternalError(
        '할인이 만료되어 사용할 수 없습니다.',
        OPCODE.ERROR
      );
    }

    const { discountId } = discount;
    if (discount.usedAt && usedAt) {
      throw new InternalError('이미 사용한 할인입니다.', OPCODE.ERROR);
    }

    if (discount.lockedAt && lockedAt) {
      throw new InternalError('이미 사용중인 할인입니다.', OPCODE.ERROR);
    }

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

    if (!enabled) {
      throw new InternalError('사용할 수 없는 할인 그룹입니다.', OPCODE.ERROR);
    }

    if (remainingCount !== null && remainingCount <= 0) {
      throw new InternalError(
        '할인 그룹의 발급 횟수를 초과하였습니다.',
        OPCODE.EXCESS_LIMITS
      );
    }

    const data: Prisma.DiscountModelCreateInput = {
      discountGroup: { connect: { discountGroupId } },
    };

    if (validity) data.expiredAt = dayjs().add(validity).toDate();
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
      throw new InternalError(
        '이미 사용되었거나 만료된 할인은 취소할 수 없습니다.',
        OPCODE.ERROR
      );
    }

    await DiscountGroup.increaseDiscountGroupRemainingCount(discountGroup);
    await prisma.discountModel.deleteMany({
      where: { discountId, discountGroup: { discountGroupId } },
    });
  }
}
