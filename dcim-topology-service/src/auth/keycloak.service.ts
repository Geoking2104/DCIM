import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { KeycloakUser, rolesFromPayload, tenantsFromGroups } from './keycloak-user';

@Injectable()
export class KeycloakService {
  private readonly log = new Logger(KeycloakService.name);
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  issuer() {
    return (process.env.KEYCLOAK_ISSUER || '').replace(/\/$/, '');
  }

  audience() {
    return process.env.KEYCLOAK_AUDIENCE || 'qinode-graphql';
  }

  jwksUri() {
    if (process.env.KEYCLOAK_JWKS_URI) return process.env.KEYCLOAK_JWKS_URI;
    const iss = this.issuer();
    return iss ? `${iss}/protocol/openid-connect/certs` : '';
  }

  enabled() {
    return Boolean(this.issuer()) && process.env.KEYCLOAK_OPTIONAL !== 'true';
  }

  private getJwks() {
    if (!this.jwks) {
      const uri = this.jwksUri();
      if (!uri) throw new UnauthorizedException('KEYCLOAK_JWKS_URI / ISSUER manquant');
      this.log.log(`JWKS ${uri} aud=${this.audience()}`);
      this.jwks = createRemoteJWKSet(new URL(uri), {
        cooldownDuration: Number(process.env.KEYCLOAK_JWKS_COOLDOWN_MS || 30_000),
        cacheMaxAge: Number(process.env.KEYCLOAK_JWKS_CACHE_MS || 600_000),
      });
    }
    return this.jwks;
  }

  private audienceOk(payload: JWTPayload): boolean {
    const want = this.audience();
    const aud = payload.aud;
    const list = Array.isArray(aud) ? aud : aud ? [aud] : [];
    if (list.includes(want)) return true;
    const azp = String(payload.azp || '');
    const acceptAzp = (process.env.KEYCLOAK_ACCEPT_AZP || 'qinode-web').split(',').filter(Boolean);
    return process.env.KEYCLOAK_REQUIRE_AUD === 'false' && acceptAzp.includes(azp);
  }

  async verify(token?: string): Promise<KeycloakUser> {
    if (!token) throw new UnauthorizedException('Bearer token manquant');
    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(token, this.getJwks(), {
        issuer: this.issuer(),
        clockTolerance: Number(process.env.KEYCLOAK_CLOCK_TOLERANCE || 5),
      });
      payload = verified.payload;
    } catch {
      throw new UnauthorizedException('JWT Keycloak invalide (signature / iss)');
    }
    if (!this.audienceOk(payload)) {
      throw new UnauthorizedException(`Audience refusée (attendu ${this.audience()})`);
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
