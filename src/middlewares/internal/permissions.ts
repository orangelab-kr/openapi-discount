import { WrapperCallback, RESULT, Wrapper } from '../..';

export enum PERMISSION {
  DISCOUNT_GROUP_LIST,
  DISCOUNT_GROUP_VIEW,
  DISCOUNT_GROUP_CREATE,
  DISCOUNT_GROUP_MODIFY,
  DISCOUNT_GROUP_DELETE,

  DISCOUNT_LIST,
  DISCOUNT_VIEW,
  DISCOUNT_CREATE,
  DISCOUNT_MODIFY,
  DISCOUNT_DELETE,
}

export function InternalPermissionMiddleware(
  permission: PERMISSION
): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw RESULT.PERMISSION_DENIED({ args: [PERMISSION[permission]] });
    }

    await next();
  });
}
