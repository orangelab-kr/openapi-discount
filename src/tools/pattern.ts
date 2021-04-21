import Joi from './joi';

const PATTERN = {
  PAGINATION: {
    TAKE: Joi.number().default(10).optional(),
    SKIP: Joi.number().default(0).optional(),
    SEARCH: Joi.string().allow('').optional(),
    ORDER_BY: {
      FIELD: Joi.string().optional(),
      SORT: Joi.string().valid('asc', 'desc').default('asc').optional(),
    },
  },
  DISCOUNT_GROUP: {
    ID: Joi.string().uuid().required(),
    ENABLED: Joi.boolean().required(),
    NAME: Joi.string().min(2).max(16).required(),
    DESCRIPTION: Joi.string().default('').allow('').max(64).optional(),
    REMAINING_COUNT: Joi.number().min(0).optional(),
    RATIO_PRICE_DISCOUNT: Joi.number().optional(),
    STATIC_PRICE_DISCOUNT: Joi.number().optional(),
    STATIC_MINUTE_DISCOUNT: Joi.number().optional(),
    IS_SURCHARGE_INCLUDED: Joi.boolean().required(),
    IS_PER_MINUTE_PRICE_INCLUDED: Joi.boolean().required(),
    IS_STANDARD_PRICE_INCLUDED: Joi.boolean().required(),
    VALIDITY: Joi.number().optional(),
  },
  DISCOUNT: {
    ID: Joi.string().uuid().required(),
    IS_USED: Joi.boolean().required(),
    RATIO_PRICE_DISCOUNT: Joi.number().optional(),
    STATIC_PRICE_DISCOUNT: Joi.number().optional(),
    STATIC_MINUTE_DISCOUNT: Joi.number().optional(),
    IS_STANDARD_PRICE_INCLUDED: Joi.boolean().required(),
    USED_AT: Joi.date().allow(null).required(),
  },
  PLATFORM: {
    ID: Joi.string().uuid().required(),
  },
};

export default PATTERN;
