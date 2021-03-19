import { DiscountGroupModel, Prisma } from '.prisma/client';
import { InternalPlatform, PlatformPermission } from 'openapi-internal-sdk';
import {
  Database,
  InternalClient,
  InternalError,
  Joi,
  OPCODE,
  PATTERN,
} from '../tools';

const { prisma } = Database;

export default class DiscountGroup {
  public static async getDiscountGroup(
    discountGroupId: string,
    platform?: InternalPlatform
  ): Promise<DiscountGroupModel | null> {
    const where: Prisma.DiscountGroupModelWhereInput = { discountGroupId };
    if (platform) where.platformId = platform.platformId;

    const discountGroup = await prisma.discountGroupModel.findFirst({ where });
    return discountGroup;
  }

  public static async modifyDiscountGroup(
    discountGroup: DiscountGroupModel,
    props: {
      enabled: boolean;
      name: string;
      description?: string;
      remainingCount?: number;
      platformId: string;
      ratioPriceDiscount?: number;
      staticPriceDiscount?: number;
      staticMinuteDiscount?: number;
      isStandardPriceIncluded: boolean;
      isPenaltyIncluded: boolean;
      validity?: number;
    }
  ): Promise<void> {
    const schema = Joi.object({
      enabled: PATTERN.DISCOUNT_GROUP.ENABLED.optional(),
      name: PATTERN.DISCOUNT_GROUP.NAME.optional(),
      description: PATTERN.DISCOUNT_GROUP.DESCRIPTION.optional(),
      remainingCount: PATTERN.DISCOUNT_GROUP.REMAINING_COUNT.optional(),
      platformId: PATTERN.PLATFORM.ID.optional(),
      ratioPriceDiscount: PATTERN.DISCOUNT_GROUP.RATIO_PRICE_DISCOUNT.optional(),
      staticPriceDiscount: PATTERN.DISCOUNT_GROUP.STATIC_PRICE_DISCOUNT.optional(),
      staticMinuteDiscount: PATTERN.DISCOUNT_GROUP.STATIC_MINUTE_DISCOUNT.optional(),
      isPenaltyIncluded: PATTERN.DISCOUNT_GROUP.IS_PENALTY_INCLUDED.optional(),
      isStandardPriceIncluded: PATTERN.DISCOUNT_GROUP.IS_STANDARD_PRICE_INCLUDED.optional(),
      validity: PATTERN.DISCOUNT_GROUP.VALIDITY.optional(),
    });

    const {
      enabled,
      name,
      description,
      remainingCount,
      platformId,
      ratioPriceDiscount,
      staticPriceDiscount,
      staticMinuteDiscount,
      isPenaltyIncluded,
      isStandardPriceIncluded,
      validity,
    } = await schema.validateAsync(props);
    if (
      ratioPriceDiscount === undefined &&
      discountGroup.ratioPriceDiscount === null &&
      staticPriceDiscount === undefined &&
      discountGroup.staticPriceDiscount === null &&
      staticMinuteDiscount === undefined &&
      discountGroup.staticMinuteDiscount === null
    ) {
      throw new InternalError(
        '비율 금액, 정적 금액, 정적 시간 중 하나를 입력해야 합니다.',
        OPCODE.ERROR
      );
    }

    if (name && name !== discountGroup.name) {
      const exists = await DiscountGroup.getDiscountGroupByName(name);
      if (exists) {
        throw new InternalError(
          '해당 이름과 동일한 할인 그룹이 존재합니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    if (platformId && platformId !== discountGroup.platformId) {
      await InternalClient.getPlatform([
        PlatformPermission.PLATFORMS_VIEW,
      ]).getPlatform(platformId);
    }

    const { discountGroupId } = discountGroup;
    await prisma.discountGroupModel.updateMany({
      where: { discountGroupId },
      data: {
        enabled,
        name,
        description,
        remainingCount,
        platformId,
        ratioPriceDiscount,
        staticPriceDiscount,
        staticMinuteDiscount,
        isPenaltyIncluded,
        isStandardPriceIncluded,
        validity,
      },
    });
  }

  public static async getDiscountGroupOrThrow(
    discountGroupId: string,
    platform?: InternalPlatform
  ): Promise<DiscountGroupModel> {
    const discountGroup = await DiscountGroup.getDiscountGroup(
      discountGroupId,
      platform
    );

    if (!discountGroup) {
      throw new InternalError(
        '해당 할인 그룹은 존재하지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return discountGroup;
  }

  public static async getDiscountGroups(props: {
    take?: number;
    skip?: number;
    search?: number;
    orderByField?: 'enabled' | 'name' | 'remainingCount' | 'createdAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; discountGroups: DiscountGroupModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'enabled',
        'name',
        'remainingCount',
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
    const where: Prisma.DiscountGroupModelWhereInput = {};
    const orderBy: Prisma.DiscountGroupModelOrderByInput = {
      [orderByField]: orderBySort,
    };

    if (search) {
      where.OR = [
        { discountGroupId: { contains: search } },
        { name: { contains: search } },
        { description: { contains: search } },
        { platformId: { contains: search } },
      ];
    }

    const [total, discountGroups] = await prisma.$transaction([
      prisma.discountGroupModel.count({ where }),
      prisma.discountGroupModel.findMany({ take, skip, where, orderBy }),
    ]);

    return { total, discountGroups };
  }

  public static async createDiscountGroup(props: {
    enabled: boolean;
    name: string;
    description?: string;
    remainingCount?: number;
    platformId: string;
    ratioPriceDiscount?: number;
    staticPriceDiscount?: number;
    staticMinuteDiscount?: number;
    isPenaltyIncluded: boolean;
    isStandardPriceIncluded: boolean;
    validity?: number;
  }): Promise<DiscountGroupModel> {
    const schema = Joi.object({
      enabled: PATTERN.DISCOUNT_GROUP.ENABLED,
      name: PATTERN.DISCOUNT_GROUP.NAME,
      description: PATTERN.DISCOUNT_GROUP.DESCRIPTION,
      remainingCount: PATTERN.DISCOUNT_GROUP.REMAINING_COUNT,
      platformId: PATTERN.PLATFORM.ID,
      ratioPriceDiscount: PATTERN.DISCOUNT_GROUP.RATIO_PRICE_DISCOUNT,
      staticPriceDiscount: PATTERN.DISCOUNT_GROUP.STATIC_PRICE_DISCOUNT,
      staticMinuteDiscount: PATTERN.DISCOUNT_GROUP.STATIC_MINUTE_DISCOUNT,
      isPenaltyIncluded: PATTERN.DISCOUNT_GROUP.IS_PENALTY_INCLUDED,
      isStandardPriceIncluded:
        PATTERN.DISCOUNT_GROUP.IS_STANDARD_PRICE_INCLUDED,
      validity: PATTERN.DISCOUNT_GROUP.VALIDITY,
    });

    const {
      enabled,
      name,
      description,
      remainingCount,
      platformId,
      ratioPriceDiscount,
      staticPriceDiscount,
      staticMinuteDiscount,
      isPenaltyIncluded,
      isStandardPriceIncluded,
      validity,
    } = await schema.validateAsync(props);
    if (
      ratioPriceDiscount === undefined &&
      staticPriceDiscount === undefined &&
      staticMinuteDiscount === undefined
    ) {
      throw new InternalError(
        '비율 금액, 정적 금액, 정적 시간 중 하나를 입력해야 합니다.',
        OPCODE.ERROR
      );
    }

    const [exists] = await Promise.all([
      DiscountGroup.getDiscountGroupByName(name),
      InternalClient.getPlatform([
        PlatformPermission.PLATFORMS_VIEW,
      ]).getPlatform(platformId),
    ]);

    if (exists) {
      throw new InternalError(
        '해당 이름과 동일한 할인 그룹이 존재합니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const discountGroup = await prisma.discountGroupModel.create({
      data: {
        enabled,
        name,
        description,
        remainingCount,
        platformId,
        ratioPriceDiscount,
        staticPriceDiscount,
        staticMinuteDiscount,
        isPenaltyIncluded,
        isStandardPriceIncluded,
        validity,
      },
    });

    return discountGroup;
  }

  public static async getDiscountGroupByName(
    name: string
  ): Promise<DiscountGroupModel | null> {
    const discountGroup = await prisma.discountGroupModel.findFirst({
      where: { name },
    });

    return discountGroup;
  }

  public static async decreseDiscountGroupRemainingCount(
    discountGroup: DiscountGroupModel
  ): Promise<void> {
    const { discountGroupId } = discountGroup;
    await prisma.discountGroupModel.update({
      where: { discountGroupId },
      data: { remainingCount: { decrement: 1 } },
    });
  }

  public static async deleteDiscountGroup(
    discountGroup: DiscountGroupModel
  ): Promise<void> {
    const { discountGroupId } = discountGroup;
    await prisma.discountModel.deleteMany({
      where: { discountGroup: { discountGroupId } },
    });

    await prisma.discountGroupModel.deleteMany({
      where: { discountGroupId },
    });
  }
}
