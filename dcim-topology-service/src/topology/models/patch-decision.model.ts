import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PatchDecision {
  @Field(() => ID)
  id!: string;

  @Field()
  action!: string;

  @Field()
  actor!: string;

  @Field()
  at!: string;

  @Field()
  aId!: string;

  @Field()
  bId!: string;
}
