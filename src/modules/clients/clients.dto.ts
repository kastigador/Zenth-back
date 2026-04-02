import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsEmail,
  Min,
  Max,
  ArrayMaxSize,
  IsNotEmpty,
} from 'class-validator';
import { NotifyChannel } from './clients.types';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneE164?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  tags!: string[];

  @IsEnum(['whatsapp', 'telegram', 'both'])
  notifyChannel!: NotifyChannel;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneE164?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(['whatsapp', 'telegram', 'both'])
  notifyChannel?: NotifyChannel;

  @IsOptional()
  @IsString()
  telegramChatId?: string;
}

export class ListClientsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Transform(({ value }: { value: string | boolean }) => value === true || value === 'true')
  includeInactive?: boolean;
}

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
