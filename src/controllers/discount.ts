import { DiscountGroupModel, DiscountModel, Prisma } from '.prisma/client';
import Joi from 'joi';
import moment from 'moment';
import { Database, InternalError, OPCODE, PATTERN } from '../tools';
import DiscountGroup from './discountGroup';

const { prisma } = Database;

export default class Discount {
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
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'usedAt',
        'expriedAt',
        'createdAt',
        'createdAt'
      ).default('createdAt'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.default('desc'),
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const { discountGroupId } = discountGroup;
    const where: Prisma.DiscountModelWhereInput = {
      discountGroup: { discountGroupId },
    };

    const orderBy: Prisma.DiscountModelOrderByInput = {
      [orderByField]: orderBySort,
    };

    if (search) where.discountId = { contains: search };
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

    const discount = await prisma.discountModel.findFirst({ where });
    return discount;
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
    props: { usedAt: Date }
  ): Promise<void> {
    const schema = Joi.object({
      usedAt: PATTERN.DISCOUNT.USED_AT.optional(),
    });

    const { discountId } = discount;
    const { discountGroupId } = discountGroup;
    const { usedAt } = await schema.validateAsync(props);
    await prisma.discountModel.updateMany({
      where: { discountId, discountGroup: { discountGroupId } },
      data: { usedAt },
    });
  }

  public static async createDiscount(
    discountGroup: DiscountGroupModel
  ): Promise<DiscountModel> {
    const {
      discountGroupId,
      enabled,
      remainingCount,
      validity,
    } = discountGroup;

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

    if (validity) data.expiredAt = moment().add(validity).toDate();
    const discount = await prisma.discountModel.create({ data });
    await DiscountGroup.decreseDiscountGroupRemainingCount(discountGroup);
    return discount;
  }

  public static async deleteDiscount(
    discountGroup: DiscountGroupModel,
    discount: DiscountModel
  ): Promise<void> {
    const { discountId } = discount;
    const { discountGroupId } = discountGroup;
    await prisma.discountModel.deleteMany({
      where: { discountId, discountGroup: { discountGroupId } },
    });
  }
}
