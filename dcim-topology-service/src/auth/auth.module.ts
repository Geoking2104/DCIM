import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from './gql-auth.guard';
import { KeycloakService } from './keycloak.service';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [
    KeycloakService,
    GqlAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [KeycloakService, RolesGuard],
})
export class AuthModule {}
