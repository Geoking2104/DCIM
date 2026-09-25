import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Port {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  speed?: string;

  @Field({ nullable: true })
  deviceId?: string;
}

@ObjectType()
export class NetworkLink {
  @Field(() => ID)
  id!: string;

  @Field()
  via!: string;

  @Field(() => Port)
  a!: Port;

  @Field(() => Port)
  b!: Port;
}

@ObjectType()
export class DiscoveryReport {
  @Field()
  rackId!: string;

  @Field()
  source!: string;

  @Field()
  portsCreated!: number;

  @Field()
  linksCreated!: number;

  @Field(() => [NetworkLink])
  links!: NetworkLink[];
}
