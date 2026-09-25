import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImpactHop {
  @Field(() => ID)
  id!: string;

  @Field()
  kind!: string;

  @Field()
  label!: string;

  @Field(() => Int)
  hop!: number;
}

@ObjectType()
export class BlastRadius {
  @Field(() => ID)
  originId!: string;

  @Field(() => [ImpactHop])
  hops!: ImpactHop[];
}
