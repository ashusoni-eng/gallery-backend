import { IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
  @IsOptional()
  @IsString()
  categoryId?: string;
}
