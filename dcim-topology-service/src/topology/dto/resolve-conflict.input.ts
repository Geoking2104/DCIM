import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ResolvePatchConflictInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  wantedAId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  wantedBId!: string;

  @Field()
  @IsIn(['keep', 'replace'])
  action!: 'keep' | 'replace';

  @Field({ nullable: true })
  via?: string;
}
