import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WhoAmI {
  @Field()
  sub: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String])
  roles: string[];

  @Field(() => [String])
  groups: string[];

  @Field(() => [String])
  tenants: string[];
}
