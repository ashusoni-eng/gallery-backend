import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class ProfileUpdateDto {

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  username?: string;
}