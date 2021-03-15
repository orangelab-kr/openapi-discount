import { Callback, Wrapper, logger } from '../tools';
import {
  InternalError,
  OPCODE,
  PlatformPermission,
} from 'openapi-internal-sdk';

import InternalClient from '../tools/internalClient';

export default function PlatformMiddleware(
  permissionIds: string[] = []
): Callback {
  const platformClient = InternalClient.getPlatform('system@hikick.kr', [
    PlatformPermission.ACCESS_KEYS_AUTHORIZE,
  ]);

  platformClient.baseURL = process.env.HIKICK_OPENAPI_PLATFORM_URL || '';
  return Wrapper(async (req, res, next) => {
    try {
      const { headers } = req;
      const platformAccessKeyId = `${headers['x-hikick-platform-access-key-id']}`;
      const platformSecretAccessKey = `${headers['x-hikick-platform-secret-access-key']}`;
      const accessKey = await platformClient.getPlatformFromAccessKey({
        platformAccessKeyId,
        platformSecretAccessKey,
        permissionIds,
      });

      req.accessKey = accessKey;
      next();
    } catch (err) {
      if (process.env.NODE_ENV === 'dev') {
        logger.error(err.message);
        logger.error(err.stack);
      }

      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERNAL_LOGIN
      );
    }
  });
}
