function createBodyChecker<Body>({
  schema,
}: {
  schema: ObjectSchema;
}): ControllerMethodPreRequestHandler<BodyCheckerOutput<Body>> {
  return async ({ request, errorHandler }) => {
    const objectUtil = useObjectUtility();
    const body: Body = request.body;
    const checkBody = objectUtil.compareWithSchema(body, schema, 'body');
    if (checkBody instanceof ObjectUtilityError) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, checkBody.message);
    }
    return {
      body: body as Body,
    };
  };
}

import { useObjectUtility } from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import type {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  ControllerMethodPreRequestHandler,
  HTTPStatus,
  ObjectSchema,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import type { BodyCheckerOutput, JWTProps } from '../types';

export function createBodyCheckerAndJwtChecker<Body>({
  schema,
  permission,
  roles,
}: {
  schema: ObjectSchema;
  roles: JWTRoleName[];
  permission: JWTPermissionName;
}): ControllerMethodPreRequestHandler<
  BodyCheckerOutput<Body> & {
    accessToken: JWTProps;
  }
> {
  const jwtPRH = createJwtProtectionPreRequestHandler<{ email: string }>(
    roles,
    permission
  );
  const bodyChecker = createBodyChecker<Body>({ schema });

  return async ({ request, errorHandler, logger, name, response }) => {
    const resultFromBodyChecker = await bodyChecker({
      request,
      errorHandler,
      logger,
      name,
      response,
    });
    const jwtResult = await jwtPRH({
      errorHandler,
      request,
      logger,
      name,
      response,
    });

    return {
      body: resultFromBodyChecker.body,
      accessToken: jwtResult.accessToken,
    };
  };
}
