import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class MoveDeviceInput {
  @Field(() => ID)
  deviceId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  rackId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  startU!: number;
}
