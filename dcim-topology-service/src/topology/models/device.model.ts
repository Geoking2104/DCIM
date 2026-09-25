import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Device {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  model!: string;

  @Field(() => Int)
  startU!: number;

  @Field(() => Int)
  heightU!: number;
}
