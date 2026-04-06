import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMyAvatarDto {
  @IsString()
  @MinLength(1)
  avatarUrl!: string;
}

export class UploadMyAvatarDto {
  @IsString()
  @MinLength(8)
  base64!: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
