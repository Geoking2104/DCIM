import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';
import { KeycloakUser } from './keycloak-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const needed = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!needed?.length) return true;
    const user = GqlExecutionContext.create(context).getContext().user as KeycloakUser | undefined;
    if (process.env.KEYCLOAK_OPTIONAL === 'true' && !user) return true;
    if (!user) throw new ForbiddenException('Utilisateur Keycloak absent');
    if (user.roles.includes('qinode-admin')) return true;
    if (needed.some((r) => user.roles.includes(r))) return true;
    throw new ForbiddenException(`Rôles requis : ${needed.join(', ')}`);
  }
}
