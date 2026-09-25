import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class UpdateRackInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  heightU?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  siteId?: string;
}
