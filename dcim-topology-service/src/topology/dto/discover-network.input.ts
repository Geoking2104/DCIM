import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class DiscoverNetworkInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  rackId!: string;

  @Field({ nullable: true, defaultValue: 'lldp-sim' })
  @IsOptional()
  @IsString()
  source?: string;
}
