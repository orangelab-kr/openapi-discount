import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

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

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw new InternalError(
        `${PERMISSION[permission]} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
