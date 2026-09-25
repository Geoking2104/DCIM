import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateDeviceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  model!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  startU!: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  heightU!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  rackId!: string;
}
