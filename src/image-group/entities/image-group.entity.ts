import { Gallery } from '../../gallery/entities/gallery.entity';

export class ImageGroup {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  galleries?: Gallery[];
}