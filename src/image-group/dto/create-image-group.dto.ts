import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateImageGroupDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageIds: string[];

  @IsString()
  groupName: string;
}
