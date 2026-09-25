import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { KeycloakUser, rolesFromPayload, tenantsFromGroups } from './keycloak-user';

@Injectable()
export class KeycloakService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  issuer() {
    return (process.env.KEYCLOAK_ISSUER || '').replace(/\/$/, '');
  }

  enabled() {
    return Boolean(this.issuer()) && process.env.KEYCLOAK_OPTIONAL !== 'true';
  }

  private getJwks() {
    if (!this.jwks) {
      this.jwks = createRemoteJWKSet(new URL(`${this.issuer()}/protocol/openid-connect/certs`));
    }
    return this.jwks;
  }

  async verify(token?: string): Promise<KeycloakUser> {
    if (!token) throw new UnauthorizedException('Bearer token manquant');
    const audience = process.env.KEYCLOAK_AUDIENCE || 'qinode-graphql';
    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(token, this.getJwks(), {
        issuer: this.issuer(),
        audience,
      });
      payload = verified.payload;
    } catch (err) {
      try {
        const verified = await jwtVerify(token, this.getJwks(), { issuer: this.issuer() });
        payload = verified.payload;
        const aud = payload.aud;
        const list = Array.isArray(aud) ? aud : aud ? [aud] : [];
        const azp = String(payload.azp || '');
        if (!list.includes(audience) && azp !== 'qinode-web' && azp !== audience) {
          throw err;
        }
      } catch {
        throw new UnauthorizedException('JWT Keycloak invalide');
      }
    }
    const raw = payload as Record<string, unknown>;
    const groups = Array.isArray(raw.groups) ? raw.groups.map(String) : [];
    return {
      sub: String(payload.sub),
      email: payload.email ? String(payload.email) : undefined,
      preferred_username: payload.preferred_username ? String(payload.preferred_username) : undefined,
      roles: rolesFromPayload(raw),
      groups,
      tenants: tenantsFromGroups(groups),
      raw,
    };
  }
}
