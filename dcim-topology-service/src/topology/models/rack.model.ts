import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Device } from './device.model';

@ObjectType()
export class Rack {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  heightU!: number;

  @Field()
  siteId!: string;

  @Field(() => [Device], { nullable: 'itemsAndList' })
  devices?: Device[];
}
