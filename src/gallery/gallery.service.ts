import { Injectable } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async create(files: Array<Express.Multer.File>, uploadedBy: string, categoryId?: string) {
    const galleryEntries = files.map(file => ({
      path: file.path,
      fileName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy,
      categoryId,
    }));
    return this.prisma.gallery.createMany({
      data: galleryEntries,
    });
  }

  async findAll(categoryId?: string) {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const whereClause = categoryId ? { categoryId } : {};
    const gallery = await this.prisma.gallery.findMany({
      where: whereClause,
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });
    return gallery.map(item => ({
      ...item,
      url: `${baseUrl}/${item.path}`,
      uploadedByName: item.user.fullName,
    }));
  }

  findOne(id: string) {
    return this.prisma.gallery.findUnique({ where: { id } });
  }

  update(id: string, updateGalleryDto: UpdateGalleryDto) {
    return this.prisma.gallery.update({
      where: { id },
      data: updateGalleryDto,
    });
  }

  remove(id: string) {
    return this.prisma.gallery.delete({ where: { id } });
  }
}
