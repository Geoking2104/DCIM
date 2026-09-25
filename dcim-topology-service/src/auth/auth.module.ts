import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from './gql-auth.guard';
import { KeycloakService } from './keycloak.service';

@Module({
  providers: [
    KeycloakService,
    GqlAuthGuard,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
  ],
  exports: [KeycloakService],
})
export class AuthModule {}
