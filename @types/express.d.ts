import { DiscountGroupModel, DiscountModel } from '@prisma/client';
import 'express';
import {
  InternalPlatformAccessKey,
  InternalPlatform,
  InternalPlatformUser,
} from 'openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      discountGroup: DiscountGroupModel;
      discount: DiscountModel;
      loggined: {
        platform: InternalPlatform;
        accessKey?: InternalPlatformAccessKey;
        user?: InternalPlatformUser;
      };
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        discountGroup: DiscountGroupModel;
        discount: DiscountModel;
      };
    }
  }
}
