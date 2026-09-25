import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class PatchRowInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  aDevice!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  aPort!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  bDevice!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  bPort!: string;
}

@InputType()
export class ImportPatchesInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  rackId!: string;

  @Field(() => [PatchRowInput])
  rows!: PatchRowInput[];
}
