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
        category: {
          select: { categoryName: true, description: true },
        },
      },
    });
    return gallery.map(item => ({
      ...item,
      url: `${baseUrl}/${item.path}`,
      uploadedByName: item.user.fullName,
      categoryName: item.category?.categoryName || 'N/A',
      categoryDescription: item.category?.description || 'N/A',
    }));
  }

  async findAllPaginated(page: number, limit: number) {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const skip = (page - 1) * limit;
    const gallery = await this.prisma.gallery.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { fullName: true },
        },
        category: {
          select: { categoryName: true, description: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.gallery.count();

    return {
      data: gallery.map(item => ({
        ...item,
        url: `${baseUrl}/${item.path}`,
        uploadedByName: item.user.fullName,
        categoryName: item.category?.categoryName || 'N/A',
        categoryDescription: item.category?.description || 'N/A',
      })),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
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

  async countAllImages(): Promise<number> {
    return this.prisma.gallery.count();
  }
}
