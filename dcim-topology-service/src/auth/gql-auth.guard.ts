import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly keycloak: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.keycloak.enabled()) return true;
    const gql = GqlExecutionContext.create(context);
    const ctx = gql.getContext();
    const req = ctx.req || ctx;
    const header = req.headers?.authorization || req.headers?.Authorization || '';
    const token = String(header).replace(/^Bearer\s+/i, '');
    ctx.user = await this.keycloak.verify(token);
    const tenantHdr = req.headers?.['x-tenant'] || req.headers?.['X-Tenant'];
    if (tenantHdr) {
      const t = String(tenantHdr);
      const admin = ctx.user.roles.includes('qinode-admin');
      if (!admin && ctx.user.tenants.length && !ctx.user.tenants.includes(t)) {
        throw new UnauthorizedException(`Tenant ${t} hors périmètre`);
      }
      ctx.tenant = t;
    }
    return true;
  }
}
