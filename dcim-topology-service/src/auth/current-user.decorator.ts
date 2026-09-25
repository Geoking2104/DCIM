import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { KeycloakUser } from './keycloak-user';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): KeycloakUser | undefined => {
  return GqlExecutionContext.create(context).getContext().user;
});
