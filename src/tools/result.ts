import { WrapperResult, WrapperResultLazyProps } from '.';

export function $_$(
  opcode: number,
  statusCode: number,
  message?: string,
  reportable?: boolean
): (props?: WrapperResultLazyProps) => WrapperResult {
  return (lazyOptions: WrapperResultLazyProps = {}) =>
    new WrapperResult({
      opcode,
      statusCode,
      message,
      reportable,
      ...lazyOptions,
    });
}

export const RESULT = {
  /** SAME ERRORS  */
  SUCCESS: $_$(0, 200),
  REQUIRED_ACCESS_KEY: $_$(-301, 401, 'REQUIRED_ACCESS_KEY'),
  EXPIRED_ACCESS_KEY: $_$(-302, 401, 'EXPIRED_ACCESS_KEY'),
  PERMISSION_DENIED: $_$(-303, 403, 'PERMISSION_DENIED'),
  REQUIRED_LOGIN: $_$(-304, 401, 'REQUIRED_LOGIN'),
  INVALID_ERROR: $_$(-305, 500, 'INVALID_ERROR', true),
  FAILED_VALIDATE: $_$(-306, 400, 'FAILED_VALIDATE'),
  INVALID_API: $_$(-307, 404, 'INVALID_API'),
  /** CUSTOM ERRORS  */
  EXPIRED_DISCOUNT: $_$(-308, 410, 'EXPIRED_DISCOUNT'),
  ALREADY_USED_DISCOUNT: $_$(-309, 409, 'ALREADY_USED_DISCOUNT'),
  ALREADY_USING_DISCOUMT: $_$(-310, 409, 'ALREADY_USING_DISCOUMT'),
  DISABLED_DISCOUNT_GROUP: $_$(-311, 409, 'DISABLED_DISCOUNT_GROUP'),
  LIMIT_EXCESS_DISCOUNT_GROUP: $_$(-312, 409, 'LIMIT_EXCESS_DISCOUNT_GROUP'),
  CANNOT_CANCEL_DISCOUNT: $_$(-313, 400, 'CANNOT_CANCEL_DISCOUNT'),
  INVALID_DISCOUNT_INFO: $_$(-314, 400, 'INVALID_DISCOUNT_INFO'),
  EXISTS_DISCOUNT_GROUP_NAME: $_$(-315, 409, 'EXISTS_DISCOUNT_GROUP_NAME'),
  CANNOT_FIND_DISCOUNT_GROUP: $_$(-316, 404, 'CANNOT_FIND_DISCOUNT_GROUP'),
  CANNOT_FIND_DISCOUNT: $_$(-317, 404, 'CANNOT_FIND_DISCOUNT'),
};
