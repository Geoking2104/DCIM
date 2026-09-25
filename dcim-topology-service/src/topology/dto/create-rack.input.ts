import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateRackInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  heightU!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  siteId!: string;
}
