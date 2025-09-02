import { PartialType } from '@nestjs/mapped-types';
import { CreateImageGroupDto } from './create-image-group.dto';

export class UpdateImageGroupDto extends PartialType(CreateImageGroupDto) {}
